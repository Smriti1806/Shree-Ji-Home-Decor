import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "./AdminLayout";
import { formatINR } from "@/lib/cart";
import { Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => { load(); }, []);
  const load = async () => {
    const { data } = await supabase.from("orders").select("*").eq("is_complete", true).order("created_at", { ascending: false });
    setOrders(data || []);
  };

  const deleteOrder = async (id: string) => {
    await supabase.from("order_items").delete().eq("order_id", id);
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Order deleted");
    load();
  };

  return (
    <div>
      <PageHeader title="Orders" description="All confirmed orders" />
      <div className="bg-background border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs tracking-luxe uppercase text-muted-foreground border-b border-border bg-secondary/40">
            <tr>
              <th className="p-3">ID</th><th>Email</th><th>Amount</th><th>Method</th>
              <th>Payment</th><th>Status</th><th>Tax</th><th>Shipping</th><th>Created</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} className="border-b border-border/60">
                <td className="p-3 font-mono text-xs">{o.id.slice(0, 8)}</td>
                <td>{o.email}</td>
                <td>{formatINR(Number(o.total_amount))}</td>
                <td className="capitalize">{o.payment_method}</td>
                <td><Badge>{o.payment_status}</Badge></td>
                <td><Badge tone="gold">{o.order_status}</Badge></td>
                <td>{formatINR(Number(o.tax_amount || 0))}</td>
                <td>{formatINR(Number(o.shipping_amount || 0))}</td>
                <td className="text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                <td>
                  <div className="flex items-center gap-3">
                    <Link to={`/admin/orders/${o.id}`} className="inline-flex items-center gap-1 text-gold hover:underline text-xs">
                      <Eye className="w-3 h-3" /> View
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="inline-flex items-center gap-1 text-destructive hover:underline text-xs">
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this order?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This permanently removes order #{o.id.slice(0, 8)} and its items. Use this for cancelled orders.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteOrder(o.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={10} className="p-8 text-center text-muted-foreground">No orders yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Badge({ children, tone }: { children: React.ReactNode; tone?: "gold" }) {
  return (
    <span className={`text-[10px] tracking-luxe uppercase px-2 py-1 ${tone === "gold" ? "bg-gold/10 text-gold-dark" : "bg-secondary text-espresso/70"}`}>
      {children}
    </span>
  );
}
