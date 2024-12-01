import type { Branch, Commit, Workspace } from "@prisma/client";

export type ICommit = Partial<Commit> & {

}

export type IBranch = Partial<Branch> & {

}

export type IWorkspace = Partial<Workspace> & {

}

// export interface Commit extends PrismaClient{
//   id: number
//   message: string
//   image: string
//   branch: string
//   parentId: number | null
//   createdAt: string
//   updatedAt: string
// }

// export interface Branch {
//   name: string
//   head: number // ID of the latest commit in this branch
// }

// export interface Workspace {
// 	id: string
// 	name: string
// 	userId: string
// 	aritfactUrl: string
// }
