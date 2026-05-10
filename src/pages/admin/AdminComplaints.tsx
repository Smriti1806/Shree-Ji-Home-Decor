import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminComplaints() {
  const [list, setList] = useState<any[]>([]);

  useEffect(() => { load(); }, []);
  const load = async () => {
    const { data } = await supabase.from("complaints").select("*").order("created_at", { ascending: false });
    setList(data || []);
  };

  const setStatus = async (id: string, status: string) => {
    await supabase.from("complaints").update({ status }).eq("id", id);
    toast.success(status); load();
  };

  return (
    <div>
      <PageHeader title="Complaints" />
      <div className="space-y-3">
        {list.map(c => (
          <div key={c.id} className="bg-background border border-border p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-medium text-espresso">{c.customer_name}</h3>
                  <span className={`text-[10px] tracking-luxe uppercase px-2 py-0.5 ${c.status === "resolved" ? "bg-gold/10 text-gold-dark" : "bg-secondary text-muted-foreground"}`}>{c.status}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{c.email}{c.phone && ` · ${c.phone}`} · {new Date(c.created_at).toLocaleDateString()}</p>
                <p className="text-sm text-espresso/80 mt-2">{c.message}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setStatus(c.id, c.status === "resolved" ? "pending" : "resolved")}>
                  {c.status === "resolved" ? "Reopen" : "Mark resolved"}
                </Button>
              </div>
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="text-center text-muted-foreground py-12">No complaints yet.</p>}
      </div>
    </div>
  );
}
