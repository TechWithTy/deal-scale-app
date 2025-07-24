import type { PrismaClient } from "@prisma/client";

declare global {
	namespace NodeJS {
		interface Global {
			prisma: PrismaClient;
		}
	}
}
