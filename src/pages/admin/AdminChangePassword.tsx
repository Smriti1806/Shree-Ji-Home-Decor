import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  current: z.string().min(6, "Enter your current password"),
  next: z.string().min(8, "New password must be at least 8 characters").max(72),
  confirm: z.string(),
}).refine(d => d.next === d.confirm, { message: "Passwords do not match", path: ["confirm"] })
  .refine(d => d.next !== d.current, { message: "New password must differ from current", path: ["next"] });

export default function AdminChangePassword() {
  const { user } = useAuth();
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    if (!user?.email) { toast.error("Not signed in"); return; }
    setBusy(true);

    // Re-verify current password
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: user.email, password: form.current,
    });
    if (signInErr) { toast.error("Current password is incorrect"); setBusy(false); return; }

    const { error } = await supabase.auth.updateUser({ password: form.next });
    if (error) { toast.error(error.message); setBusy(false); return; }

    toast.success("Password updated successfully");
    setForm({ current: "", next: "", confirm: "" });
    setBusy(false);
  };

  return (
    <div>
      <PageHeader title="Change Password" description="Update your admin account password" />
      <form onSubmit={submit} className="bg-background border border-border p-6 max-w-md space-y-5">
        <div>
          <Label className="text-xs uppercase tracking-luxe mb-2 block">Email</Label>
          <Input value={user?.email || ""} disabled />
        </div>
        <div>
          <Label className="text-xs uppercase tracking-luxe mb-2 block">Current password</Label>
          <Input type="password" value={form.current} onChange={e => setForm({ ...form, current: e.target.value })} required />
        </div>
        <div>
          <Label className="text-xs uppercase tracking-luxe mb-2 block">New password</Label>
          <Input type="password" value={form.next} onChange={e => setForm({ ...form, next: e.target.value })} required minLength={8} />
          <p className="text-[11px] text-muted-foreground mt-1">Minimum 8 characters.</p>
        </div>
        <div>
          <Label className="text-xs uppercase tracking-luxe mb-2 block">Confirm new password</Label>
          <Input type="password" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} required minLength={8} />
        </div>
        <Button type="submit" variant="luxe" size="lg" disabled={busy}>
          {busy ? "Updating…" : "Update password"}
        </Button>
      </form>
    </div>
  );
}
