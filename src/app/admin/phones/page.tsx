export const dynamic = "force-dynamic";

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminPhoneTable } from "@/components/AdminPhoneTable";
import { CleanupReservedButton } from "@/components/CleanupReservedButton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function AdminPhonesPage() {
  const supabase = await createClient();

  const { data: phones } = await supabase
    .from("phones")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Phones</h1>
        <div className="flex items-center gap-2">
          <CleanupReservedButton />
          <Button asChild>
            <Link href="/admin/phones/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Phone
            </Link>
          </Button>
        </div>
      </div>
      <AdminPhoneTable phones={phones || []} />
    </div>
  );
}
