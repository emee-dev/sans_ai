"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const convexQueryClient = new ConvexQueryClient(convex);
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryKeyHashFn: convexQueryClient.hashFn(),
      queryFn: convexQueryClient.queryFn(),
    },
  },
});

convexQueryClient.connect(queryClient);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ConvexProvider client={convex}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ConvexProvider>
  );
}
