"use client";

import { useState } from "react";
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
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import { toast } from "sonner";
import type { Phone } from "@/lib/types";
import { MoreHorizontal, Pencil, Trash2, Smartphone } from "lucide-react";

export function AdminPhoneTable({ phones }: { phones: Phone[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [deleting, setDeleting] = useState<string | null>(null);

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

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16"></TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Brand</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Grade</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {phones.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No phones yet. Add your first phone.
              </TableCell>
            </TableRow>
          ) : (
            phones.map((phone) => (
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
                <TableCell className="font-medium">{phone.model}</TableCell>
                <TableCell>{phone.brand}</TableCell>
                <TableCell>{formatCurrency(phone.price_cents)}</TableCell>
                <TableCell>{phone.grade || "-"}</TableCell>
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
