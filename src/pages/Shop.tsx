import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import ProductCard, { ProductCardData } from "@/components/store/ProductCard";

export default function Shop() {
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setProducts((data as any[]) || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container py-16">
      <header className="text-center mb-12">
        <p className="text-xs tracking-luxe uppercase text-gold mb-3">The collection</p>
        <h1 className="font-serif text-5xl text-espresso">Shop</h1>
      </header>

      {loading ? (
        <p className="text-center text-muted-foreground">Loading…</p>
      ) : products.length === 0 ? (
        <div className="text-center py-24">
          <p className="font-serif text-2xl text-espresso">No products yet</p>
          <p className="text-muted-foreground mt-2 text-sm">Please check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map(p => <ProductCard key={p.id} p={p} />)}
        </div>
      )}
    </div>
  );
}
