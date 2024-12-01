import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import type { KestraImageStringPostBody } from "../types.js";
import { saveToGitRepo, uploadRepoToS3 } from "../services/kestra.js";
import * as AWS from 'aws-sdk';
import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, LOCALSTACK_S3_URL, S3_BUCKET_NAME, S3_REGION } from "../utils/costants.js";

const kestra = new Hono();

kestra.use("*", prettyJSON());
kestra.use("/api/*", cors());
kestra.use("*", logger());

kestra.post("/image-string", async (c) => {
	const { image_string, workspaceId } = await c.req.json<KestraImageStringPostBody>();

	if(image_string) {
		return c.json({ "status": "success", image_string })
	}

	const repoPath = await saveToGitRepo(workspaceId, image_string);
  
	const s3Client = new AWS.S3({
	  accessKeyId: AWS_ACCESS_KEY_ID,
	  secretAccessKey: AWS_SECRET_ACCESS_KEY,
	  endpoint: LOCALSTACK_S3_URL,
	  s3ForcePathStyle: true,
	  region: S3_REGION
	});
  
	await uploadRepoToS3(repoPath, s3Client, S3_BUCKET_NAME, workspaceId);
	
	console.log("Processing and upload completed.");
	console.log(`Git repository path: ${repoPath}`);

	return c.json({ "status": "failed" })
})


export default kestra
