import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
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
  prefix: string = ''
): Promise<string> {
const REPO_DIR = path.join(process.cwd(), repoPath)
  // List all files in the repository
  const files = fs.readdirSync(REPO_DIR, {
    recursive: true,
    withFileTypes: false,
    encoding: 'utf8',
  })

  for (const file of files) {
    const fullPath = path.join(REPO_DIR, file)
    const stats = fs.statSync(fullPath)

    if (stats.isFile()) {
      const s3Key = prefix ? `${prefix}/${file}` : file

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
        console.error(`Failed to upload ${file} to S3:`, error)
      }
    }
  }
  return `${bucketName}/${repoPath}`
}
