import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "./AdminLayout";

export default function AdminAnalytics() {
  const [grouped, setGrouped] = useState<{ name: string; count: number }[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("cart_events").select("product_name").eq("event_type", "add");
      const map = new Map<string, number>();
      (data || []).forEach((r: any) => map.set(r.product_name, (map.get(r.product_name) || 0) + 1));
      const arr = [...map.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
      setGrouped(arr); setTotal(data?.length || 0);
    })();
  }, []);

  const max = Math.max(1, ...grouped.map(g => g.count));

  return (
    <div>
      <PageHeader title="Cart analytics" description={`${total} total add-to-cart events`} />
      <div className="bg-background border border-border p-6">
        {grouped.length === 0 ? <p className="text-muted-foreground">No data yet.</p> : (
          <ul className="space-y-3">
            {grouped.map(g => (
              <li key={g.name}>
                <div className="flex justify-between text-sm mb-1"><span>{g.name}</span><span className="text-muted-foreground">{g.count}</span></div>
                <div className="h-2 bg-secondary"><div className="h-full bg-gold" style={{ width: `${(g.count / max) * 100}%` }} /></div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
