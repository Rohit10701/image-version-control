export interface Commit {
  id: number
  message: string
  timestamp: string
  image: string
  branch: string
  parentId: number | null
}

export interface Branch {
  name: string
  head: number // ID of the latest commit in this branch
}
