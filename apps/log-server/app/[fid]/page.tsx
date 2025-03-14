"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { type Doc } from "@/convex/_generated/dataModel";
import { useCopy } from "@/hooks/use-copy";
import { shortenNumber } from "@/hooks/use-fingerprint";
import { convexQuery, useConvexPaginatedQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { Check, Copy, Search } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useState } from "react";

type PageProps = {
  /** Short for `"endpoint"` */
  ep?: string;
  /** Short for `"method"` */
  md?: string;
  /** Short for `"level"` */
  lv?: string;
  tag?: string;
};

type Logs = Doc<"logs">;

export default function LogsPage({
  params,
  searchParams,
}: {
  params: Promise<{ fid?: string }>;
  searchParams: Promise<PageProps>;
}) {
  const [query, _] = useState("");
  const { copied, copyToClipboard } = useCopy();

  const { fid } = use(params);
  const { ep, tag, lv, md } = use(searchParams);

  // Paginated does not support tag queries.
  const {
    loadMore,
    isLoading: dataQueryWithoutTagIsLoading,
    results: dataQueryWithoutTag,
    status,
  } = useConvexPaginatedQuery(
    api.log.listAllLogs,
    fid && !tag
      ? {
          fingerPrintId: fid,
        }
      : "skip",
    { initialNumItems: 5 }
  );

  // Non paginated does support tag queries
  const {
    data: dataQueryWithTags,
    isPending: dataQueryWithTagsIsPending,
    error: dataQueryWithTagsError,
  } = useQuery(
    convexQuery(
      api.log.listAllLogsByTag,
      fid && tag ? { fingerPrintId: fid, tag } : "skip"
    )
  );

  if (!fid) {
    return notFound();
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col space-y-8">
        <div className="flex items-center">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Server Logs</h1>
            <p className="text-muted-foreground">
              View and search through server logs
            </p>
          </div>
          <div
            className="ml-auto text-sm flex items-center gap-x-2"
            onClick={() => copyToClipboard(fid)}
          >
            <span>UserId: {shortenNumber(fid)}</span>{" "}
            {!copied && <Copy className="h-4" />}
            {copied && <Check className="h-4" />}
          </div>
        </div>

        <div className="flex w-full max-w-sm items-center space-x-2">
          <form
            className="flex w-full max-w-sm items-center space-x-2"
            action="/logs"
          >
            <Input
              type="search"
              name="q"
              placeholder="Search logs..."
              defaultValue={query}
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>
          </form>
        </div>

        {tag && (
          <div className="flex items-center space-x-2">
            <p className="text-sm text-muted-foreground">Filtered by tag:</p>
            <Badge variant="secondary" className={`${getBadgeColor(tag)}`}>
              {tag}
            </Badge>
            <Button variant="link" size="sm" asChild>
              <Link href={`/${fid}`}>Clear filter</Link>
            </Button>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 font-geist">
          {!tag &&
            dataQueryWithoutTag &&
            renderServerLogs({
              fid,
              error: null,
              log: dataQueryWithoutTag,
              isLoading: dataQueryWithoutTagIsLoading,
            })}

          {tag &&
            dataQueryWithTags &&
            renderServerLogs({
              fid,
              error: dataQueryWithTagsError,
              log: dataQueryWithTags,
              isLoading: dataQueryWithTagsIsPending,
            })}
        </div>
      </div>
    </div>
  );
}

function getBadgeVariant(
  level: string
): "default" | "destructive" | "outline" | "secondary" {
  switch (level.toLowerCase()) {
    case "error":
      return "destructive";
    case "warning":
      return "secondary";
    case "info":
      return "default";
    default:
      return "outline";
  }
}

function getBadgeColor(level: string) {
  switch (level.toLowerCase()) {
    case "critical":
      return "bg-red-600 text-white"; // Critical (high severity)
    case "high":
      return "bg-orange-500 text-white"; // High severity
    case "medium":
      return "bg-yellow-400 text-black"; // Medium severity
    case "low":
      return "bg-green-500 text-white"; // Low severity
    default:
      return "bg-gray-300 text-black"; // Default (Unknown)
  }
}

function renderServerLogs({
  log,
  fid,
  isLoading,
  error = null,
}: {
  isLoading: boolean;
  log: Logs[];
  fid: string;
  error: Error | null;
}) {
  if (error && !isLoading) {
    console.error(error);
    return (
      <div className="col-span-full flex justify-center py-10">
        <p className="text-muted-foreground">Error: {error.message}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="col-span-full flex justify-center py-10">
        <p className="text-muted-foreground">Loading data... please wait.</p>
      </div>
    );
  }

  return log.length > 0 ? (
    log.map((log) => (
      <Card key={log._id}>
        <CardHeader>
          <CardTitle className="flex justify-between items-start">
            <Link href={`/${fid}?ep=${log.endpoint}`}>
              <span className="text-base font-medium">
                {log.method.toUpperCase()} {log.endpoint}
              </span>
            </Link>
            {/* <Badge variant={getBadgeVariant(log.level)}>{log.level}</Badge> */}
            <Badge
              variant={getBadgeVariant(log.level)}
              className={`${getBadgeColor(log.level)}`}
            >
              {log.level}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{log.recommendation}</p>
        </CardContent>
        <CardFooter className="flex flex-col items-start space-y-2">
          <div className="flex flex-wrap gap-2">
            {log.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                <Link href={`/${fid}?tag=${tag}`}>{tag}</Link>
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {new Date(log._creationTime).toLocaleString()}
          </p>
        </CardFooter>
      </Card>
    ))
  ) : (
    <div className="col-span-full flex justify-center py-10">
      <p className="text-muted-foreground">No logs found</p>
    </div>
  );
}
