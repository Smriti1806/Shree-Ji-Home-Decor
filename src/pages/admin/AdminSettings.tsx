import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { renderTemplate, renderStatusMessage, TEMPLATE_PLACEHOLDERS, DEFAULT_TEMPLATES } from "@/lib/whatsapp";
import { toast } from "sonner";

export default function AdminSettings() {
  const [s, setS] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    supabase.from("site_settings").select("*").maybeSingle().then(({ data }) => setS(data));
  }, []);

  if (!s) return <div className="text-muted-foreground">Loading…</div>;

  const save = async () => {
    const { error } = await supabase.from("site_settings").update({
      brand_name: s.brand_name, website_name: s.website_name, tagline: s.tagline, logo_url: s.logo_url,
      primary_color: s.primary_color, whatsapp_number: s.whatsapp_number,
      whatsapp_template: s.whatsapp_template, status_update_template: s.status_update_template,
      seo_title: s.seo_title, seo_description: s.seo_description, seo_keywords: s.seo_keywords,
      home_gallery: s.home_gallery || [],
      home_carousel: s.home_carousel || [],
      about_content: s.about_content,
      instagram_url: s.instagram_url,
    }).eq("id", s.id);
    if (error) toast.error(error.message); else toast.success("Settings saved");
  };

  const uploadLogo = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `logo-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("brand-assets").upload(path, file, { contentType: file.type });
    if (error) { toast.error(error.message); setUploading(false); return; }
    const { data } = supabase.storage.from("brand-assets").getPublicUrl(path);
    setS({ ...s, logo_url: data.publicUrl });
    setUploading(false);
  };

  const uploadGallery = async (files: FileList) => {
    const added: string[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      const ext = file.name.split(".").pop();
      const path = `home-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
      const { error } = await supabase.storage.from("brand-assets").upload(path, file, { contentType: file.type });
      if (error) { toast.error(error.message); continue; }
      const { data } = supabase.storage.from("brand-assets").getPublicUrl(path);
      added.push(data.publicUrl);
    }
    setS({ ...s, home_gallery: [...(s.home_gallery || []), ...added].slice(0, 4) });
  };

  const removeGallery = (url: string) => setS({ ...s, home_gallery: (s.home_gallery || []).filter((u: string) => u !== url) });

  const uploadCarousel = async (files: FileList) => {
    const added: string[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      const ext = file.name.split(".").pop();
      const path = `carousel-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
      const { error } = await supabase.storage.from("brand-assets").upload(path, file, { contentType: file.type });
      if (error) { toast.error(error.message); continue; }
      const { data } = supabase.storage.from("brand-assets").getPublicUrl(path);
      added.push(data.publicUrl);
    }
    setS({ ...s, home_carousel: [...(s.home_carousel || []), ...added] });
  };
  const removeCarousel = (url: string) => setS({ ...s, home_carousel: (s.home_carousel || []).filter((u: string) => u !== url) });

  return (
    <div>
      <PageHeader title="Settings" description="Brand, contact and SEO" />
      <div className="bg-background border border-border p-6 max-w-2xl space-y-5">
        <div>
          <Label className="text-xs uppercase tracking-luxe mb-2 block">Logo</Label>
          {s.logo_url && <img src={s.logo_url} alt="logo" className="h-16 mb-2" />}
          <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && uploadLogo(e.target.files[0])} />
          {uploading && <p className="text-xs text-muted-foreground mt-1">Uploading…</p>}
        </div>
        <Field label="Brand name"><Input value={s.brand_name} onChange={e => setS({ ...s, brand_name: e.target.value })} /></Field>
        <Field label="Website name"><Input value={s.website_name} onChange={e => setS({ ...s, website_name: e.target.value })} /></Field>
        <Field label="Tagline"><Input value={s.tagline} onChange={e => setS({ ...s, tagline: e.target.value })} /></Field>
        <Field label="WhatsApp number (with +country code)"><Input value={s.whatsapp_number} onChange={e => setS({ ...s, whatsapp_number: e.target.value })} /></Field>
        <Field label="Primary color (hex)"><Input value={s.primary_color} onChange={e => setS({ ...s, primary_color: e.target.value })} /></Field>

        <Field label="Instagram URL"><Input value={s.instagram_url || ""} onChange={e => setS({ ...s, instagram_url: e.target.value })} /></Field>

        <div className="border-t border-border pt-5">
          <h3 className="font-serif text-xl text-espresso mb-2">Home page product carousel</h3>
          <p className="text-xs text-muted-foreground mb-4">Add as many product images as you want — they appear in a sliding carousel on the home page.</p>
          {(s.home_carousel || []).length > 0 && (
            <div className="grid grid-cols-4 gap-3 mb-3">
              {(s.home_carousel || []).map((url: string) => (
                <div key={url} className="relative group aspect-[4/5] bg-secondary/40 overflow-hidden">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeCarousel(url)} className="absolute top-1 right-1 bg-espresso/80 text-ivory text-[10px] px-2 py-1 tracking-luxe uppercase opacity-0 group-hover:opacity-100 transition-opacity">Remove</button>
                </div>
              ))}
            </div>
          )}
          <input type="file" accept="image/*" multiple onChange={e => e.target.files && uploadCarousel(e.target.files)} />
        </div>

        <div className="border-t border-border pt-5">
          <h3 className="font-serif text-xl text-espresso mb-2">About us page</h3>
          <p className="text-xs text-muted-foreground mb-4">Separate paragraphs with a blank line.</p>
          <Textarea rows={14} value={s.about_content || ""} onChange={e => setS({ ...s, about_content: e.target.value })} />
        </div>

        <div className="border-t border-border pt-5">
          <h3 className="font-serif text-xl text-espresso mb-2">Home page highlights</h3>
          <p className="text-xs text-muted-foreground mb-4">Up to 4 images shown on the home page below the hero.</p>
          {(s.home_gallery || []).length > 0 && (
            <div className="grid grid-cols-4 gap-3 mb-3">
              {(s.home_gallery || []).map((url: string) => (
                <div key={url} className="relative group aspect-[3/4] bg-secondary/40 overflow-hidden">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeGallery(url)} className="absolute top-1 right-1 bg-espresso/80 text-ivory text-[10px] px-2 py-1 tracking-luxe uppercase opacity-0 group-hover:opacity-100 transition-opacity">Remove</button>
                </div>
              ))}
            </div>
          )}
          {(s.home_gallery || []).length < 4 && (
            <input type="file" accept="image/*" multiple onChange={e => e.target.files && uploadGallery(e.target.files)} />
          )}
        </div>

        <div className="border-t border-border pt-5">
          <h3 className="font-serif text-xl text-espresso mb-2">WhatsApp message templates</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Available placeholders: {TEMPLATE_PLACEHOLDERS.map(p => `{${p}}`).join(", ")}
          </p>
          <TemplatePreview
            label="Order confirmation template"
            value={s.whatsapp_template || DEFAULT_TEMPLATES.order}
            onChange={v => setS({ ...s, whatsapp_template: v })}
            render={(t) => renderTemplate(t, samplePreview)}
            onReset={() => setS({ ...s, whatsapp_template: DEFAULT_TEMPLATES.order })}
          />
          <div className="h-5" />
          <TemplatePreview
            label="Status update template"
            value={s.status_update_template || DEFAULT_TEMPLATES.status}
            onChange={v => setS({ ...s, status_update_template: v })}
            render={(t) => renderStatusMessage(t, samplePreview)}
            onReset={() => setS({ ...s, status_update_template: DEFAULT_TEMPLATES.status })}
          />
        </div>

        <div className="border-t border-border pt-5">
          <h3 className="font-serif text-xl text-espresso mb-4">SEO</h3>
          <Field label="SEO title"><Input value={s.seo_title || ""} onChange={e => setS({ ...s, seo_title: e.target.value })} /></Field>
          <div className="h-3" />
          <Field label="SEO description"><Textarea rows={3} value={s.seo_description || ""} onChange={e => setS({ ...s, seo_description: e.target.value })} /></Field>
          <div className="h-3" />
          <Field label="SEO keywords"><Input value={s.seo_keywords || ""} onChange={e => setS({ ...s, seo_keywords: e.target.value })} /></Field>
        </div>

        <Button variant="luxe" size="lg" onClick={save}>Save settings</Button>
      </div>
    </div>
  );
}

function Field({ label, children }: any) {
  return <div><Label className="text-xs uppercase tracking-luxe mb-2 block">{label}</Label>{children}</div>;
}

const samplePreview = {
  customer_name: "Aarav Sharma",
  order_id: "A1B2C3D4",
  status: "shipped",
  items: "1. Brass Lotus Diya — Qty: 2 × ₹1,499 = ₹2,998\n2. Ivory Linen Throw — Qty: 1 × ₹2,499 = ₹2,499",
  subtotal: "₹5,497",
  total: "₹5,497",
  address: "12 Garden Lane, Jaipur",
  pincode: "302001",
  email: "aarav@example.com",
  phone: "+91 94605 57934",
};

function TemplatePreview({ label, value, onChange, render, onReset }: any) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label className="text-xs uppercase tracking-luxe">{label}</Label>
        <button onClick={onReset} type="button" className="text-[10px] tracking-luxe uppercase text-muted-foreground hover:text-gold">Reset to default</button>
      </div>
      <Textarea rows={8} value={value} onChange={e => onChange(e.target.value)} className="font-mono text-xs" />
      <div className="mt-2 bg-secondary/40 border border-border p-4">
        <p className="text-[10px] tracking-luxe uppercase text-gold mb-2">Preview</p>
        <pre className="text-xs whitespace-pre-wrap font-sans text-espresso">{render(value)}</pre>
      </div>
    </div>
  );
}
