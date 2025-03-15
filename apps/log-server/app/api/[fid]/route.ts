import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { fetchMutation, fetchQuery } from "convex/nextjs";

type Logs = Doc<"logs">;

type AIMessage = {
  issue: string;
  detail: string;
  level: string;
  recommendation: string;
  tags: string[];
};

type AIRequest = {
  data: AIMessage[];
  method: string;
  endpoint: string;
};

export const POST = async (req: Request) => {
  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split("/");
    const fingerPrintId = pathSegments.pop();

    if (!fingerPrintId) {
      return Response.json(
        { message: "userId is required to complete this request" },
        { status: 403 }
      );
    }

    let user = await fetchQuery(api.log.hasAccount, { fingerPrintId });

    if (!user) {
      return Response.json(
        { message: "Invalid userId please verify and try again.", data: null },
        { status: 404 }
      );
    }

    const arg = (await req.json()) as AIRequest;
    const logs = arg.data;
    const method = arg.method;
    const endpoint = arg.endpoint;

    if (!logs && !method && !endpoint) {
      return Response.json(
        {
          message:
            "Incomplete parameters. Please provide data, method, and endpoint to complete the request.",
          data: null,
        },
        { status: 403 }
      );
    }

    if (logs.length <= 0) {
      return Response.json(
        {
          message: "Skipped this request due to insufficent context.",
          data: null,
        },
        { status: 404 }
      );
    }

    const results = await Promise.allSettled(
      logs.map((log) =>
        fetchMutation(api.log.createLog, {
          issue: log.issue,
          detail: log.detail,
          level: log.level.toLowerCase(),
          recommendation: log.recommendation,

          method: method.toLowerCase(),
          fingerPrintId: user.fingerPrintId,
          endpoint: endpoint.toLowerCase(),
          tags: log.tags.map((item) => item.toLowerCase()),
        })
      )
    );

    const successes = results
      .filter((result) => result.status === "fulfilled")
      .map((result) => (result as PromiseFulfilledResult<any>).value);

    const errors = results
      .filter((result) => result.status === "rejected")
      .map((result) => (result as PromiseRejectedResult).reason);

    return Response.json({
      message: "Batch processing complete",
      successes,
      errors,
      data: null,
    });
  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "Internal server error.", data: null },
      { status: 500 }
    );
  }
};
