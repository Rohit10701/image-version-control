import {
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import fs from 'fs'
import path from 'path'

type S3ClientCredentials = {
  s3Url: string
  accessKeyId: string
  secretAccessKey: string
}

export const initializeS3Client = ({
  s3Url,
  accessKeyId,
  secretAccessKey,
}: S3ClientCredentials) => {
  return new S3Client({
    endpoint: s3Url,
    credentials: {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
    },
    forcePathStyle: true, // Required for LocalStack
    region: 'ap-south-1',
  })
}

export async function uploadRepoToS3(
  repoPath: string,
  s3Client: S3Client,
  bucketName: string,
  workspaceName: string,
  prefix: string = ''
): Promise<string> {
  const REPO_DIR = path.join(process.cwd(), repoPath)

  // Create the full S3 prefix path
  const s3Prefix = `repo-uploads/${workspaceName}`

  // Ensure the bucket exists first
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }))
  } catch (error) {
    throw new Error(`Bucket ${bucketName} does not exist or cannot be accessed`)
  }

  const files = walkDirectory(REPO_DIR)

  // Upload files
  for (const fullPath of files) {
    // Generate S3 key by replacing the base repo path and adding the prefix
    const relativePath = path.relative(REPO_DIR, fullPath)
    const s3Key = `${s3Prefix}/${relativePath}`

    console.log({ s3Key, relativePath })

    try {
      const fileBuffer = fs.readFileSync(fullPath)
      await s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: s3Key,
          Body: fileBuffer,
        })
      )
      console.log(`Uploaded ${s3Key} to S3`)
    } catch (error) {
      console.error(`Failed to upload ${relativePath} to S3:`, error)
    }
  }
  return `${bucketName}/${repoPath}`
}

const walkDirectory = (dir: string): string[] => {
  let results: string[] = []
  const list = fs.readdirSync(dir, { withFileTypes: true })

  for (const file of list) {
    const fullPath = path.join(dir, file.name)
    if (file.isDirectory()) {
      results = results.concat(walkDirectory(fullPath))
    } else {
      results.push(fullPath)
    }
  }

  return results
}
