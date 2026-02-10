"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";

export function CleanupReservedButton() {
  const router = useRouter();
  const [running, setRunning] = useState(false);

  async function handleCleanup() {
    setRunning(true);
    try {
      const res = await fetch("/api/admin/cleanup-reserved", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Cleanup failed");
        return;
      }
      if (data.reverted === 0) {
        toast.info("No stale reservations found");
      } else {
        toast.success(`Reverted ${data.reverted} stale reservation(s)`);
        router.refresh();
      }
    } catch {
      toast.error("Cleanup request failed");
    } finally {
      setRunning(false);
    }
  }

  return (
    <Button variant="outline" onClick={handleCleanup} disabled={running}>
      <RefreshCw className={`h-4 w-4 mr-2 ${running ? "animate-spin" : ""}`} />
      {running ? "Cleaning up..." : "Cleanup Reservations"}
    </Button>
  );
}
