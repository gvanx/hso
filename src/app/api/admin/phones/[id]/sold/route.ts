import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: phoneId } = await params;
  const supabase = await createClient();

  // Verify user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const orderId = body.order_id;

  // Mark phone as sold
  const { error: phoneError } = await supabase
    .from("phones")
    .update({ status: "sold" })
    .eq("id", phoneId);

  if (phoneError) {
    return NextResponse.json(
      { error: "Failed to update phone" },
      { status: 500 }
    );
  }

  // If order provided, mark as manual
  if (orderId) {
    await supabase
      .from("orders")
      .update({ payment_status: "manual" })
      .eq("id", orderId);
  }

  return NextResponse.json({ success: true });
}
