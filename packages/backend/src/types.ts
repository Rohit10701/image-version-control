export interface Bindings extends KestraEnv {}

export type ImageBody = {
  image: string
}

export type KestraImageStringPostBody = {
  image_string: string
  workspace_id: string
}

export type KestraEnv = {
  DATABASE_URL: string
  LOCALSTACK_S3_URL: string
  AWS_ACCESS_KEY_ID: string
  AWS_SECRET_ACCESS_KEY: string
}

export type CreateWorkspaceRequest = {
  workspaceName: string
  userId: string
  aritfactUrl: string
}
