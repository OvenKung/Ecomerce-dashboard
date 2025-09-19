import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 เริ่มต้น seeding ฐานข้อมูล...')

  // ลบข้อมูลเก่าทั้งหมด
  console.log('🗑️ ลบข้อมูลเก่า...')
  await prisma.orderCoupon.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.order.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.productImage.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.brand.deleteMany()
  await prisma.coupon.deleteMany()
  await prisma.userRole_Mapping.deleteMany()
  await prisma.rolePermission.deleteMany()
  await prisma.user.deleteMany()
  await prisma.role.deleteMany()
  await prisma.permission.deleteMany()
  console.log('✅ ลบข้อมูลเก่าเรียบร้อยแล้ว')

  // สร้าง Users
  const hashedPassword = await hash('admin123', 12)
  
  const superAdminUser = await prisma.user.create({
    data: {
      name: 'ซุปเปอร์แอดมิน',
      email: 'superadmin@example.com',
      password: hashedPassword,
      role: 'SUPER_ADMIN'
    }
  })

  const adminUser = await prisma.user.create({
    data: {
      name: 'ผู้ดูแลระบบ',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN'
    }
  })

  const managerUser = await prisma.user.create({
    data: {
      name: 'ผู้จัดการ',
      email: 'manager@example.com',
      password: hashedPassword,
      role: 'MANAGER'
    }
  })

  const staffUser = await prisma.user.create({
    data: {
      name: 'พนักงาน',
      email: 'staff@example.com',
      password: hashedPassword,
      role: 'STAFF'
    }
  })

  const viewerUser = await prisma.user.create({
    data: {
      name: 'ผู้ดูข้อมูล',
      email: 'viewer@example.com',
      password: hashedPassword,
      role: 'VIEWER'
    }
  })

  // เพิ่มผู้ใช้เพิ่มเติม
  const additionalUsers = await Promise.all([
    prisma.user.create({
      data: {
        name: 'สมชาย ใจดี',
        email: 'somchai@example.com',
        password: hashedPassword,
        role: 'STAFF'
      }
    }),
    prisma.user.create({
      data: {
        name: 'สมหญิง รักดี',
        email: 'somying@example.com',
        password: hashedPassword,
        role: 'STAFF'
      }
    }),
    prisma.user.create({
      data: {
        name: 'วิชาญ เก่งดี',
        email: 'wichan@example.com',
        password: hashedPassword,
        role: 'MANAGER'
      }
    })
  ])

  console.log('✅ สร้างผู้ใช้เรียบร้อยแล้ว')

  // สร้าง Categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'เสื้อผ้าและแฟชั่น',
        slug: 'clothing-fashion',
        description: 'เสื้อผ้า รองเท้า และเครื่องประดับ',
        isActive: true
      }
    }),
    prisma.category.create({
      data: {
        name: 'อิเล็กทรอนิกส์',
        slug: 'electronics',
        description: 'อุปกรณ์อิเล็กทรอนิกส์และเทคโนโลยี',
        isActive: true
      }
    }),
    prisma.category.create({
      data: {
        name: 'ของใช้ในบ้าน',
        slug: 'home-living',
        description: 'ของใช้ในบ้านและการตกแต่ง',
        isActive: true
      }
    }),
    prisma.category.create({
      data: {
        name: 'กีฬาและการออกกำลังกาย',
        slug: 'sports-fitness',
        description: 'อุปกรณ์กีฬาและฟิตเนส',
        isActive: true
      }
    }),
    prisma.category.create({
      data: {
        name: 'สุขภาพและความงาม',
        slug: 'health-beauty',
        description: 'ผลิตภัณฑ์เพื่อสุขภาพและความงาม',
        isActive: true
      }
    }),
    prisma.category.create({
      data: {
        name: 'หนังสือและสื่อ',
        slug: 'books-media',
        description: 'หนังสือ นิตยสาร และสื่อบันเทิง',
        isActive: true
      }
    }),
    prisma.category.create({
      data: {
        name: 'ของเล่นและเกม',
        slug: 'toys-games',
        description: 'ของเล่นและเกมสำหรับทุกวัย',
        isActive: true
      }
    }),
    prisma.category.create({
      data: {
        name: 'อาหารและเครื่องดื่ม',
        slug: 'food-beverage',
        description: 'อาหาร เครื่องดื่ม และผลิตภัณฑ์จากธรรมชาติ',
        isActive: true
      }
    })
  ])

  console.log('✅ สร้างหมวดหมู่เรียบร้อยแล้ว')

  // สร้าง Brands
  const brands = await Promise.all([
    prisma.brand.create({
      data: {
        name: 'Samsung',
        slug: 'samsung',
        description: 'Samsung Electronics - นวัตกรรมเทคโนโลยี',
        website: 'https://samsung.com',
        isActive: true
      }
    }),
    prisma.brand.create({
      data: {
        name: 'Nike',
        slug: 'nike',
        description: 'Nike - Just Do It',
        website: 'https://nike.com',
        isActive: true
      }
    }),
    prisma.brand.create({
      data: {
        name: 'IKEA',
        slug: 'ikea',
        description: 'IKEA - เฟอร์นิเจอร์และของแต่งบ้าน',
        website: 'https://ikea.com',
        isActive: true
      }
    }),
    prisma.brand.create({
      data: {
        name: 'Apple',
        slug: 'apple',
        description: 'Apple Inc. - Think Different',
        website: 'https://apple.com',
        isActive: true
      }
    }),
    prisma.brand.create({
      data: {
        name: 'Adidas',
        slug: 'adidas',
        description: 'Adidas - Impossible is Nothing',
        website: 'https://adidas.com',
        isActive: true
      }
    }),
    prisma.brand.create({
      data: {
        name: 'Sony',
        slug: 'sony',
        description: 'Sony Corporation - เทคโนโลยีและบันเทิง',
        website: 'https://sony.com',
        isActive: true
      }
    }),
    prisma.brand.create({
      data: {
        name: 'Uniqlo',
        slug: 'uniqlo',
        description: 'Uniqlo - LifeWear เสื้อผ้าคุณภาพ',
        website: 'https://uniqlo.com',
        isActive: true
      }
    }),
    prisma.brand.create({
      data: {
        name: 'H&M',
        slug: 'hm',
        description: 'H&M - แฟชั่นและคุณภาพในราคาที่ดีที่สุด',
        website: 'https://hm.com',
        isActive: true
      }
    }),
    prisma.brand.create({
      data: {
        name: 'Zara',
        slug: 'zara',
        description: 'Zara - แฟชั่นล่าสุด',
        website: 'https://zara.com',
        isActive: true
      }
    }),
    prisma.brand.create({
      data: {
        name: 'Canon',
        slug: 'canon',
        description: 'Canon - กล้องและเครื่องพิมพ์',
        website: 'https://canon.com',
        isActive: true
      }
    })
  ])

  console.log('✅ สร้างแบรนด์เรียบร้อยแล้ว')

  // สร้าง Products
  const products = await Promise.all([
    // Electronics - Samsung
    prisma.product.create({
      data: {
        name: 'Samsung Galaxy S24 Ultra',
        slug: 'galaxy-s24-ultra',
        description: 'Samsung Galaxy S24 Ultra มือถือรุ่นท็อป กล้อง 200MP หน้าจอ 6.8 นิ้ว',
        sku: 'SAM-S24U-001',
        status: 'ACTIVE',
        price: 42900,
        costPrice: 35000,
        comparePrice: 45900,
        quantity: 25,
        categoryId: categories[1].id, // อิเล็กทรอนิกส์
        brandId: brands[0].id // Samsung
      }
    }),
    prisma.product.create({
      data: {
        name: 'Samsung Galaxy Watch 6',
        slug: 'galaxy-watch-6',
        description: 'Samsung Galaxy Watch 6 สมาร์ทวอทช์ติดตามสุขภาพ',
        sku: 'SAM-GW6-001',
        status: 'ACTIVE',
        price: 12900,
        costPrice: 9000,
        comparePrice: 14900,
        quantity: 40,
        categoryId: categories[1].id,
        brandId: brands[0].id
      }
    }),
    
    // Electronics - Apple
    prisma.product.create({
      data: {
        name: 'iPhone 15 Pro Max',
        slug: 'iphone-15-pro-max',
        description: 'iPhone 15 Pro Max หน้าจอ 6.7 นิ้ว ชิป A17 Pro กล้อง 48MP',
        sku: 'APL-IP15PM-001',
        status: 'ACTIVE',
        price: 48900,
        costPrice: 40000,
        comparePrice: 52900,
        quantity: 15,
        categoryId: categories[1].id,
        brandId: brands[3].id // Apple
      }
    }),
    prisma.product.create({
      data: {
        name: 'Apple MacBook Air M2',
        slug: 'macbook-air-m2',
        description: 'MacBook Air M2 13 นิ้ว 256GB SSD 8GB RAM สีเงิน',
        sku: 'APL-MBA-M2-001',
        status: 'ACTIVE',
        price: 39900,
        costPrice: 32000,
        comparePrice: 42900,
        quantity: 20,
        categoryId: categories[1].id,
        brandId: brands[3].id
      }
    }),

    // Clothing - Nike
    prisma.product.create({
      data: {
        name: 'Nike Air Max 270',
        slug: 'air-max-270',
        description: 'รองเท้า Nike Air Max 270 สำหรับวิ่งและไลฟ์สไตล์',
        sku: 'NIK-AM270-001',
        status: 'ACTIVE',
        price: 4500,
        costPrice: 3000,
        comparePrice: 5500,
        quantity: 30,
        categoryId: categories[0].id, // เสื้อผ้าและแฟชั่น
        brandId: brands[1].id // Nike
      }
    }),
    prisma.product.create({
      data: {
        name: 'Nike Dri-FIT Training Shirt',
        slug: 'nike-dri-fit-training',
        description: 'เสื้อเทรนนิ่ง Nike Dri-FIT ระบายอากาศได้ดี',
        sku: 'NIK-DFIT-001',
        status: 'ACTIVE',
        price: 1290,
        costPrice: 800,
        comparePrice: 1590,
        quantity: 50,
        categoryId: categories[0].id,
        brandId: brands[1].id
      }
    }),

    // Clothing - Adidas
    prisma.product.create({
      data: {
        name: 'Adidas Ultraboost 22',
        slug: 'adidas-ultraboost-22',
        description: 'รองเท้าวิ่ง Adidas Ultraboost 22 พื้นรอง Boost',
        sku: 'ADI-UB22-001',
        status: 'ACTIVE',
        price: 6500,
        costPrice: 4500,
        comparePrice: 7500,
        quantity: 25,
        categoryId: categories[0].id,
        brandId: brands[4].id // Adidas
      }
    }),

    // Home & Living - IKEA
    prisma.product.create({
      data: {
        name: 'IKEA HEMNES โต๊ะทำงาน',
        slug: 'hemnes-desk',
        description: 'โต๊ะทำงาน IKEA HEMNES ไม้สน ขนาด 155x65 ซม.',
        sku: 'IKE-HEM-001',
        status: 'ACTIVE',
        price: 3990,
        costPrice: 2500,
        comparePrice: 4990,
        quantity: 15,
        categoryId: categories[2].id, // ของใช้ในบ้าน
        brandId: brands[2].id // IKEA
      }
    }),
    prisma.product.create({
      data: {
        name: 'IKEA MALM เตียงนอน',
        slug: 'malm-bed',
        description: 'เตียงนอน IKEA MALM ขนาด 160x200 ซม. สีขาว',
        sku: 'IKE-MALM-001',
        status: 'ACTIVE',
        price: 5990,
        costPrice: 4000,
        comparePrice: 7990,
        quantity: 10,
        categoryId: categories[2].id,
        brandId: brands[2].id
      }
    }),

    // Fashion - Uniqlo
    prisma.product.create({
      data: {
        name: 'Uniqlo Heattech เสื้อยืดคอกลม',
        slug: 'uniqlo-heattech-tshirt',
        description: 'เสื้อยืด Uniqlo Heattech เก็บความอบอุ่น',
        sku: 'UNI-HT-001',
        status: 'ACTIVE',
        price: 590,
        costPrice: 300,
        comparePrice: 790,
        quantity: 100,
        categoryId: categories[0].id,
        brandId: brands[6].id // Uniqlo
      }
    }),

    // Fashion - Zara
    prisma.product.create({
      data: {
        name: 'Zara Blazer สีน้ำเงินเข้ม',
        slug: 'zara-navy-blazer',
        description: 'เสื้อสูท Zara สีน้ำเงินเข้ม ทรงสลิมฟิต',
        sku: 'ZAR-BLZ-001',
        status: 'ACTIVE',
        price: 2490,
        costPrice: 1500,
        comparePrice: 2990,
        quantity: 20,
        categoryId: categories[0].id,
        brandId: brands[8].id // Zara
      }
    }),

    // Electronics - Sony
    prisma.product.create({
      data: {
        name: 'Sony WH-1000XM5 หูฟัง',
        slug: 'sony-wh1000xm5',
        description: 'หูฟัง Sony WH-1000XM5 ตัดเสียงรบกวน พร้อม Hi-Res Audio',
        sku: 'SON-WH1000-001',
        status: 'ACTIVE',
        price: 12900,
        costPrice: 9500,
        comparePrice: 14900,
        quantity: 35,
        categoryId: categories[1].id,
        brandId: brands[5].id // Sony
      }
    }),

    // Electronics - Canon
    prisma.product.create({
      data: {
        name: 'Canon EOS R6 Mark II',
        slug: 'canon-eos-r6-mark2',
        description: 'กล้อง Canon EOS R6 Mark II Mirrorless บอดี้อย่างเดียว',
        sku: 'CAN-R6M2-001',
        status: 'ACTIVE',
        price: 89900,
        costPrice: 75000,
        comparePrice: 95900,
        quantity: 8,
        categoryId: categories[1].id,
        brandId: brands[9].id // Canon
      }
    }),

    // สินค้าเพิ่มเติมในหมวดต่างๆ
    prisma.product.create({
      data: {
        name: 'ลูกฟุตบอล Nike Premier League',
        slug: 'nike-premier-league-ball',
        description: 'ลูกฟุตบอล Nike Premier League Official ขนาดมาตรฐาน',
        sku: 'NIK-PL-001',
        status: 'ACTIVE',
        price: 1890,
        costPrice: 1200,
        comparePrice: 2290,
        quantity: 45,
        categoryId: categories[3].id, // กีฬา
        brandId: brands[1].id
      }
    }),

    // สินค้าหมดสต็อก
    prisma.product.create({
      data: {
        name: 'iPhone 15 Pro สีไทเทเนียม',
        slug: 'iphone-15-pro-titanium',
        description: 'iPhone 15 Pro 256GB สีไทเทเนียมธรรมชาติ (สินค้าหมด)',
        sku: 'APL-IP15P-256-TI',
        status: 'ACTIVE',
        price: 43900,
        costPrice: 37000,
        comparePrice: 46900,
        quantity: 0, // หมดสต็อก
        categoryId: categories[1].id,
        brandId: brands[3].id
      }
    }),

    // สินค้าสต็อกต่ำ
    prisma.product.create({
      data: {
        name: 'Samsung QLED 55" 4K TV',
        slug: 'samsung-qled-55-4k',
        description: 'ทีวี Samsung QLED 55 นิ้ว 4K HDR สมาร์ททีวี',
        sku: 'SAM-QL55-001',
        status: 'ACTIVE',
        price: 24900,
        costPrice: 20000,
        comparePrice: 27900,
        quantity: 3, // สต็อกต่ำ
        categoryId: categories[1].id,
        brandId: brands[0].id
      }
    }),

    // สินค้าราคาสูง
    prisma.product.create({
      data: {
        name: 'MacBook Pro 16" M3 Max',
        slug: 'macbook-pro-16-m3-max',
        description: 'MacBook Pro 16 นิ้ว M3 Max 1TB SSD 36GB RAM - เวอร์ชั่นท็อป',
        sku: 'APL-MBP16-M3MAX',
        status: 'ACTIVE',
        price: 129900,
        costPrice: 110000,
        comparePrice: 139900,
        quantity: 5,
        categoryId: categories[1].id,
        brandId: brands[3].id
      }
    }),

    // สินค้าราคาถูก
    prisma.product.create({
      data: {
        name: 'H&M เสื้อยืดเบสิค',
        slug: 'hm-basic-tshirt',
        description: 'เสื้อยืดเบสิค H&M 100% Cotton หลากสี',
        sku: 'HM-BASIC-001',
        status: 'ACTIVE',
        price: 199,
        costPrice: 100,
        comparePrice: 299,
        quantity: 200,
        categoryId: categories[0].id,
        brandId: brands[7].id // H&M
      }
    })
  ])

  console.log('✅ สร้างสินค้าเรียบร้อยแล้ว')

    // สร้าง Customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        email: 'somchai.tech@gmail.com',
        firstName: 'สมชาย',
        lastName: 'เทคโนโลยี',
        phone: '081-234-5678',
        status: 'ACTIVE',
        segment: 'VIP',
        totalSpent: 45000,
        totalOrders: 8,
        lastOrderAt: new Date('2024-01-15'),
        addresses: {
          create: [
            {
              type: 'SHIPPING',
              firstName: 'สมชาย',
              lastName: 'เทคโนโลยี',
              company: 'บริษัท เทคโนโลยี จำกัด',
              address1: '123 ถนนสุขุมวิท',
              address2: 'แขวงคลองเตย',
              city: 'กรุงเทพมหานคร',
              province: 'กรุงเทพมหานคร',
              postalCode: '10110',
              country: 'TH',
              phone: '081-234-5678',
              isDefault: true
            },
            {
              type: 'BILLING',
              firstName: 'สมชาย',
              lastName: 'เทคโนโลยี',
              company: 'บริษัท เทคโนโลยี จำกัด',
              address1: '456 ถนนเพชรบุรี',
              address2: 'แขวงราชเทวี',
              city: 'กรุงเทพมหานคร',
              province: 'กรุงเทพมหานคร',
              postalCode: '10400',
              country: 'TH',
              phone: '081-234-5678',
              isDefault: false
            }
          ]
        }
      }
    }),
    prisma.customer.create({
      data: {
        email: 'malee.fashion@hotmail.com',
        firstName: 'มาลี',
        lastName: 'แฟชั่น',
        phone: '089-876-5432',
        status: 'ACTIVE',
        segment: 'REGULAR',
        totalSpent: 12500,
        totalOrders: 5,
        lastOrderAt: new Date('2024-01-10'),
        addresses: {
          create: {
            type: 'SHIPPING',
            firstName: 'มาลี',
            lastName: 'แฟชั่น',
            address1: '789 ถนนลาดพร้าว',
            address2: 'แขวงจตุจักร',
            city: 'กรุงเทพมหานคร',
            province: 'กรุงเทพมหานคร',
            postalCode: '10900',
            country: 'TH',
            phone: '089-876-5432',
            isDefault: true
          }
        }
      }
    }),
    prisma.customer.create({
      data: {
        email: 'niran.sport@yahoo.com',
        firstName: 'นิรันดร์',
        lastName: 'กีฬา',
        phone: '092-111-2222',
        status: 'ACTIVE',
        segment: 'VIP',
        totalSpent: 89000,
        totalOrders: 15,
        lastOrderAt: new Date('2024-01-18'),
        addresses: {
          create: {
            type: 'SHIPPING',
            firstName: 'นิรันดร์',
            lastName: 'กีฬา',
            address1: '321 ถนนรามคำแหง',
            address2: 'แขวงหัวหมาก',
            city: 'กรุงเทพมหานคร',
            province: 'กรุงเทพมหานคร',
            postalCode: '10240',
            country: 'TH',
            phone: '092-111-2222',
            isDefault: true
          }
        }
      }
    }),
    prisma.customer.create({
      data: {
        email: 'pranee.home@gmail.com',
        firstName: 'ปราณี',
        lastName: 'โฮมดีไซน์',
        phone: '085-333-4444',
        status: 'ACTIVE',
        segment: 'REGULAR',
        totalSpent: 22000,
        totalOrders: 6,
        lastOrderAt: new Date('2024-01-12'),
        addresses: {
          create: {
            type: 'SHIPPING',
            firstName: 'ปราณี',
            lastName: 'โฮมดีไซน์',
            address1: '654 ถนนพระราม 4',
            address2: 'แขวงคลองเตย',
            city: 'กรุงเทพมหานคร',
            province: 'กรุงเทพมหานคร',
            postalCode: '10110',
            country: 'TH',
            phone: '085-333-4444',
            isDefault: true
          }
        }
      }
    }),
    prisma.customer.create({
      data: {
        email: 'wichit.gadget@outlook.com',
        firstName: 'วิชิต',
        lastName: 'แก็ดเจ็ต',
        phone: '088-555-6666',
        status: 'ACTIVE',
        segment: 'VIP',
        totalSpent: 156000,
        totalOrders: 12,
        lastOrderAt: new Date('2024-01-20'),
        addresses: {
          create: {
            type: 'SHIPPING',
            firstName: 'วิชิต',
            lastName: 'แก็ดเจ็ต',
            address1: '987 ถนนพหลโยธิน',
            address2: 'แขวงลาดยาว',
            city: 'กรุงเทพมหานคร',
            province: 'กรุงเทพมหานคร',
            postalCode: '10900',
            country: 'TH',
            phone: '088-555-6666',
            isDefault: true
          }
        }
      }
    }),
    prisma.customer.create({
      data: {
        email: 'siriporn.beauty@icloud.com',
        firstName: 'ศิริพร',
        lastName: 'บิวตี้',
        phone: '094-777-8888',
        status: 'ACTIVE',
        segment: 'REGULAR',
        totalSpent: 8500,
        totalOrders: 3,
        lastOrderAt: new Date('2024-01-08'),
        addresses: {
          create: {
            type: 'SHIPPING',
            firstName: 'ศิริพร',
            lastName: 'บิวตี้',
            address1: '159 ถนนสีลม',
            address2: 'แขวงสีลม',
            city: 'กรุงเทพมหานคร',
            province: 'กรุงเทพมหานคร',
            postalCode: '10500',
            country: 'TH',
            phone: '094-777-8888',
            isDefault: true
          }
        }
      }
    }),
    prisma.customer.create({
      data: {
        email: 'thanakit.books@gmail.com',
        firstName: 'ธนกิจ',
        lastName: 'หนังสือ',
        phone: '087-999-0000',
        status: 'ACTIVE',
        segment: 'REGULAR',
        totalSpent: 4500,
        totalOrders: 4,
        lastOrderAt: new Date('2024-01-05'),
        addresses: {
          create: {
            type: 'SHIPPING',
            firstName: 'ธนกิจ',
            lastName: 'หนังสือ',
            address1: '753 ถนนจรัญสนิทวงศ์',
            address2: 'แขวงบางขุนเทียน',
            city: 'กรุงเทพมหานคร',
            province: 'กรุงเทพมหานคร',
            postalCode: '10150',
            country: 'TH',
            phone: '087-999-0000',
            isDefault: true
          }
        }
      }
    }),
    // ลูกค้าที่ไม่ได้ใช้งานนาน
    prisma.customer.create({
      data: {
        email: 'kannika.old@hotmail.com',
        firstName: 'กันยกา',
        lastName: 'โอลด์',
        phone: '083-111-3333',
        status: 'INACTIVE',
        segment: 'AT_RISK',
        totalSpent: 2500,
        totalOrders: 2,
        lastOrderAt: new Date('2023-08-15'), // นานมาก
        addresses: {
          create: {
            type: 'SHIPPING',
            firstName: 'กันยกา',
            lastName: 'โอลด์',
            address1: '852 ถนนเจริญกรุง',
            address2: 'แขวงบางรัก',
            city: 'กรุงเทพมหานคร',
            province: 'กรุงเทพมหานคร',
            postalCode: '10500',
            country: 'TH',
            phone: '083-111-3333',
            isDefault: true
          }
        }
      }
    })
  ])

  console.log('✅ สร้างลูกค้าเรียบร้อยแล้ว')

  // สร้าง Coupons
  const coupons = await Promise.all([
    prisma.coupon.create({
      data: {
        code: 'WELCOME10',
        name: 'ส่วนลดต้อนรับ',
        description: 'ส่วนลด 10% สำหรับสมาชิกใหม่',
        type: 'PERCENTAGE',
        value: 10,
        status: 'ACTIVE',
        usageLimit: 100,
        usageCount: 25,
        minimumAmount: 1000,
        startsAt: new Date('2024-01-01'),
        expiresAt: new Date('2024-12-31')
      }
    }),
    prisma.coupon.create({
      data: {
        code: 'SAVE500',
        name: 'ส่วนลด 500 บาท',
        description: 'ส่วนลดเงินสด 500 บาท',
        type: 'FIXED',
        value: 500,
        status: 'ACTIVE',
        usageLimit: 50,
        usageCount: 10,
        minimumAmount: 5000,
        startsAt: new Date('2024-01-01'),
        expiresAt: new Date('2024-06-30')
      }
    })
  ])

  console.log('✅ สร้างคูปองเรียบร้อยแล้ว')

  // สร้าง Orders
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        orderNumber: 'ORD-2024-001',
        status: 'COMPLETED',
        customerId: customers[0].id,
        customerEmail: customers[0].email,
        shippingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 ถนนสุขุมวิท',
          city: 'กรุงเทพฯ',
          province: 'กรุงเทพมหานคร',
          postalCode: '10110',
          country: 'ไทย'
        },
        subtotal: 29900,
        taxAmount: 2093,
        shippingAmount: 100,
        discountAmount: 2990,
        totalAmount: 29103,
        channel: 'web',
        placedAt: new Date()
      }
    }),
    prisma.order.create({
      data: {
        orderNumber: 'ORD-2024-002',
        status: 'PENDING',
        customerId: customers[1].id,
        customerEmail: customers[1].email,
        shippingAddress: {
          firstName: 'Jane',
          lastName: 'Smith',
          address1: '456 ถนนพหลโยธิน',
          city: 'กรุงเทพฯ',
          province: 'กรุงเทพมหานคร',
          postalCode: '10400',
          country: 'ไทย'
        },
        subtotal: 4500,
        taxAmount: 315,
        shippingAmount: 50,
        discountAmount: 0,
        totalAmount: 4865,
        channel: 'mobile',
        placedAt: new Date()
      }
    })
  ])

  // สร้าง Order Items
  await Promise.all([
    prisma.orderItem.create({
      data: {
        orderId: orders[0].id,
        productId: products[0].id,
        quantity: 1,
        price: 29900,
        totalAmount: 29900,
        productName: products[0].name,
        productSku: products[0].sku
      }
    }),
    prisma.orderItem.create({
      data: {
        orderId: orders[1].id,
        productId: products[1].id,
        quantity: 1,
        price: 4500,
        totalAmount: 4500,
        productName: products[1].name,
        productSku: products[1].sku
      }
    })
  ])

  // สร้าง Payments
  await Promise.all([
    prisma.payment.create({
      data: {
        orderId: orders[0].id,
        amount: 29103,
        method: 'STRIPE',
        status: 'COMPLETED',
        currency: 'THB',
        processedAt: new Date()
      }
    }),
    prisma.payment.create({
      data: {
        orderId: orders[1].id,
        amount: 4865,
        method: 'BANK_TRANSFER',
        status: 'PENDING',
        currency: 'THB'
      }
    })
  ])

  console.log('✅ สร้างคำสั่งซื้อและการชำระเงินเรียบร้อยแล้ว')

  console.log('🎉 Seeding เสร็จสมบูรณ์!')
  console.log('')
  console.log('📊 สรุปข้อมูลที่สร้าง:')
  console.log(`👥 ผู้ใช้: ${await prisma.user.count()} คน`)
  console.log(`🏷️ หมวดหมู่: ${await prisma.category.count()} หมวด`)
  console.log(`🏢 แบรนด์: ${await prisma.brand.count()} แบรนด์`)
  console.log(`📦 สินค้า: ${await prisma.product.count()} รายการ`)
  console.log(`👤 ลูกค้า: ${await prisma.customer.count()} คน`)
  console.log(`🛒 คำสั่งซื้อ: ${await prisma.order.count()} รายการ`)
  console.log(`🎫 คูปอง: ${await prisma.coupon.count()} ใบ`)
  console.log('')
  console.log('🔑 ข้อมูลการเข้าสู่ระบบ:')
  console.log('Admin: admin@example.com / admin123')
  console.log('Manager: manager@example.com / admin123')
  console.log('Staff: staff@example.com / admin123')
}

main()
  .catch((e) => {
    console.error('❌ เกิดข้อผิดพลาดในการ seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
