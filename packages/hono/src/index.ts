import type { LanguageModelV1 } from "ai";
import { generateObject } from "ai";
import type { Context as HonoContext } from "hono";
import { createMiddleware } from "hono/factory";
import { Worker } from "node:worker_threads";
import { z } from "zod";
import { SansAIWorkerError } from "./error.js";
import { decodeBinaryToObject, encodeObjectToBinary } from "./utils/index.js";

export * from "./utils/index.js";

type Context = HonoContext<any, string, {}>;

type TransformRequest = (args: { ctx: Context }) => Payload;

type PrepareAiPayload = (args: {
  payload: Payload;
  ctx: Context;
}) => Partial<Payload>;

type OnWorkerMessage = (args: {
  msg: AIMessage[] | null;
  ctx: Context;
}) => void;

type AiMiddlewareProps = {
  /**
   * Specifies the runtime environment. Default is `"debug"`.
   *
   * In `"development"` mode, all AI operations will be skipped.
   * To enable full functionality, set the environment to `"debug"` or `"production"`.
   */
  environment?: "debug" | "development" | "production";
  /**
   * Specify an additional instruction.
   */
  prompt?: string;
  skipOnRedirects?: boolean;
  includeRouteHandler?: boolean;
  worker: Worker;

  /**
   * Extracts relevant properties from the incoming request.
   */
  transformRequest?: TransformRequest;

  /**
   * Modifies the AI request payload before making the final API call.
   */
  prepareAiPayload?: PrepareAiPayload;

  /**
   * Handles AI responses from the worker.
   *
   * Alternatively, you can attach an `onmessage` handler manually:
   *
   * ```js
   * worker.on("message", (message) => {
   *   // Note: `message` is a buffer.
   *   console.error(`Worker message: ${message}`);
   * });
   * ```
   */
  onWorkerMessage?: OnWorkerMessage;
};

export type Payload = {
  endpoint: string;
  method: string;
  req_headers?: Record<string, string | unknown>;

  /** Optional plain text response body. */
  res_text?: string;

  /** Optional JSON response body. */
  res_json?: Record<string, any>;

  /** Includes any error that may have occurred within the route. */
  error?: Error;

  /** The route handler containing the logic for the endpoint. */
  route_handler?: string;
};

export type AIMessage = {
  issue: string;
  detail: string;
  level: string;
  recommendation: string;
};

export type PayloadWithExtraProps = Payload & {
  prompt?: string;
};

export const sansAiMiddleware = ({
  environment = "debug",
  prompt,
  worker,
  transformRequest,
  prepareAiPayload,
  skipOnRedirects = true,
  includeRouteHandler = false,
  onWorkerMessage,
}: AiMiddlewareProps) => {
  return createMiddleware(async (ctx, next) => {
    /*
    Ensure that certain methods are called after next().
    For example, calling `await ctx.res.json()` before `next()` 
    will return an undefined value.
    */
    await next();

    // This way so we can do nothing if there was no model, since we can't do a return in a middleware.
    if (
      (environment && environment === "debug") ||
      environment === "production"
    ) {
      let default_payload: PayloadWithExtraProps = {
        endpoint: ctx.req.path,
        method: ctx.req.method,
        req_headers: ctx.req.header(),
      };

      const path = ctx.req.path;
      const routes = ctx.req.matchedRoutes.find((r) => r.path === path);

      const endpointHandler = routes?.handler.toString();

      if (endpointHandler && includeRouteHandler) {
        default_payload["route_handler"] = endpointHandler;
      }

      if (transformRequest) {
        const custom_payload = transformRequest({ ctx });
        default_payload = { ...default_payload, ...custom_payload };
      }

      const responseType = ctx.res.headers.get("Content-Type");
      const isRedirect = ctx.res.status >= 300 && ctx.res.status < 400;

      if (
        responseType === "application/json" ||
        responseType?.includes("application/json")
      ) {
        default_payload["res_json"] = await ctx.res.json();
      }

      if (responseType?.includes("text/plain")) {
        const resText = await ctx.res.text();
        ctx.res = new Response(resText);

        default_payload["res_text"] = resText;
      }

      if (ctx.error) {
        default_payload["error"] = ctx.error;
      }

      if (prompt) {
        default_payload["prompt"] = prompt;
      }

      if (worker) {
        worker.on("message", (message: Uint8Array<ArrayBufferLike>) => {
          if (onWorkerMessage) {
            const decodedObject = decodeBinaryToObject(message);
            onWorkerMessage({ ctx, msg: decodedObject });
          }
        });

        worker.on("error", (error) => {
          // console.error(`Worker error: ${error}`);
        });

        let transformed_payload = {} as Partial<PayloadWithExtraProps>;
        if (prepareAiPayload) {
          transformed_payload = {
            ...prepareAiPayload({ ctx, payload: default_payload }),
          };
        } else {
          transformed_payload = { ...default_payload };
        }

        if (!isRedirect || !skipOnRedirects) {
          worker.postMessage(transformed_payload);
        }
      }
    }
  });
};

/**
 *
 * @param param0
 * @returns
 */
export const sansAIWorker = async ({
  model,
  payload,
}: {
  model: LanguageModelV1;
  payload: Payload;
}) => {
  const p = payload as PayloadWithExtraProps;

  if (!model) {
    throw new SansAIWorkerError(
      "[sansAIWorker] Missing required argument: 'model'."
    );
  }

  if (!payload) {
    throw new SansAIWorkerError(
      "[sansAIWorker] Missing required argument: 'payload'."
    );
  }

  console.log("p", p);

  const { object } = await generateObject({
    temperature: 0.8,
    output: "array",
    schema: z.object({
      issue: z.string().describe("The issue eg SQl injectin attempt detected."),
      detail: z.string().describe("Extra details describing the issue."),
      level: z.string().describe("Issue severity eg HIGH | LOW"),
      recommendation: z.string().describe("Possible solution to the isssue"),
    }),
    model,
    prompt: `
    Context: ${JSON.stringify(payload)}.
    ${p?.prompt ? `Additional instruction: ${p?.prompt}.` : ""}`,
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

  // const object = [
  //   { id: "1", name: "emee" },
  //   { id: "2", name: "fos" },
  // ];

  // console.log("object", object);

  const buffer = encodeObjectToBinary(object);

  return buffer;
};
