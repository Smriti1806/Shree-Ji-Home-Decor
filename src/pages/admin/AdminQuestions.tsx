import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";

type Q = {
  id: string;
  customer_name: string;
  email: string | null;
  question: string;
  answer: string | null;
  is_public: boolean;
  answered_at: string | null;
  created_at: string;
};

export default function AdminQuestions() {
  const [list, setList] = useState<Q[]>([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, { answer: string; is_public: boolean }>>({});

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("customer_questions" as any)
      .select("*")
      .order("created_at", { ascending: false });
    const rows = ((data as any) || []) as Q[];
    setList(rows);
    setDrafts(Object.fromEntries(rows.map(r => [r.id, { answer: r.answer || "", is_public: r.is_public }])));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async (q: Q) => {
    const d = drafts[q.id];
    if (!d) return;
    const trimmed = d.answer.trim();
    const { error } = await supabase
      .from("customer_questions" as any)
      .update({
        answer: trimmed || null,
        is_public: d.is_public,
        answered_at: trimmed ? new Date().toISOString() : null,
      })
      .eq("id", q.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved");
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("customer_questions" as any).delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    load();
  };

  return (
    <div>
      <PageHeader title="Customer questions" description="Answer questions submitted from the About page" />

      {loading ? (
        <div className="text-muted-foreground">Loading…</div>
      ) : list.length === 0 ? (
        <div className="bg-background border border-border p-10 text-center text-muted-foreground">
          No questions yet.
        </div>
      ) : (
        <div className="space-y-4">
          {list.map(q => {
            const d = drafts[q.id] || { answer: "", is_public: false };
            return (
              <div key={q.id} className="bg-background border border-border p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="font-serif text-lg text-espresso">{q.customer_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {q.email || "No email"} · {new Date(q.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {q.answer && <span className="text-[10px] tracking-luxe uppercase text-gold">Answered</span>}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">Delete</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this question?</AlertDialogTitle>
                          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => remove(q.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="bg-secondary/40 border border-border p-4 mb-4">
                  <p className="text-[10px] tracking-luxe uppercase text-muted-foreground mb-1">Question</p>
                  <p className="text-sm text-espresso whitespace-pre-wrap">{q.question}</p>
                </div>

                <div>
                  <Label className="text-xs uppercase tracking-luxe mb-2 block">Your answer</Label>
                  <Textarea
                    rows={4}
                    value={d.answer}
                    onChange={e => setDrafts({ ...drafts, [q.id]: { ...d, answer: e.target.value } })}
                    placeholder="Write a clear, helpful response…"
                  />
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={d.is_public}
                      onCheckedChange={(v) => setDrafts({ ...drafts, [q.id]: { ...d, is_public: v } })}
                    />
                    <span className="text-xs text-espresso/80">Show on About page</span>
                  </div>
                  <Button variant="luxe" onClick={() => save(q)}>Save answer</Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
