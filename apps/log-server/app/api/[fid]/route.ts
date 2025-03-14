import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { fetchMutation, fetchQuery } from "convex/nextjs";

type Logs = Doc<"logs">;

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

    const arg = (await req.json()) as { data: Logs[] };
    const logs = arg.data;

    const results = await Promise.allSettled(
      logs.map((log) =>
        fetchMutation(api.log.createLog, {
          fingerPrintId: user.fingerPrintId,
          issue: log.issue,
          detail: log.detail,
          level: log.level.toLowerCase(),
          method: log.method.toLowerCase(),
          recommendation: log.recommendation,
          endpoint: log.endpoint.toLowerCase(),
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
    });
  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "Internal server error.", data: null },
      { status: 500 }
    );
  }
};
