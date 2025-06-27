import { PrismaClient } from "@prisma/client";


const  PrismaClientSingleton = () => {
return new PrismaClient()
}


type PrismaClientSingleton = ReturnType<typeof PrismaClientSingleton>;

// This is a workaround to avoid creating multiple instances of PrismaClien// in development mode, which can lead to issues with hot reloading.
const globalForPrisma = global as unknown as { prisma: PrismaClient |
     undefined };


const prisma = globalForPrisma.prisma ?? PrismaClientSingleton();


export default prisma

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;