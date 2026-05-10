import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatINR } from "@/lib/cart";
import { renderStatusMessage, whatsappUrl, DEFAULT_TEMPLATES } from "@/lib/whatsapp";
import { toast } from "sonner";

const STATUSES = ["received", "packed", "shipped", "out_for_delivery", "delivered"];

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [tax, setTax] = useState("0");
  const [ship, setShip] = useState("0");
  const [template, setTemplate] = useState<string>(DEFAULT_TEMPLATES.status);
  const [customMsg, setCustomMsg] = useState("");

  useEffect(() => { load(); }, [id]);
  async function load() {
    if (!id) return;
    const { data: o } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
    const { data: it } = await supabase.from("order_items").select("*").eq("order_id", id);
    setOrder(o);
    setItems(it || []);
    if (o) {
      setTax(String(o.tax_amount || 0));
      setShip(String(o.shipping_amount || 0));
    }
    const { data: settings } = await supabase.from("site_settings").select("status_update_template").maybeSingle();
    if (settings?.status_update_template) setTemplate(settings.status_update_template);
  }

  const previewMsg = order ? renderStatusMessage(template, {
    customer_name: order.customer_name,
    order_id: order.id.slice(0, 8),
    status: (order.order_status || "").replace(/_/g, " "),
  }) : "";
  const finalMsg = customMsg || previewMsg;

  if (!order) return <div className="text-muted-foreground">Loading…</div>;

  const updateStatus = async (status: string) => {
    await supabase.from("orders").update({ order_status: status }).eq("id", order.id);
    toast.success(`Status: ${status}`);
    load();
  };

  const updatePayment = async (status: string) => {
    await supabase.from("orders").update({ payment_status: status }).eq("id", order.id);
    toast.success(`Payment: ${status}`);
    load();
  };

  const updateAmounts = async () => {
    const t = parseFloat(tax) || 0, s = parseFloat(ship) || 0;
    const total = Number(order.subtotal) + t + s;
    await supabase.from("orders").update({ tax_amount: t, shipping_amount: s, total_amount: total }).eq("id", order.id);
    toast.success("Amounts updated");
    load();
  };

  return (
    <div>
      <Link to="/admin/orders" className="text-xs tracking-luxe uppercase text-muted-foreground hover:text-gold">← Back to orders</Link>
      <PageHeader title={`Order #${order.id.slice(0, 8)}`} description={new Date(order.created_at).toLocaleString()} />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Section title="Items">
            <ul className="divide-y divide-border">
              {items.map(i => (
                <li key={i.id} className="py-3 flex justify-between text-sm">
                  <span>{i.product_name} × {i.quantity}</span>
                  <span>{formatINR(Number(i.line_total))}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-border mt-3 pt-3 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatINR(Number(order.subtotal))}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>{formatINR(Number(order.tax_amount))}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{formatINR(Number(order.shipping_amount))}</span></div>
              <div className="flex justify-between font-medium"><span>Total</span><span className="text-gold-dark">{formatINR(Number(order.total_amount))}</span></div>
            </div>
          </Section>

          <Section title="Update tax & shipping">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs uppercase tracking-luxe">Tax</Label><Input type="number" value={tax} onChange={e => setTax(e.target.value)} /></div>
              <div><Label className="text-xs uppercase tracking-luxe">Shipping</Label><Input type="number" value={ship} onChange={e => setShip(e.target.value)} /></div>
            </div>
            <Button variant="luxe" size="sm" className="mt-4" onClick={updateAmounts}>Save amounts</Button>
          </Section>

          <Section title="Order tracking">
            <div className="flex flex-wrap gap-2">
              {STATUSES.map(s => (
                <button key={s} onClick={() => updateStatus(s)}
                  className={`text-xs tracking-luxe uppercase px-4 py-2 border transition-colors ${
                    order.order_status === s ? "bg-gold text-white border-gold" : "border-border hover:border-gold hover:text-gold"
                  }`}>{s.replace(/_/g, " ")}</button>
              ))}
            </div>
            <div className="mt-5 border-t border-border pt-5">
              <Label className="text-xs uppercase tracking-luxe mb-2 block">WhatsApp message preview</Label>
              <Textarea
                rows={5}
                value={finalMsg}
                onChange={e => setCustomMsg(e.target.value)}
                className="font-mono text-xs bg-secondary/40"
              />
              <p className="text-[10px] text-muted-foreground mt-2">Edit before sending if needed. Template can be configured in Settings.</p>
              <a href={whatsappUrl(order.phone, finalMsg)} target="_blank" rel="noreferrer">
                <Button variant="outlineGold" size="sm" className="mt-3">Send via WhatsApp</Button>
              </a>
            </div>
          </Section>

          <Section title="Payment status">
            <div className="flex gap-2">
              {["pending", "paid", "refunded"].map(s => (
                <button key={s} onClick={() => updatePayment(s)}
                  className={`text-xs tracking-luxe uppercase px-4 py-2 border ${order.payment_status === s ? "bg-espresso text-ivory border-espresso" : "border-border hover:border-gold"}`}>{s}</button>
              ))}
            </div>
          </Section>
        </div>

        <aside className="space-y-6">
          <Section title="Customer">
            <dl className="text-sm space-y-2">
              <div><dt className="text-xs uppercase tracking-luxe text-muted-foreground">Name</dt><dd>{order.customer_name}</dd></div>
              <div><dt className="text-xs uppercase tracking-luxe text-muted-foreground">Email</dt><dd>{order.email}</dd></div>
              <div><dt className="text-xs uppercase tracking-luxe text-muted-foreground">Phone</dt><dd>{order.phone}</dd></div>
              <div><dt className="text-xs uppercase tracking-luxe text-muted-foreground">Address</dt><dd className="whitespace-pre-line">{order.address}</dd></div>
              {order.pincode && <div><dt className="text-xs uppercase tracking-luxe text-muted-foreground">Pincode</dt><dd>{order.pincode}</dd></div>}
            </dl>
          </Section>
        </aside>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-background border border-border p-6">
      <h2 className="font-serif text-xl text-espresso mb-4">{title}</h2>
      {children}
    </div>
  );
}
