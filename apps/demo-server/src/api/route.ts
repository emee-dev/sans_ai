import { Hono } from "hono";

const app = new Hono();

// 1. Lack of Authentication (No authentication required)
app.get("/users", async (c) => {
  return c.json([
    { id: 1, username: "admin" },
    { id: 2, username: "user" },
  ]);
});

// 2. Hardcoded Credentials in Code
const ADMIN_PASSWORD = "supersecretpassword"; // Hardcoded password

app.post("/login", async (c) => {
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

// 4. No Rate Limiting (No restrictions on API abuse)
app.get("/no-rate-limit", async (c) => {
  return c.text("This endpoint has no rate limiting!");
});

// 5. SQL Injection Vulnerability
app.get("/search", async (c) => {
  const query = c.req.query("q");
  const sql = `SELECT * FROM users WHERE username = '${query}'`; // Directly inserting user input
  return c.text(`Executing query: ${sql}`); // Exposing raw SQL query
});

// 6. Using Predictable IDs (Insecure Direct Object References - IDOR)
app.get("/profile/:id", async (c) => {
  return c.json({
    id: c.req.param("id"),
    username: "user",
    data: "Sensitive user information",
  });
});

// 7. No HTTPS Enforcement (Assuming API runs on HTTP, not HTTPS)

// 8. Missing Input Validation (Allowing script injection)
app.post("/comment", async (c) => {
  const { comment } = await c.req.json();
  return c.text(`User comment: ${comment}`); // No input sanitization
});

// 9. Insecure JWT Handling (Using a static, insecure secret)
const jwtSecret = "123456"; // Weak secret

app.get("/jwt", async (c) => {
  return c.json({ token: `header.payload.${jwtSecret}` }); // Fake JWT token
});

// 10. Exposing Stack Traces in Errors
app.get("/crash", async () => {
  throw new Error("Unexpected error occurred!");
});

export default app;
