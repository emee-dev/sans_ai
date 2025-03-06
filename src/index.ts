import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { AiMiddleware } from "./middleware.js";
import { HTTPException } from "hono/http-exception";
import { hashObject } from "./utils.js";
import { ollama } from "ollama-ai-provider";

const app = new Hono();

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    // Get the custom response
    // return err.getResponse();
    // return c.text(err.message);
  }

  let log = {
    issue: "SQL Injection Attempt",
    detail: `Detected "UNION SELECT" in query parameter "user_id"`,
    level: "HIGH",
    recommendation: "Sanitize inputs and use parameterized queries",
  };

  return c.text(err.message);
});

app.use(
  AiMiddleware({
    app,
    model: ollama("llama3.3"),
    prompt: `Say hello.`,
    onRequest: ({ ctx }) => ({} as any),
    // route_rules: {
    //   "/": "",
    // },
  })
);

app.get("/", (c) => {
  // throw new Error("Invalid route.");
  return c.text("Hello Hono!");
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
