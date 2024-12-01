import { PrismaClient } from "@prisma/client";

export const getPrisma = (datasourceUrl: string) => {
  if (!datasourceUrl) {
    throw new Error("Datasource URL is required");
  }
  return new PrismaClient({ datasourceUrl });
};

export const prisma = getPrisma(process.env.DATABASE_URL!);
