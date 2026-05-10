import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatINR, useCart } from "@/lib/cart";
import { buildWhatsAppMessage, whatsappUrl } from "@/lib/whatsapp";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().min(7, "Phone is required").max(20),
  address: z.string().trim().min(10, "Please enter full address").max(500),
  pincode: z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
});

const WHATSAPP_NUMBER = "+919460557934";

export default function Checkout() {
  const { items, total, clear } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", pincode: "" });
  const [submitting, setSubmitting] = useState(false);

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        customer_name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        pincode: form.pincode,
        subtotal: total,
        total_amount: total,
        payment_method: "whatsapp",
        payment_status: "pending",
        order_status: "received",
        is_complete: true,
      })
      .select()
      .single();

    if (error || !order) {
      toast.error("Could not place order. Please try again.");
      setSubmitting(false);
      return;
    }

    await supabase.from("order_items").insert(
      items.map(i => ({
        order_id: order.id,
        product_id: i.id,
        product_name: i.name,
        unit_price: i.price,
        quantity: i.quantity,
        line_total: i.price * i.quantity,
      }))
    );

    const { data: settings } = await supabase.from("site_settings").select("whatsapp_template, whatsapp_number").maybeSingle();
    const msg = buildWhatsAppMessage(form, items, total, settings?.whatsapp_template, order.id);
    const url = whatsappUrl(settings?.whatsapp_number || WHATSAPP_NUMBER, msg);
    clear();
    window.open(url, "_blank");
    navigate("/order-success");
  };

  return (
    <div className="container py-16 max-w-5xl">
      <header className="text-center mb-12">
        <p className="text-xs tracking-luxe uppercase text-gold mb-3">Almost there</p>
        <h1 className="font-serif text-5xl text-espresso">Checkout</h1>
      </header>

      <div className="grid lg:grid-cols-3 gap-12">
        <form onSubmit={submit} className="lg:col-span-2 space-y-5">
          <Field label="Full name"><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></Field>
          <Field label="Email"><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></Field>
          <Field label="Phone number"><Input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required /></Field>
          <Field label="Shipping address"><Textarea rows={4} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} required /></Field>
          <Field label="Pincode"><Input inputMode="numeric" maxLength={6} value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value.replace(/\D/g, "") })} required /></Field>

          <div className="border border-gold/40 bg-gold/5 p-5">
            <p className="text-xs tracking-luxe uppercase text-gold mb-1">Shipping</p>
            <p className="text-sm text-espresso/75">Shipping charges will be applied based on your location and confirmed via WhatsApp.</p>
          </div>

          <div className="border border-gold/40 bg-gold/5 p-5">
            <p className="text-xs tracking-luxe uppercase text-gold mb-1">No return policy</p>
            <p className="text-sm text-espresso/75">All sales are final. Please review your order carefully.</p>
          </div>

          <Button type="submit" variant="gold" size="xl" className="w-full" disabled={submitting}>
            {submitting ? "Placing order…" : "Place order via WhatsApp"}
          </Button>
        </form>

        <aside className="bg-secondary/40 p-8 h-fit">
          <h2 className="font-serif text-2xl text-espresso mb-6">Your order</h2>
          <ul className="space-y-3 text-sm">
            {items.map(i => (
              <li key={i.id} className="flex justify-between gap-4">
                <span>{i.name} <span className="text-muted-foreground">× {i.quantity}</span></span>
                <span className="text-espresso">{formatINR(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="h-px bg-border my-5" />
          <div className="flex justify-between font-medium text-lg">
            <span>Total</span><span className="text-gold-dark">{formatINR(total)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs tracking-luxe uppercase text-espresso/70 mb-2 block">{label}</Label>
      {children}
    </div>
  );
}
