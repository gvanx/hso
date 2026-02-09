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

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 11 },
  header: { marginBottom: 30 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 4 },
  subtitle: { fontSize: 12, color: "#666" },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingBottom: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  label: { color: "#555" },
  value: { fontWeight: "bold" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: "#333",
    marginTop: 8,
  },
  totalLabel: { fontSize: 14, fontWeight: "bold" },
  totalValue: { fontSize: 14, fontWeight: "bold" },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: "center",
    color: "#999",
    fontSize: 9,
  },
});

function fmt(cents: number): string {
  return `XCG ${(cents / 100).toFixed(2)}`;
}

function buildDocument(order: Order, phone: Phone) {
  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, { style: styles.title }, "HSO"),
        React.createElement(
          Text,
          { style: styles.subtitle },
          "Second Hand Phones - Curacao"
        )
      ),
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, "Invoice"),
        React.createElement(
          View,
          { style: styles.row },
          React.createElement(Text, { style: styles.label }, "Order ID:"),
          React.createElement(
            Text,
            { style: styles.value },
            order.id.slice(0, 8)
          )
        ),
        React.createElement(
          View,
          { style: styles.row },
          React.createElement(Text, { style: styles.label }, "Date:"),
          React.createElement(
            Text,
            { style: styles.value },
            new Date(order.created_at).toLocaleDateString()
          )
        )
      ),
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(
          Text,
          { style: styles.sectionTitle },
          "Customer"
        ),
        React.createElement(
          View,
          { style: styles.row },
          React.createElement(Text, { style: styles.label }, "Name:"),
          React.createElement(
            Text,
            { style: styles.value },
            order.buyer_name
          )
        ),
        React.createElement(
          View,
          { style: styles.row },
          React.createElement(Text, { style: styles.label }, "Email:"),
          React.createElement(
            Text,
            { style: styles.value },
            order.buyer_email
          )
        ),
        React.createElement(
          View,
          { style: styles.row },
          React.createElement(Text, { style: styles.label }, "Phone:"),
          React.createElement(
            Text,
            { style: styles.value },
            order.buyer_phone
          )
        )
      ),
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, "Item"),
        React.createElement(
          View,
          { style: styles.row },
          React.createElement(Text, { style: styles.label }, "Phone:"),
          React.createElement(
            Text,
            { style: styles.value },
            `${phone.brand} ${phone.model}`
          )
        ),
        React.createElement(
          View,
          { style: styles.row },
          React.createElement(Text, { style: styles.label }, "Color:"),
          React.createElement(
            Text,
            { style: styles.value },
            phone.color || "N/A"
          )
        ),
        React.createElement(
          View,
          { style: styles.row },
          React.createElement(Text, { style: styles.label }, "Grade:"),
          React.createElement(
            Text,
            { style: styles.value },
            phone.grade || "N/A"
          )
        ),
        React.createElement(
          View,
          { style: styles.row },
          React.createElement(Text, { style: styles.label }, "Reference:"),
          React.createElement(
            Text,
            { style: styles.value },
            phone.reference || "N/A"
          )
        ),
        React.createElement(
          View,
          { style: styles.totalRow },
          React.createElement(
            Text,
            { style: styles.totalLabel },
            "Total:"
          ),
          React.createElement(
            Text,
            { style: styles.totalValue },
            fmt(order.amount_cents)
          )
        )
      ),
      React.createElement(
        Text,
        { style: styles.footer },
        "HSO - Second Hand Phones | hso.connectionscuracao.net | Thank you for your purchase!"
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
