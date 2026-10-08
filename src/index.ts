/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

/*
export default {
	async fetch(request, env, ctx): Promise<Response> {
		return new Response("Hello World!");
	},
} satisfies ExportedHandler<Env>;
*/

import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();
app.use("/api/*", cors());

app.get("/api/posts/:slug/comments", async (c) => {
	// Do something and return an HTTP response
	// Optionally, do something with c.req.param("slug")
	const { slug } = c.req.param();
	const { results } = await c.env.DB.prepare(
		"SELECT * FROM comments WHERE post_slug = ?",
	)
		.bind(slug)
		.run();
	return c.json(results);
});

app.post("/api/posts/:slug/comments", async (c) => {
	// Do something and return an HTTP response
	// Optionally, do something with c.req.param("slug")
	const { slug } = c.req.param();
	const { author, body } = await c.req.json();

	if (!author) return c.text("Missing author value for new comment", 400);
	if (!body) return c.text("Missing body value for new comment", 400);

	const { success } = await c.env.DB.prepare(
		"INSERT INTO comments (author, body, post_slug) VALUES (?, ?, ?)",
	)
		.bind(author, body, slug)
		.run();

	if (success) {
		c.status(201);
		return c.text("Created");
	} else {
		c.status(500);
		return c.text("Something went wrong");
	}
});

export default app;