import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const ADMIN_EMAIL = "admin@shreeji.com";

const schema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(72),
});

export default function AdminLogin() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [form, setForm] = useState({ email: ADMIN_EMAIL, password: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user && isAdmin) navigate("/admin");
  }, [user, isAdmin, loading, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setBusy(true);

    if (mode === "signup") {
      if (form.email !== ADMIN_EMAIL) {
        toast.error("Only the admin email may register here.");
        setBusy(false); return;
      }
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      if (error) { toast.error(error.message); setBusy(false); return; }
      if (data.user) {
        await supabase.from("user_roles").insert({ user_id: data.user.id, role: "admin" });
      }
      toast.success("Admin account created. Signing in…");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
      if (error) { toast.error(error.message); setBusy(false); return; }
    }

    setBusy(false);
  };

  const forgotPassword = async () => {
    if (!form.email) { toast.error("Enter your admin email first"); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success("Reset email sent. Check your inbox.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/40 p-4">
      <div className="w-full max-w-md bg-background shadow-luxe p-10">
        <div className="text-center mb-8">
          <p className="text-xs tracking-luxe uppercase text-gold mb-2">Shree Ji</p>
          <h1 className="font-serif text-4xl text-espresso">Admin {mode === "signup" ? "Setup" : "Login"}</h1>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label className="text-xs tracking-luxe uppercase mb-2 block">Email</Label>
            <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <Label className="text-xs tracking-luxe uppercase mb-2 block">Password</Label>
            <Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
          </div>
          <Button type="submit" variant="luxe" size="lg" className="w-full" disabled={busy}>
            {busy ? "Please wait…" : mode === "signup" ? "Create admin account" : "Sign in"}
          </Button>
        </form>
        <div className="text-center mt-6 space-y-2">
          <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="block w-full text-xs tracking-luxe uppercase text-muted-foreground hover:text-gold">
            {mode === "signin" ? "First time? Create admin account" : "Have an account? Sign in"}
          </button>
          {mode === "signin" && (
            <button type="button" onClick={forgotPassword} className="block w-full text-xs tracking-luxe uppercase text-muted-foreground hover:text-gold">
              Forgot password?
            </button>
          )}
        </div>
        <p className="text-[10px] text-center text-muted-foreground mt-6">Admin email: {ADMIN_EMAIL}</p>
      </div>
    </div>
  );
}
