"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatStorage, getStatusColor, getGradeColor } from "@/lib/utils";
import { toast } from "sonner";
import type { Phone } from "@/lib/types";
import { MoreHorizontal, Pencil, Trash2, Smartphone, XCircle, ShoppingBag, Search } from "lucide-react";

export function AdminPhoneTable({ phones }: { phones: Phone[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [refSearch, setRefSearch] = useState("");

  const filteredPhones = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return phones;
    return phones.filter((p) =>
      [p.model, p.brand, p.reference, p.color]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q))
    );
  }, [phones, search]);

  const refResults = useMemo(() => {
    const q = refSearch.trim().toLowerCase();
    if (!q) return [];
    return phones.filter(
      (p) => p.reference && p.reference.toLowerCase().includes(q)
    );
  }, [phones, refSearch]);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this phone?")) return;
    setDeleting(id);

    const { error } = await supabase.from("phones").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Phone deleted");
      router.refresh();
    }
    setDeleting(null);
  }

  async function handleCancelReservation(phone: Phone) {
    if (!confirm(`Cancel reservation for ${phone.model}? This will make it available again.`)) return;
    setActing(phone.id);

    const { error: phoneError } = await supabase
      .from("phones")
      .update({ status: "available" })
      .eq("id", phone.id);

    if (phoneError) {
      toast.error(phoneError.message);
      setActing(null);
      return;
    }

    // Cancel any pending orders for this phone
    await supabase
      .from("orders")
      .update({ payment_status: "cancelled" })
      .eq("phone_id", phone.id)
      .in("payment_status", ["created", "issued", "pending"]);

    toast.success("Reservation cancelled");
    router.refresh();
    setActing(null);
  }

  async function handleMarkAsSold(phone: Phone) {
    if (!confirm(`Mark ${phone.model} as sold (walk-in sale)?`)) return;
    setActing(phone.id);

    const res = await fetch(`/api/admin/phones/${phone.id}/sold`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    if (!res.ok) {
      toast.error("Failed to mark as sold");
    } else {
      toast.success("Phone marked as sold");
      router.refresh();
    }
    setActing(null);
  }

  function renderTable(list: Phone[], emptyMessage: string) {
    return (
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16"></TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              list.map((phone) => (
                <TableRow key={phone.id}>
                  <TableCell>
                    {phone.images?.[0] ? (
                      <div className="relative w-10 h-10 rounded overflow-hidden">
                        <Image
                          src={phone.images[0]}
                          alt={phone.model}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {phone.model}{phone.storage_gb ? ` ${formatStorage(phone.storage_gb)}` : ""}
                  </TableCell>
                  <TableCell>{phone.brand}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {phone.reference || "-"}
                  </TableCell>
                  <TableCell>{formatCurrency(phone.price_cents)}</TableCell>
                  <TableCell>
                    {phone.grade ? (
                      <Badge variant="secondary" className={getGradeColor(phone.grade)}>
                        {phone.grade}
                      </Badge>
                    ) : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={getStatusColor(phone.status)}
                    >
                      {phone.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/phones/${phone.id}/edit`}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        {phone.status === "reserved" && (
                          <DropdownMenuItem
                            onClick={() => handleCancelReservation(phone)}
                            disabled={acting === phone.id}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancel Reservation
                          </DropdownMenuItem>
                        )}
                        {phone.status === "available" && (
                          <DropdownMenuItem
                            onClick={() => handleMarkAsSold(phone)}
                            disabled={acting === phone.id}
                          >
                            <ShoppingBag className="h-4 w-4 mr-2" />
                            Mark as Sold
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleDelete(phone.id)}
                          disabled={deleting === phone.id}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <Tabs defaultValue="all" className="space-y-4">
      <TabsList>
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="ref">Ref / IMEI</TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by model, brand, reference, or color..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {renderTable(filteredPhones, search ? "No phones match your search." : "No phones yet. Add your first phone.")}
      </TabsContent>

      <TabsContent value="ref" className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Enter reference number or IMEI..."
            value={refSearch}
            onChange={(e) => setRefSearch(e.target.value)}
            className="pl-9 font-mono"
          />
        </div>
        {refSearch.trim()
          ? renderTable(refResults, "No phone found with that reference/IMEI.")
          : <p className="text-sm text-muted-foreground text-center py-8">Enter a reference number or IMEI to look up a phone.</p>
        }
      </TabsContent>
    </Tabs>
  );
}
