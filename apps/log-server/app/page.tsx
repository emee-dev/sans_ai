"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useCopy } from "@/hooks/use-copy";
import { shortenNumber, useFingerPrint } from "@/hooks/use-fingerprint";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Check,
  Copy,
  Loader2,
  PillIcon,
  StarIcon,
  WandIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function Component() {
  const { copied, copyToClipboard } = useCopy();
  const { fingerPrintId } = useFingerPrint();
  const router = useRouter();

  const {
    data: hasAccountData,
    isPending: hasAccountIsPending,
    error: hasAccountError,
    refetch,
  } = useQuery(convexQuery(api.log.hasAccount, { fingerPrintId }));

  const {
    mutate: createUser,
    data: createUserData,
    isPending: createUserIsPending,
    error: createUserError,
  } = useMutation({
    mutationFn: useConvexMutation(api.log.createUserAccount),
  });

  useEffect(() => {
    if (hasAccountError) {
      toast("Account validation failed!", {
        description: `Error: ${hasAccountError.message}`,
        action: {
          label: "Retry",
          onClick: () => refetch(),
        },
      });
    }

    if (createUserError && fingerPrintId) {
      toast("Account creation failed!", {
        description: `Error: ${createUserError.message}`,
        action: {
          label: "Retry",
          onClick: () => createUser({ fingerPrintId }),
        },
      });
    }

    if (createUserData && !createUserIsPending) {
      toast("Account created!", {
        description: "You have created an account.",
        action: {
          label: "Redirect me",
          onClick: () => router.push(`/${fingerPrintId}`),
        },
      });
    }
  }, [
    hasAccountError,
    createUserError,
    createUserData,
    createUserIsPending,
    fingerPrintId,
  ]);

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col space-y-8">
        <div className="flex items-center">
          <div className="flex flex-col space-y-2">
            <h1 className="text-lg font-bold tracking-tight">Server Logs</h1>
          </div>
          <div
            className="ml-auto text-sm flex items-center gap-x-2"
            onClick={() => copyToClipboard(fingerPrintId)}
          >
            <span>UserId: {shortenNumber(fingerPrintId)}</span>{" "}
            {!copied && <Copy className="h-4" />}
            {copied && <Check className="h-4" />}
          </div>
        </div>
        <Card className="mx-auto max-w-md font-geist">
          <CardHeader>
            <CardTitle className="text-xl font-bold">
              Monitor server logs.
            </CardTitle>
            <CardDescription>
              Create a a unique userId to proceed.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-start gap-4">
              <WandIcon className="h-6 w-6 fill-primary" />
              <div>
                <h3 className="font-medium">AI-Powered OSINT Insights</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Leverage AI-driven intelligence to extract actionable insights
                  from data sources efficiently.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <PillIcon className="h-6 w-6 fill-primary" />
              <div>
                <h3 className="font-medium">Automated Data Collection</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Streamline intelligence gathering with minimal manual effort,
                  allowing analysts to focus on critical decision-making.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <StarIcon className="h-6 w-6 fill-primary" />
              <div>
                <h3 className="font-medium">Built for Developers</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Modular, scalable, and cost-effective—designed for seamless
                  integration into your existing workflow.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex">
            {hasAccountIsPending ? (
              <Button variant="default" className="w-full" disabled>
                <Loader2 className="animate-spin mr-1" /> Verifying userId
              </Button>
            ) : createUserIsPending ? (
              <Button
                variant="default"
                className="w-full flex items-center"
                disabled
              >
                <Loader2 className="animate-spin mr-2" />
                Creating account...
              </Button>
            ) : hasAccountData ? (
              <Button
                variant="default"
                className="w-full"
                onClick={() => router.push(`/${fingerPrintId}`)}
              >
                Goto Dashboard
              </Button>
            ) : (
              <Button
                variant="default"
                className="w-full"
                onClick={() => createUser({ fingerPrintId })}
              >
                Create account
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
