import { parentPort } from "node:worker_threads";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { sansAIWorker } from "@trythis/hono-sansai";

/**
 * Handles the given payload.
 *
 * @param {Payload} payload - The request payload containing details about the API request.
 *
 * @typedef {Object} Payload
 * @property {string} endpoint - The API endpoint being accessed.
 * @property {string} method - The HTTP method (e.g., GET, POST).
 * @property {Record<string, string | unknown>} [req_headers] - Optional request headers.
 * @property {string} [res_text] - Optional plain text response body.
 * @property {Record<string, any>} [res_json] - Optional JSON response body.
 * @property {any} [error] - Includes any error that may have occurred within the route.
 * @property {string} [route_handler] - The route handler containing the logic for the endpoint.
 */
async function handler(payload) {
  const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const model = google("gemini-1.5-pro");

  const object = await sansAIWorker({
    model,
    payload,
  });

  parentPort?.postMessage(object);
}

parentPort?.on("message", handler);
