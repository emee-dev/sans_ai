# **Advanced AI Middleware**

## **Project Overview**

### **AI-Powered Threat Detection & Incident Response**

This project leverages AI-driven threat detection to enhance real-time cybersecurity. It passively monitors endpoint activity, identifies potential threats, and provides immediate feedback to mitigate risks, following OWASP best practices.

## **Features**

- **Real-Time Monitoring** – Continuously analyzes endpoint and API activity for anomalies and threats.
- **AI-Driven Detection** – Uses machine learning to detect both known and emerging attack vectors.
- **Scoped AI Middleware** – Applies AI logic **only** to designated routes (e.g., `/private/api`).
- **Efficient Worker Processing** – Offloads AI tasks to **Node.js Worker Threads** for optimal performance.
- **User-Friendly Dashboard** – Provides security teams with logs, threat insights, and response management tools.
- **Open-Source & Scalable** – Built with **Vercel AI SDK** and **Ollama** for cost-efficient, modular, and developer-friendly AI inference.

## **Technologies Used**

- **Hono** – Advanced routing and middleware framework.
- **Ollama** – Local AI workflows.
- **Vercel AI SDK** – Provides an easy abstraction for various LLMs.
- **Worker Threads** – Enables non-blocking AI task execution.
- **TypeScript** – Ensures type safety and maintainability.
- **Next.js** – Frontend framework for the dashboard.

---

## **Project Structure**

This project follows a **monorepo** structure, organized as follows:

### **Applications**

- **`/apps/log-server/`** – A minimal Next.js application serving as an internal tool for visualizing AI logs. It provides an intuitive interface for searching and analyzing AI-based threat assessments.

- **`/apps/demo-server/`** – A lightweight **Hono.js** server that demonstrates the integration of the AI middleware. It includes:
  - **`/apps/demo-server/src/worker.js`** – Handles AI-driven API request analysis using worker threads.

### **Packages**

- **`/packages/hono/`** – The core AI middleware SDK, built with:
  - **Vercel AI SDK** – Simplifies integration with various LLMs.
  - **Ollama** – Local AI inference support via Vercel AI SDK.
  - **Node.js Worker Threads** – Offloads expensive AI operations to maintain non-blocking performance.

---

## **Getting Started**

To run the project, set up a **Hono.js server** and install the AI middleware package.

### **Installing the Hono AI Middleware**

Use any of the following package managers:

```sh
# npm
npm i @trythis/hono-sansai

# pnpm
pnpm add @trythis/hono-sansai

# yarn
yarn add @trythis/hono-sansai
```

For more details, refer to the [README](packages/hono/README.md).
