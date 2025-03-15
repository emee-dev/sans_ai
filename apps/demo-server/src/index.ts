import { serve } from "@hono/node-server";
import { Hono } from "hono";
import path from "node:path";
import { Worker } from "node:worker_threads";
import api from "./api/route.js";
import { sansAiMiddleware } from "@trythis/hono-sansai";
import axios from "axios";

const app = new Hono();

app.route("/api", api);

const worker = new Worker(path.resolve("src", "./worker.js"));

// Handle error
worker.on("error", (err) => {
  console.error(`Worker err:`, err);
});

const cleanup = async () => {
  console.log("\nGracefully shutting down...");
  await worker.terminate();
  console.log("Worker terminated.");
  process.exit(0);
};

// Listen for termination signals
process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

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
    onWorkerMessage: ({ msg, ctx }) => {
      console.log("msg", msg);

      try {
        axios.post(
          "https://webhook.site/45d4809e-e995-40a2-bcd1-0c98d077b743",
          {
            data: msg || [],
            method: ctx.req.method,
            endpoint: ctx.req.path,
          }
        );
      } catch (error: any) {
        // ignore the error or resend the api call
        console.log(error.message);
      }
    },
  })
);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

// 1. Lack of Authentication (No authentication required)
app.get("/users", async (c) => {
  return c.json([
    { id: 1, username: "admin" },
    { id: 2, username: "user" },
  ]);
});

// 2. Hardcoded Credentials in Code
app.post("/login", async (c) => {
  const ADMIN_PASSWORD = "supersecretpassword"; // Hardcoded password

  const { username, password } = await c.req.json();
  if (username === "admin" && password === ADMIN_PASSWORD) {
    return c.json({ token: "insecure-jwt-token" }); // Fake token
  }
  return c.json({ error: "Invalid credentials" }, 401);
});

// 3. Exposing Sensitive Data (Leaking user details)
app.get("/user/:id", async (c) => {
  const id = c.req.param("id");
  return c.json({
    id,
    username: "admin",
    password: "plaintextpassword", // Storing passwords in plaintext
    email: "admin@example.com",
    creditCard: "4111 1111 1111 1111", // Exposing sensitive info
  });
});

// 4. SQL Injection Vulnerability
app.get("/search", async (c) => {
  const query = c.req.query("q");
  const sql = `SELECT * FROM users WHERE username = '${query}'`; // Directly inserting user input
  return c.text(`Executing query: ${sql}`); // Exposing raw SQL query
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
