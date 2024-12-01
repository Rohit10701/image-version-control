import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import type { KestraImageStringPostBody } from "../types.js";

const kestra = new Hono();

kestra.use("*", prettyJSON());
kestra.use("/api/*", cors());
kestra.use("*", logger());

kestra.post("/image-string", async (c) => {
	const { image_string } = await c.req.json<KestraImageStringPostBody>();

	if(image_string) {
		return c.json({ "status": "success", image_string })
	}

	return c.json({ "status": "failed" })
})


export default kestra
