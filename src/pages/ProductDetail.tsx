import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { formatINR, useCart } from "@/lib/cart";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const { add } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [imgIdx, setImgIdx] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase.from("products").select("*").eq("id", id).maybeSingle().then(({ data }) => {
      setProduct(data);
      setImgIdx(0);
    });
  }, [id]);

  if (!product) return <div className="container py-24 text-center text-muted-foreground">Loading…</div>;

  const images: string[] = product.images?.length ? product.images : ["/placeholder.svg"];

  const stockQty: number | null = product.stock_quantity ?? null;
  const soldOut = !product.in_stock || (stockQty != null && stockQty <= 0);
  const maxQty = stockQty ?? 99;

  const handleAdd = () => {
    const ok = add({
      id: product.id, name: product.name, price: Number(product.price), image: images[0],
      in_stock: product.in_stock, stock_quantity: stockQty,
    }, qty);
    if (!ok) return;
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="container py-12 lg:py-20">
      <Link to="/shop" className="text-xs tracking-luxe uppercase text-muted-foreground hover:text-gold">← Back to shop</Link>

      <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 mt-8">
        {/* Gallery */}
        <div>
          <div className="relative aspect-square bg-secondary/40 overflow-hidden group">
            <img
              src={images[imgIdx]}
              alt={product.name}
              className={`w-full h-full object-cover transition-transform duration-500 ${zoom ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"}`}
              onClick={() => setZoom(!zoom)}
            />
            <button className="absolute top-4 right-4 bg-background/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn className="w-4 h-4" />
            </button>
            {images.length > 1 && (
              <>
                <button onClick={() => setImgIdx((imgIdx - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/80 p-2 rounded-full hover:bg-background"><ChevronLeft className="w-4 h-4" /></button>
                <button onClick={() => setImgIdx((imgIdx + 1) % images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/80 p-2 rounded-full hover:bg-background"><ChevronRight className="w-4 h-4" /></button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-3 mt-4">
              {images.map((src, i) => (
                <button key={i} onClick={() => setImgIdx(i)} className={`aspect-square overflow-hidden border-2 ${imgIdx === i ? "border-gold" : "border-transparent"}`}>
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-xs tracking-luxe uppercase text-gold">{product.is_on_sale ? "On sale" : "Curated"}</p>
          <h1 className="font-serif text-4xl md:text-5xl text-espresso mt-3 leading-tight">{product.name}</h1>
          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-2xl font-medium text-espresso">{formatINR(Number(product.price))}</span>
            {product.compare_at_price && Number(product.compare_at_price) > Number(product.price) && (
              <span className="text-sm text-muted-foreground line-through">{formatINR(Number(product.compare_at_price))}</span>
            )}
          </div>

          <div className="h-px bg-border my-8" />

          <p className="text-sm text-espresso/75 leading-relaxed whitespace-pre-line">
            {product.description || "A timeless piece, thoughtfully crafted to elevate every space."}
          </p>

          {stockQty != null && stockQty > 0 && stockQty <= 5 && (
            <p className="mt-4 text-xs tracking-luxe uppercase text-gold-dark">Only {stockQty} left in stock</p>
          )}

          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center border border-border">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-3 hover:text-gold" disabled={soldOut}>−</button>
              <span className="px-4 text-sm">{qty}</span>
              <button onClick={() => setQty(Math.min(maxQty, qty + 1))} className="px-4 py-3 hover:text-gold" disabled={soldOut || qty >= maxQty}>+</button>
            </div>
            <Button variant="luxe" size="lg" onClick={handleAdd} disabled={soldOut}>
              {soldOut ? "Sold out" : added ? "Added ✓" : "Add to cart"}
            </Button>
          </div>

          <div className="mt-10 border border-gold/40 bg-gold/5 p-5">
            <p className="text-xs tracking-luxe uppercase text-gold mb-1">No return policy</p>
            <p className="text-sm text-espresso/75">All sales are final. Each piece is hand-inspected before dispatch to ensure quality.</p>
          </div>

          <p className="text-xs text-muted-foreground mt-6">Shipping charges will be calculated based on your location at checkout.</p>
        </div>
      </div>
    </div>
  );
}
