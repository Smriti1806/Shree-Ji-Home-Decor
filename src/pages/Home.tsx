import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Truck, ShieldCheck, Sparkles, Star, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import ProductCard, { ProductCardData } from "@/components/store/ProductCard";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import hero from "@/assets/hero.jpg";
import catLighting from "@/assets/cat-lighting.jpg";
import catVases from "@/assets/cat-vases.jpg";
import catTextiles from "@/assets/cat-textiles.jpg";
import catMirrors from "@/assets/cat-mirrors.jpg";

const FALLBACK_CATEGORIES = [
  { id: "l", name: "Lighting", image_url: catLighting },
  { id: "v", name: "Vases", image_url: catVases },
  { id: "t", name: "Textiles", image_url: catTextiles },
  { id: "m", name: "Mirrors", image_url: catMirrors },
];

export default function Home() {
  const [featured, setFeatured] = useState<ProductCardData[]>([]);
  const [newArrivals, setNewArrivals] = useState<ProductCardData[]>([]);
  const [sale, setSale] = useState<ProductCardData[]>([]);
  const [reviews, setReviews] = useState<{ id: string; customer_name: string; rating: number; comment: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; image_url: string | null }[]>([]);
  const [gallery, setGallery] = useState<string[]>([]);
  const [carousel, setCarousel] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const [{ data: f }, { data: n }, { data: s }, { data: r }, { data: c }, { data: st }] = await Promise.all([
        supabase.from("products").select("*").eq("is_active", true).eq("is_featured", true).limit(4),
        supabase.from("products").select("*").eq("is_active", true).order("created_at", { ascending: false }).limit(4),
        supabase.from("products").select("*").eq("is_active", true).eq("is_on_sale", true).limit(4),
        supabase.from("reviews").select("id, customer_name, rating, comment").eq("approved", true).order("created_at", { ascending: false }).limit(3),
        supabase.from("categories").select("id, name, image_url").order("sort_order"),
        supabase.from("site_settings").select("home_gallery, home_carousel").maybeSingle(),
      ]);
      setFeatured((f || []) as any);
      setNewArrivals((n || []) as any);
      setSale((s || []) as any);
      setReviews(r || []);
      setCategories(c && c.length ? c : FALLBACK_CATEGORIES.map(x => ({ ...x, image_url: x.image_url })));
      setGallery((st as any)?.home_gallery || []);
      setCarousel((st as any)?.home_carousel || []);
    })();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[92vh] min-h-[640px] flex items-center overflow-hidden">
        <img src={hero} alt="Luxury home decor scene with pampas grass on marble side table" className="absolute inset-0 w-full h-full object-cover scale-105" />
        <div className="absolute inset-0 bg-gradient-to-r from-ivory/95 via-ivory/75 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(var(--gold)/0.12),transparent_60%)]" />
        <div className="container relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 border border-gold/40 bg-ivory/70 backdrop-blur-sm text-[10px] tracking-luxe uppercase text-gold mb-8 animate-fade-in">
            <span className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse" /> New Collection
          </span>
          <h1 className="font-serif text-[2.75rem] sm:text-6xl md:text-7xl lg:text-[5.25rem] text-espresso leading-[0.98] tracking-[-0.02em] animate-fade-up">
            Where every <em className="text-gold not-italic relative">corner<span className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" /></em>
            <br />
            <span className="text-espresso/90">tells a story.</span>
          </h1>
          <p className="mt-8 text-base md:text-lg text-espresso/65 max-w-md leading-[1.75] tracking-wide animate-fade-up" style={{ animationDelay: "0.15s" }}>
            Hand-curated home decor for those who believe a beautiful home is the most personal form of luxury.
          </p>

          {/* Trust highlight */}
          <div className="mt-8 animate-fade-up" style={{ animationDelay: "0.22s" }}>
            <div className="relative inline-block">
              <div className="absolute -inset-1 gradient-gold opacity-20 blur-lg rounded" />
              <div className="relative bg-ivory/80 backdrop-blur-sm border-l-4 border-gold px-5 py-3 shadow-soft">
                <p className="font-serif text-xl md:text-2xl font-bold text-espresso leading-snug">
                  Trusted by <span className="text-gold">5000+</span> Customers & Resellers Nationwide
                </p>
                <p className="text-[11px] md:text-xs tracking-wide text-espresso/70 italic mt-1">
                  Serving better quality products at reasonable prices — delivered to your doorstep.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap gap-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <Button asChild variant="luxe" size="lg">
              <Link to="/shop"><span className="relative z-10 inline-flex items-center gap-2">Shop the collection <ArrowRight className="w-3.5 h-3.5" /></span></Link>
            </Button>
            <Button asChild variant="outlineGold" size="lg">
              <Link to="/categories"><span className="relative z-10">Explore categories</span></Link>
            </Button>
          </div>
        </div>

        {/* decorative scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-gold/70 animate-fade-in" style={{ animationDelay: "0.6s" }}>
          <span className="text-[10px] tracking-luxe uppercase">Scroll</span>
          <span className="w-px h-10 bg-gradient-to-b from-gold/70 to-transparent" />
        </div>
      </section>

      {/* Premium Reviews Slider */}
      {reviews.length > 0 && (
        <section className="relative py-24 bg-gradient-to-b from-ivory via-secondary/30 to-ivory overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,_hsl(var(--gold)/0.08),transparent_70%)] pointer-events-none" />
          <div className="container relative">
            <div className="text-center mb-14">
              <p className="text-xs tracking-luxe uppercase text-gold mb-3">Loved across India</p>
              <h2 className="font-serif text-4xl md:text-5xl text-espresso gold-line">What our customers say</h2>
            </div>
            <Carousel opts={{ loop: true, align: "start" }} className="w-full max-w-5xl mx-auto">
              <CarouselContent>
                {reviews.map((r) => (
                  <CarouselItem key={r.id} className="md:basis-1/2 lg:basis-1/3">
                    <div className="group relative h-full bg-card border border-border/60 p-8 shadow-soft hover:shadow-luxe transition-all duration-500 hover:-translate-y-1 hover:border-gold/50">
                      <Quote className="absolute -top-3 left-6 w-8 h-8 text-gold bg-ivory p-1.5" strokeWidth={1.5} />
                      <div className="flex gap-1 mb-4 mt-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < r.rating ? "fill-gold text-gold" : "text-border"}`} />
                        ))}
                      </div>
                      <p className="text-espresso/80 leading-relaxed text-[15px] italic mb-6 line-clamp-5">
                        "{r.comment}"
                      </p>
                      <div className="flex items-center gap-3 pt-4 border-t border-border/60">
                        <div className="w-10 h-10 rounded-full gradient-gold text-white flex items-center justify-center font-serif text-lg shadow-gold">
                          {r.customer_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-serif text-lg text-espresso leading-tight">{r.customer_name}</p>
                          <p className="text-[10px] tracking-luxe uppercase text-gold mt-0.5">Verified Buyer</p>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex -left-4 lg:-left-12 border-gold text-gold hover:bg-gold hover:text-white" />
              <CarouselNext className="hidden md:flex -right-4 lg:-right-12 border-gold text-gold hover:bg-gold hover:text-white" />
            </Carousel>
          </div>
        </section>
      )}

      {/* Product Carousel (admin-managed) */}
      {carousel.length > 0 && (
        <section className="container py-16">
          <div className="text-center mb-10">
            <p className="text-xs tracking-luxe uppercase text-gold mb-3">Now showing</p>
            <h2 className="font-serif text-4xl md:text-5xl text-espresso">Featured products</h2>
          </div>
          <Carousel opts={{ loop: true, align: "start" }} className="w-full">
            <CarouselContent>
              {carousel.map((url, i) => (
                <CarouselItem key={i} className="md:basis-1/2 lg:basis-1/3">
                  <div className="aspect-[4/5] overflow-hidden bg-secondary/40">
                    <img src={url} alt={`Featured ${i + 1}`} loading="lazy" className="w-full h-full object-cover" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </section>
      )}

      {/* Marquee bar */}
      <section className="border-y border-border/60 bg-secondary/40">
        <div className="container py-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="flex items-center justify-center gap-3 text-xs tracking-luxe uppercase text-espresso/70">
            <Truck className="w-4 h-4 text-gold" /> Pan-India delivery
          </div>
          <div className="flex items-center justify-center gap-3 text-xs tracking-luxe uppercase text-espresso/70">
            <Sparkles className="w-4 h-4 text-gold" /> Hand-curated pieces
          </div>
          <div className="flex items-center justify-center gap-3 text-xs tracking-luxe uppercase text-espresso/70">
            <ShieldCheck className="w-4 h-4 text-gold" /> Order via WhatsApp
          </div>
        </div>
      </section>

      {/* Highlights gallery (admin-managed) */}
      {gallery.length > 0 && (
        <section className="container py-20">
          <div className="text-center mb-12">
            <p className="text-xs tracking-luxe uppercase text-gold mb-3">Highlights</p>
            <h2 className="font-serif text-4xl md:text-5xl text-espresso">From our latest pieces</h2>
          </div>
          <div className={`grid gap-4 ${gallery.length === 3 ? "grid-cols-1 md:grid-cols-3" : "grid-cols-2 md:grid-cols-4"}`}>
            {gallery.slice(0, 4).map((url, i) => (
              <div key={i} className="aspect-[3/4] overflow-hidden bg-secondary/40 hover-lift">
                <img src={url} alt={`Highlight ${i + 1}`} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="container py-24">
        <div className="text-center mb-16">
          <p className="text-xs tracking-luxe uppercase text-gold mb-3">Featured</p>
          <h2 className="font-serif text-4xl md:text-5xl text-espresso gold-line">Shop by category</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.slice(0, 4).map((c) => (
            <Link key={c.id} to="/shop" className="group block hover-lift">
              <div className="aspect-[3/4] overflow-hidden bg-secondary/40">
                <img src={c.image_url || "/placeholder.svg"} alt={c.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <h3 className="font-serif text-2xl mt-5 text-espresso group-hover:text-gold transition-colors">{c.name}</h3>
              <span className="inline-flex items-center gap-2 text-xs tracking-luxe uppercase text-gold mt-1">
                Explore <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <ProductsSection title="Featured pieces" eyebrow="Editor's edit" products={featured} />
      )}

      {/* Sale */}
      {sale.length > 0 && (
        <section className="bg-espresso text-ivory py-24">
          <div className="container">
            <div className="text-center mb-16">
              <p className="text-xs tracking-luxe uppercase text-gold mb-3">Limited time</p>
              <h2 className="font-serif text-4xl md:text-5xl">On sale</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {sale.map(p => <ProductCard key={p.id} p={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* New arrivals */}
      {newArrivals.length > 0 && (
        <ProductsSection title="New arrivals" eyebrow="Just landed" products={newArrivals} />
      )}

      {/* CTA */}
      <section className="container py-24 text-center">
        <h2 className="font-serif text-4xl md:text-5xl text-espresso max-w-2xl mx-auto leading-tight">
          A home is the truest reflection of who you are.
        </h2>
        <Button asChild variant="gold" size="xl" className="mt-10"><Link to="/shop">Begin your story</Link></Button>
      </section>
    </div>
  );
}

function ProductsSection({ title, eyebrow, products }: { title: string; eyebrow: string; products: ProductCardData[] }) {
  return (
    <section className="container py-24">
      <div className="text-center mb-16">
        <p className="text-xs tracking-luxe uppercase text-gold mb-3">{eyebrow}</p>
        <h2 className="font-serif text-4xl md:text-5xl text-espresso">{title}</h2>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map(p => <ProductCard key={p.id} p={p} />)}
      </div>
    </section>
  );
}
