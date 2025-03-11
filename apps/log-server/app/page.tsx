"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getLogs, Log } from "@/lib/data";
import { useEffect, useState } from "react";

export default function LogsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string }>;
}) {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("");
  const [logs, setLogs] = useState<Log[]>([]);

  async function getSearch() {
    const { q, tag } = await searchParams;

    let logs = await getLogs({ query: q, tag });
    setLogs(logs);
  }

  useEffect(() => {
    getSearch();
  }, []);

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col space-y-8">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Server Logs</h1>
          <p className="text-muted-foreground">
            View and search through server logs
          </p>
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
            <Badge variant="secondary">{tag}</Badge>
            <Button variant="link" size="sm" asChild>
              <Link href="/">Clear filter</Link>
            </Button>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {logs.map((log) => (
            <Card key={log.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <span className="text-base font-medium">{log.level}</span>
                  <Badge variant={getBadgeVariant(log.level)}>
                    {log.level}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{log.message}</p>
              </CardContent>
              <CardFooter className="flex flex-col items-start space-y-2">
                <div className="flex flex-wrap gap-2">
                  {log.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      <Link href={`/?tag=${tag}`}>{tag}</Link>
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(log.timestamp).toLocaleString()}
                </p>
              </CardFooter>
            </Card>
          ))}

          {logs.length === 0 && (
            <div className="col-span-full flex justify-center py-10">
              <p className="text-muted-foreground">No logs found</p>
            </div>
          )}
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
