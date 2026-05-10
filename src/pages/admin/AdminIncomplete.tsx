import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "./AdminLayout";
import { formatINR } from "@/lib/cart";

export default function AdminIncomplete() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      // Sessions that added items but have no completed order in same window — approximated as recent add events
      const { data } = await supabase.from("cart_events").select("*").eq("event_type", "add").order("created_at", { ascending: false }).limit(100);
      setEvents(data || []);
    })();
  }, []);

  // Group by session_id
  const grouped = new Map<string, any[]>();
  events.forEach(e => {
    const k = e.session_id || "unknown";
    if (!grouped.has(k)) grouped.set(k, []);
    grouped.get(k)!.push(e);
  });

  return (
    <div>
      <PageHeader title="Incomplete carts" description="Sessions that added products but didn't checkout" />
      <div className="space-y-3">
        {[...grouped.entries()].map(([sid, items]) => (
          <div key={sid} className="bg-background border border-border p-4">
            <p className="text-xs tracking-luxe uppercase text-muted-foreground">Session {sid.slice(0, 8)} · {new Date(items[0].created_at).toLocaleString()}</p>
            <ul className="mt-2 text-sm space-y-1">
              {items.map(i => <li key={i.id}>· {i.product_name}</li>)}
            </ul>
          </div>
        ))}
        {grouped.size === 0 && <p className="text-center text-muted-foreground py-12">No incomplete carts.</p>}
      </div>
    </div>
  );
}
