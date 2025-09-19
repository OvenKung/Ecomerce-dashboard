import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Default settings structure for initialization
const defaultSettings = {
  store: {
    name: 'ร้านค้าออนไลน์',
    description: 'ร้านขายเครื่องใช้ไฟฟ้าและอิเล็กทรอนิกส์',
    email: 'contact@store.com',
    phone: '02-123-4567',
    address: '123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110',
    website: 'https://store.com',
    logo: null,
    currency: 'THB',
    timezone: 'Asia/Bangkok',
    language: 'th'
  },
  notifications: {
    emailNotifications: true,
    orderNotifications: true,
    inventoryAlerts: true,
    customerNotifications: false,
    marketingEmails: true,
    systemUpdates: true,
    lowStockThreshold: 10,
    emailTemplate: 'default'
  },
  payment: {
    enableCreditCard: true,
    enableBankTransfer: true,
    enablePromptPay: true,
    enableCOD: false,
    paymentMethods: [
      { id: 'credit_card', name: 'บัตรเครดิต/เดบิต', enabled: true },
      { id: 'bank_transfer', name: 'โอนเงินผ่านธนาคาร', enabled: true },
      { id: 'promptpay', name: 'พร้อมเพย์', enabled: true },
      { id: 'cod', name: 'เก็บเงินปลายทาง', enabled: false }
    ],
    taxRate: 7.0,
    shippingFee: 50
  },
  shipping: {
    freeShippingThreshold: 1000,
    defaultShippingFee: 50,
    expressShippingFee: 100,
    shippingZones: [
      { id: 'bangkok', name: 'กรุงเทพฯ และปริมณฑล', fee: 50 },
      { id: 'central', name: 'ภาคกลาง', fee: 80 },
      { id: 'north', name: 'ภาคเหนือ', fee: 120 },
      { id: 'northeast', name: 'ภาคอีสาน', fee: 120 },
      { id: 'south', name: 'ภาคใต้', fee: 150 }
    ],
    estimatedDelivery: {
      standard: '3-5 วันทำการ',
      express: '1-2 วันทำการ'
    }
  },
  security: {
    enableTwoFactor: false,
    sessionTimeout: 24,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false
    },
    allowedLoginAttempts: 5,
    lockoutDuration: 30
  },
  api: {
    enableAPI: true,
    apiKeys: [],
    rateLimit: 1000,
    webhookUrl: ''
  }
};

async function getSettings() {
  // Try to get settings from database
  const settings = await prisma.setting.findMany();
  
  // Convert array of settings to object structure
  const settingsObject: any = {};
  
  for (const setting of settings) {
    const keys = setting.key.split('.');
    let current = settingsObject;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    // Parse JSON values if they exist
    try {
      current[keys[keys.length - 1]] = JSON.parse(setting.value);
    } catch {
      current[keys[keys.length - 1]] = setting.value;
    }
  }
  
  // Merge with defaults for any missing settings
  return mergeWithDefaults(settingsObject, defaultSettings);
}

function mergeWithDefaults(current: any, defaults: any): any {
  const result = { ...defaults };
  
  for (const key in current) {
    if (typeof current[key] === 'object' && current[key] !== null && !Array.isArray(current[key])) {
      result[key] = mergeWithDefaults(current[key], defaults[key] || {});
    } else {
      result[key] = current[key];
    }
  }
  
  return result;
}

async function updateSettings(section: string, data: any) {
  // Flatten the data object into key-value pairs
  const flattenObject = (obj: any, prefix = '') => {
    const flattened: { [key: string]: string } = {};
    
    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(flattened, flattenObject(obj[key], fullKey));
      } else {
        flattened[fullKey] = JSON.stringify(obj[key]);
      }
    }
    
    return flattened;
  };
  
  const sectionData = { [section]: data };
  const flattenedData = flattenObject(sectionData);
  
  // Update or create settings in database
  for (const [key, value] of Object.entries(flattenedData)) {
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');

    const settings = await getSettings();

    if (section) {
      const sectionData = settings[section as keyof typeof settings];
      if (sectionData) {
        return NextResponse.json({ [section]: sectionData });
      } else {
        return NextResponse.json({ error: 'Section not found' }, { status: 404 });
      }
    }

    return NextResponse.json(settings);

  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { section, data } = body;

    if (!section || !data) {
      return NextResponse.json({ error: 'Missing section or data' }, { status: 400 });
    }

    // Validate section exists in default settings
    if (!defaultSettings[section as keyof typeof defaultSettings]) {
      return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
    }

    // Update settings in database
    await updateSettings(section, data);
    
    // Get updated settings
    const updatedSettings = await getSettings();
    
    return NextResponse.json({ 
      message: 'Settings updated successfully',
      [section]: updatedSettings[section as keyof typeof updatedSettings]
    });

  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
