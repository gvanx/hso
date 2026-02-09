import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PhoneForm } from "@/components/PhoneForm";

export default async function EditPhonePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: phone } = await supabase
    .from("phones")
    .select("*")
    .eq("id", id)
    .single();

  if (!phone) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Edit Phone</h1>
      <PhoneForm phone={phone} />
    </div>
  );
}
