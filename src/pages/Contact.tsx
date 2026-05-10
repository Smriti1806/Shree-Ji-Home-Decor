import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const schema = z.object({
  customer_name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  message: z.string().trim().min(10).max(1000),
});

export default function Contact() {
  const [form, setForm] = useState({ customer_name: "", email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setSubmitting(true);
    const { error } = await supabase.from("complaints").insert({
      customer_name: parsed.data.customer_name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      message: parsed.data.message,
    });
    setSubmitting(false);
    if (error) { toast.error("Could not send message"); return; }
    toast.success("Thank you. We'll be in touch shortly.");
    setForm({ customer_name: "", email: "", phone: "", message: "" });
  };

  return (
    <div className="container py-16 max-w-2xl">
      <header className="text-center mb-12">
        <p className="text-xs tracking-luxe uppercase text-gold mb-3">Get in touch</p>
        <h1 className="font-serif text-5xl text-espresso">Contact us</h1>
        <p className="text-muted-foreground mt-4">For complaints, queries, or anything in between — we're here.</p>
        <p className="text-sm text-espresso/70 mt-3">Or email us directly at <a href="mailto:hdecor433@gmail.com" className="text-gold hover:underline">hdecor433@gmail.com</a></p>
      </header>

      <form onSubmit={submit} className="space-y-5">
        <Field label="Your name"><Input value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })} required /></Field>
        <Field label="Email"><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></Field>
        <Field label="Phone (optional)"><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></Field>
        <Field label="Message"><Textarea rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required /></Field>
        <Button type="submit" variant="gold" size="lg" className="w-full" disabled={submitting}>{submitting ? "Sending…" : "Send message"}</Button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs tracking-luxe uppercase text-espresso/70 mb-2 block">{label}</Label>
      {children}
    </div>
  );
}
