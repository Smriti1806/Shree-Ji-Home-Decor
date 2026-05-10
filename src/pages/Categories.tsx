import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import catLighting from "@/assets/cat-lighting.jpg";
import catVases from "@/assets/cat-vases.jpg";
import catTextiles from "@/assets/cat-textiles.jpg";
import catMirrors from "@/assets/cat-mirrors.jpg";

const FALLBACK = [
  { id: "l", name: "Lighting", image_url: catLighting },
  { id: "v", name: "Vases", image_url: catVases },
  { id: "t", name: "Textiles", image_url: catTextiles },
  { id: "m", name: "Mirrors", image_url: catMirrors },
];

export default function Categories() {
  const [cats, setCats] = useState<{ id: string; name: string; image_url: string | null }[]>([]);

  useEffect(() => {
    supabase.from("categories").select("id, name, image_url").order("sort_order").then(({ data }) => {
      setCats(data && data.length ? data : FALLBACK);
    });
  }, []);

  return (
    <div className="container py-16">
      <header className="text-center mb-16">
        <p className="text-xs tracking-luxe uppercase text-gold mb-3">Browse</p>
        <h1 className="font-serif text-5xl text-espresso">Categories</h1>
      </header>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cats.map(c => (
          <Link key={c.id} to="/shop" className="group block hover-lift">
            <div className="aspect-[4/5] overflow-hidden bg-secondary/40">
              <img src={c.image_url || "/placeholder.svg"} alt={c.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <h3 className="font-serif text-2xl mt-5 text-espresso text-center group-hover:text-gold transition-colors">{c.name}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
}
