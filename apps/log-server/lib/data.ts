export type Log = {
  id: string
  message: string
  level: "info" | "warning" | "error" | "debug"
  tags: string[]
  timestamp: string
  source: string
  metadata?: Record<string, any>
}

// This would typically be a database query
// For example with Supabase:
// const { data } = await supabase
//   .from('logs')
//   .select('*')
//   .ilike('message', `%${query}%`)
//   .contains('tags', [tag])
//   .order('timestamp', { ascending: false })
export async function getLogs({
  query = "",
  tag = "",
}: {
  query?: string
  tag?: string
}): Promise<Log[]> {
  // Mock data for demonstration
  const logs: Log[] = [
    {
      id: "1",
      message: "Server needs a restart",
      level: "warning",
      tags: ["high", "low", "/api", "/users"],
      timestamp: "2023-10-15T14:30:00Z",
      source: "api-server",
    },
    {
      id: "2",
      message: "Database connection failed",
      level: "error",
      tags: ["high", "database", "/api"],
      timestamp: "2023-10-15T14:35:00Z",
      source: "database",
    },
    {
      id: "3",
      message: "User authentication successful",
      level: "info",
      tags: ["auth", "/users", "login"],
      timestamp: "2023-10-15T14:40:00Z",
      source: "auth-service",
    },
    {
      id: "4",
      message: "Cache cleared successfully",
      level: "info",
      tags: ["cache", "performance"],
      timestamp: "2023-10-15T14:45:00Z",
      source: "cache-service",
    },
    {
      id: "5",
      message: "API rate limit exceeded",
      level: "warning",
      tags: ["api", "rate-limit", "/api/users"],
      timestamp: "2023-10-15T14:50:00Z",
      source: "api-gateway",
    },
    {
      id: "6",
      message: "Memory usage above 80%",
      level: "warning",
      tags: ["system", "memory", "high"],
      timestamp: "2023-10-15T14:55:00Z",
      source: "monitoring",
    },
    {
      id: "7",
      message: "Scheduled backup completed",
      level: "info",
      tags: ["backup", "scheduled", "database"],
      timestamp: "2023-10-15T15:00:00Z",
      source: "backup-service",
    },
    {
      id: "8",
      message: "Unhandled exception in payment processing",
      level: "error",
      tags: ["payment", "exception", "/api/payments"],
      timestamp: "2023-10-15T15:05:00Z",
      source: "payment-service",
    },
    {
      id: "9",
      message: "New user registered",
      level: "info",
      tags: ["user", "registration", "/api/users"],
      timestamp: "2023-10-15T15:10:00Z",
      source: "user-service",
    },
  ]

  // Filter by search query
  let filteredLogs = logs

  if (query) {
    filteredLogs = filteredLogs.filter(
      (log) =>
        log.message.toLowerCase().includes(query.toLowerCase()) ||
        log.source.toLowerCase().includes(query.toLowerCase()),
    )
  }

  // Filter by tag
  if (tag) {
    filteredLogs = filteredLogs.filter((log) => log.tags.includes(tag))
  }

  return filteredLogs
}

