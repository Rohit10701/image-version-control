import {
  PutObjectCommand,
  S3Client,
  type S3Client as S3ClientType,
} from '@aws-sdk/client-s3'
import fs from 'fs'

type S3UploadOptions = {
  bucket: string
  fileName: string
  repoPath: string
}

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

export const uploadToS3 = async (
  s3Client: S3ClientType,
  options: S3UploadOptions
) => {
  try {
    const { bucket, fileName, repoPath } = options

    const s3UploadParams = {
      Bucket: bucket,
      Key: fileName,
      Body: fs.readFileSync(repoPath),
    }

    const s3Command = new PutObjectCommand(s3UploadParams)
    await s3Client.send(s3Command)
  } catch (error) {
    console.log(error)
    throw new Error('Error uploading to S3')
  }
}
