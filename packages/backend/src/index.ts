import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { HTTPException } from 'hono/http-exception'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import kestra from './api/kestra.js'
import type { ImageBody } from './types.js'

const app = new Hono()

app.use('*', prettyJSON())
app.use('*', cors())
app.use('*', logger())

app.get('/', (c) => {
  return c.json({ message: 'Hello, World!' })
})

// We send image blob to kistra task for generating pixel string -> webhook -> backend will get text string -> create a room for git -> git commit -> returns commit hash -> s3 for artifact which is the repo
// db -> imageId, artifactUrl, user_id, commitHash
// return db data for confirmation
app.post('/image', async (c) => {
  const { image } = await c.req.parseBody<ImageBody>()
  return c.json({ image })
})

// single image click -> get the data for that image -> imageId, versionId -> kistra task (get artifactUrl from db => get artifact from s3 with the url) -> reconstruct image from pixel string -> return to frontend
app.get('/image/:id/:versionId', (c) => {
  const id = c.req.param('id')
  const versionId = c.req.param('versionId')

  return c.json({ id })
})

app.post('/version-control', (c) => {
  return c.text('Hello Hono!')
})

app.route('/kestra', kestra)

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    // Get the custom response
    return err.getResponse()
  }
  return c.json({ message: 'Internal Server Error' }, 500)
})

const port = 3010
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
