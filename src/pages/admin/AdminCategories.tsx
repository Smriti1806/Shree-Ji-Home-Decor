import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X } from "lucide-react";



export default function AdminCategories() {
  const [cats, setCats] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);

  useEffect(() => { load(); }, []);
  const load = async () => {
    const { data } = await supabase.from("categories").select("*").order("sort_order");
    setCats(data || []);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete category?")) return;
    await supabase.from("categories").delete().eq("id", id);
    toast.success("Deleted"); load();
  };

  return (
    <div>
      <PageHeader title="Categories" action={<Button variant="luxe" onClick={() => setEditing({ name: "", image_url: "", sort_order: cats.length })}><Plus className="w-4 h-4" /> New category</Button>} />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cats.map(c => (
          <div key={c.id} className="bg-background border border-border p-4 flex gap-3 items-center">
            <div className="w-16 h-16 bg-secondary/40 overflow-hidden">
              {c.image_url && <img src={c.image_url} alt="" className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1">
              <h3 className="font-serif text-lg text-espresso">{c.name}</h3>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" onClick={() => setEditing(c)}><Pencil className="w-3.5 h-3.5" /></Button>
              <Button size="sm" variant="outline" onClick={() => remove(c.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
            </div>
          </div>
        ))}
      </div>

      {editing && <CategoryForm cat={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
    </div>
  );
}

function CategoryForm({ cat, onClose, onSaved }: any) {
  const [form, setForm] = useState({ ...cat });
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `categories/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, { contentType: file.type });
    if (error) { toast.error(error.message); setUploading(false); return; }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    setForm({ ...form, image_url: data.publicUrl });
    setUploading(false);
  };

  const save = async () => {
    if (!form.name) { toast.error("Name required"); return; }
    const payload = {
      name: form.name,
      image_url: form.image_url || null,
      sort_order: form.sort_order || 0,
    };
    const { error } = cat.id
      ? await supabase.from("categories").update(payload).eq("id", cat.id)
      : await supabase.from("categories").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved"); onSaved();
  };

  return (
    <div className="fixed inset-0 bg-espresso/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-serif text-xl">{cat.id ? "Edit category" : "New category"}</h2>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div><Label className="text-xs uppercase tracking-luxe mb-2 block">Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label className="text-xs uppercase tracking-luxe mb-2 block">Sort order</Label><Input type="number" value={form.sort_order || 0} onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} /></div>
          <div>
            <Label className="text-xs uppercase tracking-luxe mb-2 block">Image</Label>
            {form.image_url && <img src={form.image_url} alt="" className="w-32 h-32 object-cover mb-2" />}
            <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && upload(e.target.files[0])} />
            {uploading && <p className="text-xs text-muted-foreground mt-1">Uploading…</p>}
          </div>
        </div>
        <div className="border-t p-5 flex justify-end gap-3 bg-secondary/30">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="luxe" onClick={save}>Save</Button>
        </div>
      </div>
    </div>
  );
}
