import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { HTTPException } from 'hono/http-exception'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import type { KestraImageStringPostBody } from '../types.js'
import { saveToGitRepo } from '../utils/common.js'
import { initializeS3Client, uploadRepoToS3 } from '../utils/s3-helpers.js'

const kestra = new Hono()

kestra.use('*', prettyJSON())
kestra.use('*', cors())
kestra.use('*', logger())

const DATABASE_URL =
  'postgresql://admin:admin@localhost:5432/img_vr_db?schema=public'
const LOCALSTACK_S3_URL = 'http://localhost:4566'
const AWS_ACCESS_KEY_ID = 'test'
const AWS_SECRET_ACCESS_KEY = 'test'

kestra.post('/image-string', async (c) => {
  const { image_string, workspace_id } =
    await c.req.json<KestraImageStringPostBody>()

  const S3_BUCKET_NAME = 'localstackkestra'

  if (!image_string || !workspace_id) {
    throw new HTTPException(400, {
      message: 'Image string from kestra is not found',
    })
  }

  try {
    const { s3RepoPath, commitHash } = await saveToGitRepo(
      workspace_id,
      image_string
    )

    const s3Client = initializeS3Client({
      s3Url: LOCALSTACK_S3_URL,
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    })

    const artifactUrl = await uploadRepoToS3(
      s3RepoPath,
      s3Client,
      S3_BUCKET_NAME
    )

    console.log({ commitHash, artifactUrl })

    return c.json({
      status: 'success',
      artifact_url: artifactUrl,
      commit_hash: commitHash,
    })
  } catch (err) {
    console.error('Error: ', err)
    throw new HTTPException(400, {
      message: 'Image string from kestra is not found',
    })
  }
})

export default kestra
