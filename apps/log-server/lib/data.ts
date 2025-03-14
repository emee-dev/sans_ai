export type Log = {
  id: string;
  message: string;
  level: "info" | "warning" | "error" | "debug";
  tags: string[];
  timestamp: string;
  endpoint: string;
  metadata?: Record<string, any>;
};

export async function getLogs({
  endpoint = "",
  tag = "",
}: {
  endpoint?: string;
  tag?: string;
}): Promise<Log[]> {
  // Mock data for demonstration
  const logs: Log[] = [
    {
      id: "1",
      message: "Server needs a restart",
      level: "warning",
      tags: ["high", "low", "/api", "/users"],
      timestamp: "2023-10-15T14:30:00Z",
      endpoint: "/api/users",
    },
    {
      id: "2",
      message: "Database connection failed",
      level: "error",
      tags: ["high", "database", "/api"],
      timestamp: "2023-10-15T14:35:00Z",
      endpoint: "/api/users",
    },
    {
      id: "3",
      message: "User authentication successful",
      level: "info",
      tags: ["auth", "/users", "login"],
      timestamp: "2023-10-15T14:40:00Z",
      endpoint: "/api/payments",
    },
    {
      id: "4",
      message: "Cache cleared successfully",
      level: "info",
      tags: ["cache", "performance"],
      timestamp: "2023-10-15T14:45:00Z",
      endpoint: "/",
    },
    {
      id: "5",
      message: "API rate limit exceeded",
      level: "warning",
      tags: ["api", "rate-limit", "/api/users"],
      timestamp: "2023-10-15T14:50:00Z",
      endpoint: "/api/logs",
    },
    {
      id: "6",
      message: "Memory usage above 80%",
      level: "warning",
      tags: ["system", "memory", "high"],
      timestamp: "2023-10-15T14:55:00Z",
      endpoint: "/monitors",
    },
    {
      id: "7",
      message: "Scheduled backup completed",
      level: "info",
      tags: ["backup", "scheduled", "database"],
      timestamp: "2023-10-15T15:00:00Z",
      endpoint: "/api-keys",
    },
    {
      id: "8",
      message: "Unhandled exception in payment processing",
      level: "error",
      tags: ["payment", "exception", "/api/payments"],
      timestamp: "2023-10-15T15:05:00Z",
      endpoint: "/payments",
    },
    {
      id: "9",
      message: "New user registered",
      level: "info",
      tags: ["user", "registration", "/api/users"],
      timestamp: "2023-10-15T15:10:00Z",
      endpoint: "/webhook",
    },
  ];

  // Filter by endpoint
  let filteredLogs = logs;

  if (endpoint) {
    filteredLogs = filteredLogs.filter((log) =>
      log.endpoint.toLowerCase().includes(endpoint.toLowerCase())
    );
  }

  // Filter by tag
  if (tag) {
    filteredLogs = filteredLogs.filter((log) => log.tags.includes(tag));
  }

  return filteredLogs;
}
