import { serve } from "@hono/node-server";
import { Hono } from "hono";
import path from "node:path";
import { Worker } from "node:worker_threads";
import api from "./api/route.js";
import { hashObject } from "./utils/index.js";
import { sansAiMiddleware } from "@trythis/hono-sansai";

const app = new Hono();

app.route("/api", api);

const worker = new Worker(path.resolve("src", "./worker.js"));

// Handle error
worker.on("error", (err) => {
  console.error(`Worker err:`, err);
});
// Handle exit
// worker.on("exit", (code) => {
//   if (code !== 0) {
//     console.error(`Worker stopped with exit code ${code}`);
//   }
// });

app.use(
  sansAiMiddleware({
    worker,
    environment: "debug",
    skipOnRedirects: true,
    includeRouteHandler: true,
    // transformRequest: ({ ctx }) => ({
    //   method: ctx.req.method,
    //   endpoint: ctx.req.path,
    //   error: undefined, // disable error
    // }),
    // prepareAiPayload: ({ payload }) => ({}),
    onWorkerMessage: ({ msg }) => {
      console.log("msg", msg);
    },
  })
);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.post("/hono-security", (c) => {
  // throw new Error("Invalid route.");
  return c.text("Hono security!");
});

app.post("/worker", async (c) => {
  const params = (await c.req.json()) as { text: string };

  return c.text(params.text);
});

app.post("/", async (c) => {
  const payload = await c.req.json();
  const hash = await hashObject(payload);

  return c.json({
    payload,
    hash,
    h: c.req.header(),
  });
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
