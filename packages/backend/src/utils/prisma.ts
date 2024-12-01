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

export const createNewMasterBranch = async (
  prisma: PrismaClient,
  data: { branchName: string; workspaceId: string }
) => {
  return await prisma.branch.create({
    data: {
      name: data.branchName,
      workspaceId: data.workspaceId,
    },
  })
}

export const createInitialCommit = async (
  prisma: PrismaClient,
  data: { commitHash: string; branchId: string; message: string }
) => {
  return await prisma.commit.create({
    data: {
      id: data.commitHash,
      message: data.message,
      branchId: data.branchId,
    },
  })
}
