# Advanced AI Middleware

## Project Overview

**AI-Powered Threat Detection & Incident Response**

This project enhances real-time cybersecurity using AI-driven threat detection. It passively monitors endpoint activity, detects potential threats, and provides immediate feedback to mitigate risks based on OWASP best practices.

## Features

- **Real-Time Monitoring**: Continuously analyzes endpoint and API activity for anomalies and threats.
- **AI-Driven Detection**: Uses machine learning to detect both known and unknown attack vectors.
- **Scoped AI Middleware**: Applies AI logic **only** to designated routes (`/private/api`).
- **Efficient Worker Processing**: Offloads AI tasks to a **Node.js Worker Thread** for better performance.
- **User-Friendly Dashboard**: Enables security teams to monitor logs, review threats, and manage responses.
- **Open-Source & Scalable**: Built with **Vercel AI SDK** and **Ollama** for cost-efficient, modular, and developer-friendly AI inference.

## Technologies Used

- **Hono**: For advanced routing and middleware capabilities.
- **Ollama**: Local AI workflows.
- **Vercel AI SDK**: Wrapper around popular AI models for easy integration.
- **Worker Threads**: For non-blocking AI task execution.
- **TypeScript**: Ensuring type safety and maintainability.

---

## Installation

To install the middleware package, use any of the following commands:

```shell
# npm
npm i @trythis/hono-sansai

# pnpm
pnpm add @trythis/hono-sansai

# yarn
yarn add @trythis/hono-sansai
```

---

## 🚀 **Setting Up AI Middleware with Hono**

### **1️⃣ Hono API Server with AI Middleware**

```typescript
import { Hono } from "hono";
import { sansAiMiddleware } from "@trythis/hono-sansai";
import path from "path";
import { Worker } from "worker_threads";

const app = new Hono();
const worker = new Worker(path.resolve("src", "./worker.js"));

worker.on("error", (err) => console.error("Worker error:", err));

// Scoped AI Middleware - Applied ONLY to "/private/api"
app.use(
  "/private/api",
  sansAiMiddleware({
    worker,
    environment: "debug",
    onWorkerMessage: ({ msg }) => console.log("AI Response:", msg),
  })
);

// Sample Private API Route Utilizing AI
app.post("/private/api/analyze", async (c) => {
  const data = await c.req.json();
  return c.json({ message: "Processing request with AI...", input: data });
});

// Sample Public Route (No AI Middleware)
app.get("/public/info", (c) => c.text("This is a public API endpoint."));

export default app;
```

---

### **2️⃣ Worker Thread for AI Processing (`worker.js`)**

Handles AI processing separately to prevent blocking the main event loop.

```typescript
import { parentPort } from "worker_threads";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { sansAIWorker } from "@trythis/hono-sansai";

const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });
const model = google("gemini-1.5-pro");

async function handler(payload) {
  const response = await sansAIWorker({ model, payload });
  parentPort?.postMessage(response);
}

parentPort?.on("message", handler);
```

---

## **🌟 Why This Approach?**

✅ **Scoped AI Processing** – Ensures AI runs **only** on relevant routes (e.g., `"/private/api"`).  
✅ **High Performance** – Uses **Worker Threads** to prevent blocking the main event loop.  
✅ **Best Open-Source AI Stack** – Powered by **Vercel AI SDK** and **Ollama** for seamless AI integration.  
✅ **Developer-Friendly** – Modular, scalable, and cost-efficient.

---

## Contribution Guidelines

We welcome contributions from the community. Follow these steps:

1. **Fork the Repository**
2. **Create a Feature Branch**: `git checkout -b feature-name`
3. **Commit Changes**: `git commit -m 'Description of feature'`
4. **Push to Fork**: `git push origin feature-name`
5. **Submit a Pull Request**

---

## License

This project is licensed under the MIT License. See the [LICENSE.txt](LICENSE) file for details.

## Acknowledgments

Special thanks to the organizers of the [SANS AI Cybersecurity Hackathon](https://ai-cybersecurity-hackathon.devpost.com/) for providing a platform to innovate in cybersecurity.

For more details, visit our [Devpost project page](https://devpost.com/software/ai-powered-threat-detection-incident-response).
