import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Trash2, Plus, X } from "lucide-react";
import { toast } from "sonner";



type Row = {
  name: string;
  description: string;
  price: string;
  compare_at_price: string;
  category_id: string;
  stock_quantity: string;
  is_featured: boolean;
  is_on_sale: boolean;
  images: string[];
};

const empty = (): Row => ({
  name: "", description: "", price: "", compare_at_price: "", category_id: "",
  stock_quantity: "", is_featured: false, is_on_sale: false, images: [],
});

export default function AdminBulkProducts({ categories, onClose, onDone }: any) {
  const [rows, setRows] = useState<Row[]>([empty()]);
  const [busy, setBusy] = useState(false);

  const update = (i: number, patch: Partial<Row>) =>
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, ...patch } : r));

  const handleFiles = async (i: number, files: FileList) => {
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      const ext = file.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file, { contentType: file.type });
      if (error) { toast.error(error.message); continue; }
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    update(i, { images: [...rows[i].images, ...urls] });
  };

  const submit = async () => {
    const valid = rows.filter(r => r.name.trim() && r.price);
    if (valid.length === 0) { toast.error("Add at least one product with name and price."); return; }
    setBusy(true);
    const payload = valid.map(r => ({
      name: r.name.trim(),
      description: r.description || null,
      price: parseFloat(r.price) || 0,
      compare_at_price: r.compare_at_price ? parseFloat(r.compare_at_price) : null,
      category_id: r.category_id || null,
      stock_quantity: r.stock_quantity ? parseInt(r.stock_quantity) : null,
      in_stock: r.stock_quantity ? parseInt(r.stock_quantity) > 0 : true,
      is_featured: r.is_featured,
      is_on_sale: r.is_on_sale,
      is_active: true,
      images: r.images,
    }));
    const { error } = await supabase.from("products").insert(payload);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`${valid.length} product${valid.length > 1 ? "s" : ""} created`);
    onDone();
  };

  return (
    <div className="fixed inset-0 bg-espresso/60 z-50 flex items-start justify-center p-4 overflow-auto" onClick={onClose}>
      <div className="bg-background w-full max-w-5xl my-8" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-background z-10">
          <div>
            <h2 className="font-serif text-2xl text-espresso">Bulk add products</h2>
            <p className="text-xs text-muted-foreground mt-1">Add multiple items at once. Each card = one product.</p>
          </div>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-5">
          {rows.map((r, i) => (
            <div key={i} className="border border-border p-5 bg-secondary/20">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs tracking-luxe uppercase text-gold">Product {i + 1}</p>
                {rows.length > 1 && (
                  <button onClick={() => setRows(rows.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                )}
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <Field label="Name *"><Input value={r.name} onChange={e => update(i, { name: e.target.value })} /></Field>
                <Field label="Category">
                  <Select value={r.category_id || "none"} onValueChange={v => update(i, { category_id: v === "none" ? "" : v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No category</SelectItem>
                      {categories.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Price (₹) *"><Input type="number" value={r.price} onChange={e => update(i, { price: e.target.value })} /></Field>
                <Field label="Compare at (₹)"><Input type="number" value={r.compare_at_price} onChange={e => update(i, { compare_at_price: e.target.value })} /></Field>
                <Field label="Stock quantity"><Input type="number" value={r.stock_quantity} onChange={e => update(i, { stock_quantity: e.target.value })} placeholder="Leave blank = unlimited" /></Field>
                <div className="flex items-end gap-4">
                  <label className="text-xs tracking-luxe uppercase flex items-center gap-2"><input type="checkbox" checked={r.is_featured} onChange={e => update(i, { is_featured: e.target.checked })} />Featured</label>
                  <label className="text-xs tracking-luxe uppercase flex items-center gap-2"><input type="checkbox" checked={r.is_on_sale} onChange={e => update(i, { is_on_sale: e.target.checked })} />On sale</label>
                </div>
              </div>
              <div className="mt-3">
                <Field label="Description"><Textarea rows={2} value={r.description} onChange={e => update(i, { description: e.target.value })} /></Field>
              </div>
              <div className="mt-3">
                <Label className="text-xs uppercase tracking-luxe mb-2 block">Images</Label>
                <div
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); if (e.dataTransfer.files) handleFiles(i, e.dataTransfer.files); }}
                  className="border-2 border-dashed border-border p-4 text-center"
                >
                  <Upload className="w-5 h-5 mx-auto text-muted-foreground" />
                  <label className="inline-block mt-2 cursor-pointer">
                    <input type="file" multiple accept="image/*" className="hidden" onChange={e => e.target.files && handleFiles(i, e.target.files)} />
                    <span className="text-xs tracking-luxe uppercase text-gold hover:underline">Drag & drop or browse</span>
                  </label>
                </div>
                {r.images.length > 0 && (
                  <div className="grid grid-cols-6 gap-2 mt-3">
                    {r.images.map(url => (
                      <div key={url} className="relative aspect-square bg-secondary/40 group">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button onClick={() => update(i, { images: r.images.filter(u => u !== url) })} className="absolute top-1 right-1 bg-espresso/80 text-ivory p-0.5 opacity-0 group-hover:opacity-100"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          <Button variant="outline" onClick={() => setRows([...rows, empty()])} className="w-full">
            <Plus className="w-4 h-4" /> Add another product
          </Button>
        </div>

        <div className="border-t border-border p-6 flex justify-end gap-3 bg-secondary/30 sticky bottom-0">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="luxe" onClick={submit} disabled={busy}>
            {busy ? "Creating…" : `Create ${rows.length} product${rows.length > 1 ? "s" : ""}`}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: any) {
  return <div><Label className="text-xs uppercase tracking-luxe mb-2 block">{label}</Label>{children}</div>;
}
