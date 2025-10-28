
import { NextResponse } from 'next/server';
import { prisma } from './prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { LogLevel } from '@prisma/client';

const log = (level: 'info' | 'warn' | 'error' | 'debug', message: string, details: object = {}) => {
  const logObject = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...details,
  };
  
  switch (level) {
    case 'info':
      console.log(JSON.stringify(logObject, null, 2));
      break;
    case 'warn':
      console.warn(JSON.stringify(logObject, null, 2));
      break;
    case 'error':
      console.error(JSON.stringify(logObject, null, 2));
      break;
    case 'debug':
      // Debug logs will only show in development
      if (process.env.NODE_ENV === 'development') {
        console.debug(JSON.stringify(logObject, null, 2));
      }
      break;
  }
};

// Server-side logger that also saves to database
export const logger = {
  info: async (message: string, details?: object) => {
    log('info', message, details);
    await saveLogToDatabase('INFO', message, details);
  },
  warn: async (message: string, details?: object) => {
    log('warn', message, details);
    await saveLogToDatabase('WARN', message, details);
  },
  error: async (message: string, details?: object) => {
    log('error', message, details);
    await saveLogToDatabase('ERROR', message, details);
  },
  debug: async (message: string, details?: object) => {
    log('debug', message, details);
    if (process.env.NODE_ENV === 'development') {
      await saveLogToDatabase('DEBUG', message, details);
    }
  },
};

// Helper function to save logs to database
async function saveLogToDatabase(
  level: LogLevel,
  message: string,
  details?: object
) {
  try {
    await prisma.systemLog.create({
      data: {
        level,
        message,
        details: details || {},
        source: 'server',
      },
    });
  } catch (error) {
    // If database save fails, just log to console
    console.error('Failed to save log to database:', error);
  }
}

// A client-side logger function that sends logs to the server
export const logClient = async (level: 'info' | 'warn' | 'error', message: string, details: object = {}) => {
  try {
    await fetch('/api/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ level, message, details }),
    });
  } catch (error) {
    console.error('Failed to send client log to server:', error);
  }
};

import { checkPermission } from './permission-middleware';

// API handler for logging from the client
export async function handleLogRequest(req: Request) {
  try {
    const permissionCheck = await checkPermission('LOGS', 'CREATE');
    if (!permissionCheck.success) {
      return NextResponse.json({ message: permissionCheck.message }, { status: 403 });
    }

    const { level, message, details } = await req.json();
    
    if (!['info', 'warn', 'error'].includes(level)) {
      return NextResponse.json({ message: 'Invalid log level' }, { status: 400 });
    }

    // Get user info from session
    const session = await getServerSession(authOptions);
    
    // Save to database
    await prisma.systemLog.create({
      data: {
        level: level.toUpperCase() as LogLevel,
        message: `Client-side log: ${message}`,
        details: details || {},
        source: 'client',
        userId: session?.user?.id,
        userRole: session?.user?.role,
        userName: session?.user?.name || undefined,
      },
    });
    
    logger.info(`Client-side log: ${message}`, { ...details, user: { id: session?.user?.id, role: session?.user?.role } });
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in /api/log handler', { error: errorMessage });
    return NextResponse.json({ message: 'Error processing log request' }, { status: 500 });
  }
}
