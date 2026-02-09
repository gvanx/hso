"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUploader } from "./ImageUploader";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Phone } from "@/lib/types";
import { Loader2 } from "lucide-react";

interface PhoneFormProps {
  phone?: Phone;
}

export function PhoneForm({ phone }: PhoneFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const isEditing = !!phone;

  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>(phone?.images || []);
  const [formData, setFormData] = useState({
    model: phone?.model || "",
    brand: phone?.brand || "",
    price: phone ? (phone.price_cents / 100).toFixed(2) : "",
    color: phone?.color || "",
    battery_pct: phone?.battery_pct?.toString() || "",
    reference: phone?.reference || "",
    grade: phone?.grade || "",
    description: phone?.description || "",
    status: phone?.status || "available",
  });

  function updateField(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const priceCents = Math.round(parseFloat(formData.price) * 100);
    if (isNaN(priceCents) || priceCents < 0) {
      toast.error("Invalid price");
      setLoading(false);
      return;
    }

    const payload = {
      model: formData.model,
      brand: formData.brand,
      price_cents: priceCents,
      color: formData.color || null,
      battery_pct: formData.battery_pct
        ? parseInt(formData.battery_pct)
        : null,
      reference: formData.reference || null,
      grade: formData.grade || null,
      description: formData.description || null,
      images,
      status: formData.status,
    };

    let error;
    if (isEditing) {
      ({ error } = await supabase
        .from("phones")
        .update(payload)
        .eq("id", phone.id));
    } else {
      ({ error } = await supabase.from("phones").insert(payload));
    }

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success(isEditing ? "Phone updated" : "Phone added");
    router.push("/admin/phones");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="brand">Brand *</Label>
          <Input
            id="brand"
            required
            value={formData.brand}
            onChange={(e) => updateField("brand", e.target.value)}
            placeholder="e.g. Apple"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="model">Model *</Label>
          <Input
            id="model"
            required
            value={formData.model}
            onChange={(e) => updateField("model", e.target.value)}
            placeholder="e.g. iPhone 13 Pro"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price (XCG) *</Label>
          <Input
            id="price"
            required
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => updateField("price", e.target.value)}
            placeholder="450.00"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            value={formData.color}
            onChange={(e) => updateField("color", e.target.value)}
            placeholder="e.g. Space Gray"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="battery_pct">Battery %</Label>
          <Input
            id="battery_pct"
            type="number"
            min="0"
            max="100"
            value={formData.battery_pct}
            onChange={(e) => updateField("battery_pct", e.target.value)}
            placeholder="85"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="reference">Reference / IMEI</Label>
          <Input
            id="reference"
            value={formData.reference}
            onChange={(e) => updateField("reference", e.target.value)}
            placeholder="IMEI or internal ref"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="grade">Grade</Label>
          <Select
            value={formData.grade || "none"}
            onValueChange={(v) => updateField("grade", v === "none" ? "" : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select grade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No grade</SelectItem>
              <SelectItem value="A">A - Excellent</SelectItem>
              <SelectItem value="B">B - Good</SelectItem>
              <SelectItem value="C">C - Fair</SelectItem>
              <SelectItem value="D">D - Poor</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {isEditing && (
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(v) => updateField("status", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Optional description..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Images</Label>
        <ImageUploader images={images} onImagesChange={setImages} />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isEditing ? "Update Phone" : "Add Phone"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
