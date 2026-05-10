import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "./AdminLayout";
import { formatINR } from "@/lib/cart";
import { ShoppingCart, IndianRupee, Clock, CheckCircle2 } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, revenue: 0, pending: 0, completed: 0 });
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: orders } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      const list = orders || [];
      setStats({
        total: list.length,
        revenue: list.reduce((s, o) => s + Number(o.total_amount || 0), 0),
        pending: list.filter(o => !["delivered"].includes(o.order_status)).length,
        completed: list.filter(o => o.order_status === "delivered").length,
      });
      setRecent(list.slice(0, 5));
    })();
  }, []);

  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of your store" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <Stat icon={ShoppingCart} label="Total orders" value={stats.total.toString()} />
        <Stat icon={IndianRupee} label="Total revenue" value={formatINR(stats.revenue)} />
        <Stat icon={Clock} label="Pending" value={stats.pending.toString()} />
        <Stat icon={CheckCircle2} label="Completed" value={stats.completed.toString()} />
      </div>

      <div className="bg-background border border-border p-6">
        <h2 className="font-serif text-2xl text-espresso mb-4">Recent orders</h2>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs tracking-luxe uppercase text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-3">Customer</th><th>Email</th><th>Total</th><th>Status</th><th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recent.map(o => (
                  <tr key={o.id} className="border-b border-border/60">
                    <td className="py-3">
                      <Link to={`/admin/orders/${o.id}`} className="hover:text-gold">{o.customer_name}</Link>
                    </td>
                    <td className="text-muted-foreground">{o.email}</td>
                    <td>{formatINR(Number(o.total_amount))}</td>
                    <td><span className="text-xs tracking-luxe uppercase text-gold">{o.order_status}</span></td>
                    <td className="text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="bg-background border border-border p-6">
      <div className="flex items-center justify-between">
        <p className="text-xs tracking-luxe uppercase text-muted-foreground">{label}</p>
        <Icon className="w-4 h-4 text-gold" />
      </div>
      <p className="font-serif text-3xl text-espresso mt-3">{value}</p>
    </div>
  );
}
