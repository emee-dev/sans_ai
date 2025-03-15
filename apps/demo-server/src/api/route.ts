import { Hono } from "hono";

const app = new Hono();

// 5. Using Predictable IDs (Insecure Direct Object References - IDOR)
app.get("/profile/:id", async (c) => {
  return c.json({
    id: c.req.param("id"),
    username: "user",
    data: "Sensitive user information",
  });
});

// 6. Missing Input Validation (Allowing script injection)
app.post("/comment", async (c) => {
  const { comment } = await c.req.json();
  return c.text(`User comment: ${comment}`); // No input sanitization
});

// 7. Insecure JWT Handling (Using a static, insecure secret)
app.get("/jwt", async (c) => {
  const jwtSecret = "123456"; // Weak secret

  return c.json({ token: `header.payload.${jwtSecret}` }); // Fake JWT token
});

// 8. Exposing Stack Traces in Errors
app.get("/crash", async (c) => {
  try {
    throw new Error("Unexpected error occurred!");
  } catch (error: any) {
    return c.json({ message: "Internal server error", error: error.message });
  }
});

export default app;
