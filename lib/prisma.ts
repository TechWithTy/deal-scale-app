import { PrismaClient } from '@prisma/client';

// Add this declaration if the file where this code is
// doesn't have the global.d.ts file
declare global {
  // This prevents "globalThis" issues during development.
  // In production, you wouldn't need to attach prisma to globalThis.
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV === 'development') {
  global.prisma = prisma;
}

export default prisma;

export {};
