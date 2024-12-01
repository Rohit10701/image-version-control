import { PrismaClient } from '@prisma/client'
import type { CreateWorkspaceRequest } from '../types.js'

export const getPrisma = (datasourceUrl: string) => {
  if (!datasourceUrl) {
    throw new Error('Datasource URL is required')
  }
  return new PrismaClient({ datasourceUrl })
}

export const createNewWorkspace = async (
  prisma: PrismaClient,
  data: CreateWorkspaceRequest
) => {
  return await prisma.workspace.create({
    data: {
      name: data.workspaceName,
      userId: data.userId,
      artifact_url: data.aritfactUrl,
    },
  })
}
