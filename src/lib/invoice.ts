import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { Order, Phone } from "./types";

const colors = {
  primary: "#1a1a1a",
  accent: "#2563eb",
  muted: "#6b7280",
  light: "#f3f4f6",
  border: "#e5e7eb",
  white: "#ffffff",
};

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: colors.primary,
  },

  // Header
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  brand: { fontSize: 28, fontWeight: "bold", letterSpacing: 2 },
  brandSub: { fontSize: 10, color: colors.muted, marginTop: 2 },
  invoiceTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.accent,
    textAlign: "right",
  },
  invoiceMeta: {
    fontSize: 9,
    color: colors.muted,
    textAlign: "right",
    marginTop: 4,
  },

  // Divider
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 20,
  },
  dividerBold: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    marginBottom: 20,
  },

  // Two-column info
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  infoCol: { width: "48%" },
  infoLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: colors.accent,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  infoText: { fontSize: 10, lineHeight: 1.6, color: colors.primary },
  infoMuted: { fontSize: 10, lineHeight: 1.6, color: colors.muted },

  // Table
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  tableHeaderText: {
    color: colors.white,
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableRowAlt: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.light,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  colItem: { width: "50%" },
  colDetails: { width: "25%" },
  colAmount: { width: "25%", textAlign: "right" },

  // Totals
  totalsContainer: { marginTop: 12, alignItems: "flex-end" },
  totalsBox: { width: "45%" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  totalLabel: { fontSize: 10, color: colors.muted },
  totalValue: { fontSize: 10, fontWeight: "bold" },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    marginTop: 4,
    borderTopWidth: 2,
    borderTopColor: colors.primary,
  },
  grandTotalLabel: { fontSize: 13, fontWeight: "bold" },
  grandTotalValue: { fontSize: 13, fontWeight: "bold", color: colors.accent },

  // Footer
  footer: {
    position: "absolute",
    bottom: 36,
    left: 48,
    right: 48,
  },
  footerDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { fontSize: 8, color: colors.muted },
  footerCenter: { fontSize: 8, color: colors.muted, textAlign: "center" },
  thankYou: {
    fontSize: 9,
    color: colors.accent,
    textAlign: "center",
    marginTop: 8,
  },
});

function fmt(cents: number): string {
  return `XCG ${(cents / 100).toFixed(2)}`;
}

function fmtStorage(gb: number): string {
  if (gb >= 1024) return `${gb / 1024}TB`;
  return `${gb}GB`;
}

function buildDocument(order: Order, phone: Phone) {
  const e = React.createElement;
  const orderDate = new Date(order.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const itemDescription = [
    phone.color,
    phone.storage_gb ? fmtStorage(phone.storage_gb) : null,
    phone.grade ? `Grade ${phone.grade}` : null,
  ]
    .filter(Boolean)
    .join(" / ");

  return e(
    Document,
    null,
    e(
      Page,
      { size: "A4", style: styles.page },

      // ---- Header ----
      e(
        View,
        { style: styles.headerRow },
        e(
          View,
          null,
          e(Text, { style: styles.brand }, "HSO"),
          e(Text, { style: styles.brandSub }, "by Connections Punda")
        ),
        e(
          View,
          null,
          e(Text, { style: styles.invoiceTitle }, "INVOICE"),
          e(Text, { style: styles.invoiceMeta }, `#${order.id.slice(0, 8).toUpperCase()}`),
          e(Text, { style: styles.invoiceMeta }, orderDate)
        )
      ),
      e(View, { style: styles.dividerBold }),

      // ---- Bill To / From ----
      e(
        View,
        { style: styles.infoRow },
        e(
          View,
          { style: styles.infoCol },
          e(Text, { style: styles.infoLabel }, "Bill To"),
          e(Text, { style: styles.infoText }, order.buyer_name),
          e(Text, { style: styles.infoMuted }, order.buyer_email),
          e(Text, { style: styles.infoMuted }, order.buyer_phone),
          ...(order.delivery_address
            ? [e(Text, { key: "addr", style: styles.infoMuted }, order.delivery_address)]
            : [])
        ),
        e(
          View,
          { style: styles.infoCol },
          e(Text, { style: styles.infoLabel }, "From"),
          e(Text, { style: styles.infoText }, "Connections Punda"),
          e(Text, { style: styles.infoMuted }, "KVK: 79271"),
          e(Text, { style: styles.infoMuted }, "CRIB: 122.281.512"),
          e(Text, { style: styles.infoMuted }, "hso.connectionscuracao.net")
        )
      ),

      // ---- Fulfillment ----
      e(
        View,
        { style: { marginBottom: 20 } },
        e(
          Text,
          { style: { fontSize: 9, color: colors.muted } },
          `Fulfillment: ${order.fulfillment_type === "delivery" ? "Delivery" : "Store Pickup"}`
        )
      ),

      // ---- Item Table ----
      e(
        View,
        { style: styles.tableHeader },
        e(Text, { style: { ...styles.tableHeaderText, ...styles.colItem } }, "Item"),
        e(Text, { style: { ...styles.tableHeaderText, ...styles.colDetails } }, "Details"),
        e(Text, { style: { ...styles.tableHeaderText, ...styles.colAmount } }, "Amount")
      ),
      e(
        View,
        { style: styles.tableRow },
        e(
          View,
          { style: styles.colItem },
          e(Text, { style: { fontWeight: "bold", fontSize: 10 } }, `${phone.brand} ${phone.model}`),
          e(Text, { style: { fontSize: 9, color: colors.muted, marginTop: 2 } }, itemDescription || "")
        ),
        e(
          View,
          { style: styles.colDetails },
          ...(phone.reference
            ? [e(Text, { key: "ref", style: { fontSize: 9, color: colors.muted } }, `Ref: ${phone.reference}`)]
            : [])
        ),
        e(Text, { style: { ...styles.colAmount, fontWeight: "bold" } }, fmt(phone.price_cents))
      ),
      ...(order.delivery_fee_cents > 0
        ? [
            e(
              View,
              { key: "del", style: styles.tableRowAlt },
              e(Text, { style: styles.colItem }, "Delivery Fee"),
              e(Text, { style: styles.colDetails }, ""),
              e(Text, { style: { ...styles.colAmount, fontWeight: "bold" } }, fmt(order.delivery_fee_cents))
            ),
          ]
        : []),

      // ---- Totals ----
      e(
        View,
        { style: styles.totalsContainer },
        e(
          View,
          { style: styles.totalsBox },
          e(
            View,
            { style: styles.totalRow },
            e(Text, { style: styles.totalLabel }, "Subtotal"),
            e(Text, { style: styles.totalValue }, fmt(phone.price_cents))
          ),
          ...(order.delivery_fee_cents > 0
            ? [
                e(
                  View,
                  { key: "deltot", style: styles.totalRow },
                  e(Text, { style: styles.totalLabel }, "Delivery"),
                  e(Text, { style: styles.totalValue }, fmt(order.delivery_fee_cents))
                ),
              ]
            : []),
          e(
            View,
            { style: styles.grandTotalRow },
            e(Text, { style: styles.grandTotalLabel }, "Total"),
            e(Text, { style: styles.grandTotalValue }, fmt(order.amount_cents))
          )
        )
      ),

      // ---- Footer ----
      e(
        View,
        { style: styles.footer },
        e(View, { style: styles.footerDivider }),
        e(
          View,
          { style: styles.footerRow },
          e(Text, { style: styles.footerText }, "Connections Punda  |  KVK: 79271  |  CRIB: 122.281.512"),
          e(Text, { style: styles.footerText }, "hso.connectionscuracao.net")
        ),
        e(Text, { style: styles.thankYou }, "Thank you for your purchase!")
      )
    )
  );
}

export async function generateInvoicePdf(
  order: Order,
  phone: Phone
): Promise<Buffer> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = buildDocument(order, phone) as any;
  const buffer = await renderToBuffer(doc);
  return Buffer.from(buffer);
}
