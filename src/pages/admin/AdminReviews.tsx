import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Check, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => { load(); }, []);
  const load = async () => {
    const { data } = await supabase.from("reviews").select("*, products(name)").order("created_at", { ascending: false });
    setReviews(data || []);
  };

  const approve = async (id: string) => { await supabase.from("reviews").update({ approved: true }).eq("id", id); toast.success("Approved"); load(); };
  const remove = async (id: string) => { await supabase.from("reviews").delete().eq("id", id); toast.success("Deleted"); load(); };

  return (
    <div>
      <PageHeader title="Reviews" />
      <div className="space-y-3">
        {reviews.map(r => (
          <div key={r.id} className="bg-background border border-border p-5 flex gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="font-medium text-espresso">{r.customer_name}</h3>
                <span className="text-gold tracking-widest text-sm">{"★".repeat(r.rating)}</span>
                <span className={`text-[10px] tracking-luxe uppercase px-2 py-0.5 ${r.approved ? "bg-gold/10 text-gold-dark" : "bg-secondary text-muted-foreground"}`}>{r.approved ? "Approved" : "Pending"}</span>
              </div>
              {r.products?.name && <p className="text-xs text-muted-foreground mt-1">on {r.products.name}</p>}
              <p className="text-sm text-espresso/80 mt-2">{r.comment}</p>
            </div>
            <div className="flex flex-col gap-2">
              {!r.approved && <Button size="sm" variant="outline" onClick={() => approve(r.id)}><Check className="w-3.5 h-3.5" /></Button>}
              <Button size="sm" variant="outline" onClick={() => remove(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
            </div>
          </div>
        ))}
        {reviews.length === 0 && <p className="text-center text-muted-foreground py-12">No reviews yet.</p>}
      </div>
    </div>
  );
}
