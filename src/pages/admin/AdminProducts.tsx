import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Upload, X, Star, Layers } from "lucide-react";
import { formatINR } from "@/lib/cart";
import AdminBulkProducts from "./AdminBulkProducts";

type Product = any;

const empty = {
  name: "", description: "", price: "0", compare_at_price: "",
  in_stock: true, is_featured: false, is_on_sale: false, is_active: true,
  category_id: "", images: [] as string[], stock_quantity: "",
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [bulk, setBulk] = useState(false);
  const [activeCat, setActiveCat] = useState<string>("all");

  useEffect(() => { load(); }, []);
  async function load() {
    const [{ data: p }, { data: c }] = await Promise.all([
      supabase.from("products").select("*, categories(name)").order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("sort_order"),
    ]);
    setProducts(p || []); setCategories(c || []);
  }

  const remove = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await supabase.from("products").delete().eq("id", id);
    toast.success("Product deleted"); load();
  };

  const groups = (() => {
    const visible = activeCat === "all"
      ? products
      : activeCat === "uncat"
        ? products.filter(p => !p.category_id)
        : products.filter(p => p.category_id === activeCat);

    const map = new Map<string, { name: string; items: Product[] }>();
    for (const p of visible) {
      const key = p.category_id || "uncat";
      const name = p.categories?.name || "Uncategorized";
      if (!map.has(key)) map.set(key, { name, items: [] });
      map.get(key)!.items.push(p);
    }
    // Order groups by category sort_order, uncategorized last
    const ordered: { key: string; name: string; items: Product[] }[] = [];
    for (const c of categories) {
      const g = map.get(c.id);
      if (g) ordered.push({ key: c.id, ...g });
    }
    if (map.has("uncat")) ordered.push({ key: "uncat", ...map.get("uncat")! });
    return ordered;
  })();

  const renderItem = (p: Product) => (
    <div key={p.id} className="bg-background border border-border p-4 flex gap-4 items-center">
      <div className="w-20 h-20 bg-secondary/40 overflow-hidden shrink-0">
        {p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" />}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-serif text-lg text-espresso">{p.name}</h3>
          {p.is_featured && <Star className="w-3.5 h-3.5 text-gold fill-gold" />}
        </div>
        <p className="text-xs text-muted-foreground">{p.categories?.name || "Uncategorized"} · {formatINR(Number(p.price))}</p>
        <div className="flex gap-2 mt-1">
          <Tag>{p.in_stock ? "In stock" : "Sold out"}</Tag>
          {p.is_on_sale && <Tag tone="gold">Sale</Tag>}
          {!p.is_active && <Tag>Hidden</Tag>}
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => setEditing(p)}><Pencil className="w-3.5 h-3.5" /></Button>
        <Button size="sm" variant="outline" onClick={() => remove(p.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader title="Products" description={`${products.length} total`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setBulk(true)}><Layers className="w-4 h-4" /> Bulk add</Button>
            <Button variant="luxe" onClick={() => setEditing({ ...empty })}><Plus className="w-4 h-4" /> New product</Button>
          </div>
        } />

      <div className="flex flex-wrap gap-2 mb-6">
        <CatChip active={activeCat === "all"} onClick={() => setActiveCat("all")}>All ({products.length})</CatChip>
        {categories.map(c => {
          const count = products.filter(p => p.category_id === c.id).length;
          return (
            <CatChip key={c.id} active={activeCat === c.id} onClick={() => setActiveCat(c.id)}>
              {c.name} ({count})
            </CatChip>
          );
        })}
        {products.some(p => !p.category_id) && (
          <CatChip active={activeCat === "uncat"} onClick={() => setActiveCat("uncat")}>
            Uncategorized ({products.filter(p => !p.category_id).length})
          </CatChip>
        )}
      </div>

      {products.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No products yet. Add your first product to get started.</p>
      ) : groups.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No products in this category.</p>
      ) : (
        <div className="space-y-8">
          {groups.map(g => (
            <section key={g.key}>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="font-serif text-2xl text-espresso">{g.name}</h2>
                <span className="text-xs tracking-luxe uppercase text-muted-foreground">{g.items.length} item{g.items.length === 1 ? "" : "s"}</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="grid gap-4">{g.items.map(renderItem)}</div>
            </section>
          ))}
        </div>
      )}

      {editing && <ProductForm product={editing} categories={categories} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
      {bulk && <AdminBulkProducts categories={categories} onClose={() => setBulk(false)} onDone={() => { setBulk(false); load(); }} />}
    </div>
  );
}

function CatChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs tracking-luxe uppercase px-4 py-2 border transition-colors ${
        active ? "bg-espresso text-ivory border-espresso" : "border-border text-espresso hover:border-gold hover:text-gold"
      }`}
    >
      {children}
    </button>
  );
}

function Tag({ children, tone }: { children: React.ReactNode; tone?: "gold" }) {
  return <span className={`text-[10px] tracking-luxe uppercase px-2 py-0.5 ${tone === "gold" ? "bg-gold/10 text-gold-dark" : "bg-secondary text-espresso/70"}`}>{children}</span>;
}

function ProductForm({ product, categories, onClose, onSaved }: any) {
  const [form, setForm] = useState({ ...product, price: String(product.price), compare_at_price: product.compare_at_price ? String(product.compare_at_price) : "", stock_quantity: product.stock_quantity == null ? "" : String(product.stock_quantity), images: product.images || [] });
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = async (files: FileList) => {
    setUploading(true);
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      const ext = file.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file, { contentType: file.type, upsert: false });
      if (error) { toast.error(error.message); continue; }
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      setForm((f: any) => ({ ...f, images: [...f.images, data.publicUrl] }));
    }
    setUploading(false);
  };

  const removeImage = (url: string) => setForm((f: any) => ({ ...f, images: f.images.filter((u: string) => u !== url) }));
  const setMain = (url: string) => setForm((f: any) => ({ ...f, images: [url, ...f.images.filter((u: string) => u !== url)] }));

  const save = async () => {
    if (!form.name) { toast.error("Name required"); return; }
    const payload: any = {
      name: form.name, description: form.description,
      price: parseFloat(form.price) || 0,
      compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
      in_stock: form.in_stock, is_featured: form.is_featured, is_on_sale: form.is_on_sale, is_active: form.is_active,
      category_id: form.category_id || null,
      stock_quantity: form.stock_quantity === "" || form.stock_quantity == null ? null : parseInt(form.stock_quantity),
      images: form.images,
    };
    const { error } = product.id
      ? await supabase.from("products").update(payload).eq("id", product.id)
      : await supabase.from("products").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved"); onSaved();
  };

  return (
    <div className="fixed inset-0 bg-espresso/60 z-50 flex items-center justify-center p-4 overflow-auto" onClick={onClose}>
      <div className="bg-background w-full max-w-3xl my-8 max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-background z-10">
          <h2 className="font-serif text-2xl text-espresso">{product.id ? "Edit product" : "New product"}</h2>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-5">
          <Field label="Name"><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Description"><Textarea rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Price (₹)"><Input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></Field>
            <Field label="Compare at (₹)"><Input type="number" value={form.compare_at_price} onChange={e => setForm({ ...form, compare_at_price: e.target.value })} /></Field>
            <Field label="Stock qty"><Input type="number" value={form.stock_quantity ?? ""} onChange={e => setForm({ ...form, stock_quantity: e.target.value })} placeholder="Unlimited" /></Field>
          </div>

          <Field label="Category">
            <Select value={form.category_id || "none"} onValueChange={v => setForm({ ...form, category_id: v === "none" ? "" : v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No category</SelectItem>
                {categories.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Images">
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files) handleFiles(e.dataTransfer.files); }}
              className={`border-2 border-dashed p-6 text-center transition-colors ${dragOver ? "border-gold bg-gold/5" : "border-border"}`}
            >
              <Upload className="w-6 h-6 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground mt-2">Drag & drop images, or</p>
              <label className="inline-block mt-2 cursor-pointer">
                <input type="file" multiple accept="image/*" className="hidden" onChange={e => e.target.files && handleFiles(e.target.files)} />
                <span className="text-xs tracking-luxe uppercase text-gold hover:underline">browse files</span>
              </label>
              {uploading && <p className="text-xs text-muted-foreground mt-2">Uploading…</p>}
            </div>
            {form.images.length > 0 && (
              <div className="grid grid-cols-4 gap-3 mt-3">
                {form.images.map((url: string, i: number) => (
                  <div key={url} className="relative group aspect-square bg-secondary/40 overflow-hidden">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    {i === 0 && <span className="absolute top-1 left-1 bg-gold text-white text-[9px] px-1.5 py-0.5 tracking-luxe uppercase">Main</span>}
                    <div className="absolute inset-0 bg-espresso/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity">
                      {i !== 0 && <button type="button" onClick={() => setMain(url)} className="text-ivory text-[10px] uppercase tracking-luxe">Set main</button>}
                      <button type="button" onClick={() => removeImage(url)} className="text-ivory"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Toggle label="In stock" checked={form.in_stock} onChange={v => setForm({ ...form, in_stock: v })} />
            <Toggle label="Active" checked={form.is_active} onChange={v => setForm({ ...form, is_active: v })} />
            <Toggle label="Featured" checked={form.is_featured} onChange={v => setForm({ ...form, is_featured: v })} />
            <Toggle label="On sale" checked={form.is_on_sale} onChange={v => setForm({ ...form, is_on_sale: v })} />
          </div>
        </div>
        <div className="border-t border-border p-6 flex justify-end gap-3 bg-secondary/30">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="luxe" onClick={save}>Save product</Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: any) {
  return <div><Label className="text-xs tracking-luxe uppercase text-espresso/70 mb-2 block">{label}</Label>{children}</div>;
}
function Toggle({ label, checked, onChange }: any) {
  return (
    <label className="flex items-center justify-between bg-secondary/40 p-3">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}
