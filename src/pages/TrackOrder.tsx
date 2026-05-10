import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatINR } from "@/lib/cart";
import { toast } from "sonner";

const STATUS_LABELS: Record<string, string> = {
  received: "Received",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
};
const STEPS = ["received", "packed", "shipped", "out_for_delivery", "delivered"];

export default function TrackOrder() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[] | null>(null);
  const [busy, setBusy] = useState(false);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setBusy(true);
    const { data, error } = await supabase.rpc("track_orders", { _query: query.trim() });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setResults(data || []);
  };

  return (
    <div className="container py-16 max-w-3xl">
      <header className="text-center mb-10">
        <p className="text-xs tracking-luxe uppercase text-gold mb-3">Track</p>
        <h1 className="font-serif text-5xl text-espresso">Your order</h1>
        <p className="text-sm text-muted-foreground mt-3">Enter the email or phone number used at checkout.</p>
      </header>

      <form onSubmit={search} className="bg-background border border-border p-6 flex flex-col gap-4">
        <div>
          <Label className="text-xs uppercase tracking-luxe mb-2 block">Email or phone</Label>
          <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="you@example.com or 9460557934" />
        </div>
        <Button type="submit" variant="luxe" size="lg" disabled={busy}>{busy ? "Searching…" : "Track order"}</Button>
      </form>

      {results !== null && (
        <div className="mt-10 space-y-6">
          {results.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No orders found for that contact.</p>
          ) : (
            results.map(o => {
              const stepIdx = STEPS.indexOf(o.order_status);
              return (
                <div key={o.id} className="bg-background border border-border p-6">
                  <div className="flex justify-between items-start mb-5">
                    <div>
                      <p className="text-xs tracking-luxe uppercase text-gold">Order #{o.id.slice(0, 8)}</p>
                      <h3 className="font-serif text-xl text-espresso mt-1">{o.customer_name}</h3>
                      <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()} · {o.item_count} item{o.item_count > 1 ? "s" : ""}</p>
                    </div>
                    <p className="font-medium text-gold-dark">{formatINR(Number(o.total_amount))}</p>
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {STEPS.map((s, i) => (
                      <div key={s} className="text-center">
                        <div className={`h-1 ${i <= stepIdx ? "bg-gold" : "bg-border"}`} />
                        <p className={`text-[10px] tracking-luxe uppercase mt-2 ${i === stepIdx ? "text-gold-dark font-medium" : "text-muted-foreground"}`}>
                          {STATUS_LABELS[s]}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-5">
                    Payment: <span className="text-espresso">{o.payment_status}</span>
                  </p>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
