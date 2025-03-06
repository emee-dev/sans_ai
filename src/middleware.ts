import type { LanguageModelV1 } from "ai";
import { createMiddleware } from "hono/factory";
import { generateObject } from "ai";
import type { BlankEnv, BlankSchema } from "hono/types";
import type { Context, Hono } from "hono";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOllama } from "ollama-ai-provider";

type OnRequest = ({ ctx }: { ctx: Context<any, string, {}> }) => Payload;

type AiMiddlewareProps = {
  app: Hono<BlankEnv, BlankSchema, "/">;
  model: LanguageModelV1;
  prompt?: string;
  onRequest?: OnRequest;
};

type Payload = {
  endpoint: string;
  method: string;
  req_headers: Record<string, string | unknown>;

  // Request body
  res_text?: string;
  res_json?: Record<string, any>;
};

const GEMINI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

export const AiMiddleware = (args: AiMiddlewareProps) => {
  return createMiddleware(async (ctx, next) => {
    if (!GEMINI_API_KEY) {
      return;
    }

    const google = createGoogleGenerativeAI({
      apiKey: GEMINI_API_KEY,
    });

    let default_payload: Payload = {
      endpoint: ctx.req.url,
      method: ctx.req.method,
      req_headers: ctx.req.header(),
    };

    const model = args.model ? args.model : google("gemini-2.0-flash-001");

    if (ctx.error) {
      console.log("1. Middleware is faulty.");
    }

    await next();

    if (!model) {
      console.log("Error picking a model.");
      return Response.json({ message: "Invalid model." }, { status: 500 });
    }

    if (args.onRequest) {
      const custom_payload = args.onRequest({ ctx });

      default_payload = custom_payload;
      // console.log(custom_payload);
    }

    // if (c.res.text) {
    //   default_payload["res_text"] = await c.res.text();
    // }

    // if (c.res.json) {
    //   default_payload["res_json"] = await c.res.json();
    // }

    if (ctx.error) {
      console.log("2. Middleware is faulty.");
    }

    const { object } = await generateObject({
      temperature: 0.8,
      output: "array",
      schema: "" as any,
      // schema: z.object({
      //   tweet: z
      //     .string()
      //     .describe("The content of tweet ready to posted on Twitter."),
      // }),
      model: model as any,
      system: `
      You are an AI security bot that passively monitors HTTP requests and responses.
      Your goal is to analyze requests and responses for potential security risks based on OWASP best practices.
      
      - Do not interfere with requests or responses.
      - Log issues if you detect potential security vulnerabilities.
      - Look for OWASP Top 10 issues, such as:
        - SQL Injection (e.g., suspicious SQL keywords in request params)
        - Cross-Site Scripting (XSS) (e.g., \`<script>\` tags in inputs)
        - Security Misconfigurations (e.g., missing HTTP security headers)
        - API vulnerabilities (e.g., improper authentication in API requests)
      - Provide actionable insights in concise logs.
      
      Example Log Format:
      {
        "issue": "SQL Injection Attempt",
        "detail": \`Detected "UNION SELECT" in query parameter "user_id"\`,
        "level": "HIGH",
        "recommendation": "Sanitize inputs and use parameterized queries",
      }
    `,
    });
  });
};
