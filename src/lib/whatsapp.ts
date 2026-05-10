import type { CartItem } from "./cart";
import { formatINR } from "./cart";

export type CheckoutInfo = {
  name: string;
  email: string;
  phone: string;
  address: string;
  pincode?: string;
};

const DEFAULT_TEMPLATE = `Hello {customer_name},

Thank you for your order with *Shree Ji Home Decor*!

*Order ID:* {order_id}
*Status:* {status}

*Items:*
{items}

*Subtotal:* {subtotal}
*Total:* {total}

Shipping address:
{address}
Pincode: {pincode}

We will confirm shipping charges shortly. For any queries, reply to this message.`;

const DEFAULT_STATUS = `Hello {customer_name}, your Shree Ji order #{order_id} status is now: *{status}*. Thank you for shopping with us!`;

export type TemplateContext = {
  customer_name?: string;
  order_id?: string;
  status?: string;
  items?: string;
  subtotal?: string;
  total?: string;
  address?: string;
  pincode?: string;
  email?: string;
  phone?: string;
};

export function renderTemplate(template: string | null | undefined, ctx: TemplateContext) {
  const t = template || DEFAULT_TEMPLATE;
  return t.replace(/\{(\w+)\}/g, (_, k) => (ctx as any)[k] ?? `{${k}}`);
}

export function formatItemLines(items: CartItem[]) {
  return items
    .map((i, idx) => `${idx + 1}. ${i.name} — Qty: ${i.quantity} × ${formatINR(i.price)} = ${formatINR(i.price * i.quantity)}`)
    .join("\n");
}

export function buildOrderContext(info: CheckoutInfo, items: CartItem[], total: number, orderId?: string): TemplateContext {
  return {
    customer_name: info.name,
    email: info.email,
    phone: info.phone,
    address: info.address,
    pincode: info.pincode || "—",
    order_id: orderId ? orderId.slice(0, 8) : "—",
    status: "received",
    items: formatItemLines(items),
    subtotal: formatINR(total),
    total: formatINR(total),
  };
}

export function buildWhatsAppMessage(info: CheckoutInfo, items: CartItem[], total: number, template?: string, orderId?: string) {
  return renderTemplate(template, buildOrderContext(info, items, total, orderId));
}

export function renderStatusMessage(template: string | null | undefined, ctx: TemplateContext) {
  return renderTemplate(template || DEFAULT_STATUS, ctx);
}

export function whatsappUrl(phone: string, message: string) {
  const num = phone.replace(/\D/g, "");
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}

export const TEMPLATE_PLACEHOLDERS = [
  "customer_name", "order_id", "status", "items", "subtotal", "total", "address", "pincode", "email", "phone",
];

export const DEFAULT_TEMPLATES = { order: DEFAULT_TEMPLATE, status: DEFAULT_STATUS };
