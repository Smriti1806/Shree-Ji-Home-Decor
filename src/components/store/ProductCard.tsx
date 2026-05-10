import { Link } from "react-router-dom";
import { formatINR, useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";

export type ProductCardData = {
  id: string;
  name: string;
  price: number;
  compare_at_price?: number | null;
  images: string[];
  is_on_sale?: boolean;
  in_stock?: boolean;
  stock_quantity?: number | null;
};

export default function ProductCard({ p }: { p: ProductCardData }) {
  const { add } = useCart();
  const img = p.images?.[0] || "/placeholder.svg";
  const soldOut = p.in_stock === false || (p.stock_quantity != null && p.stock_quantity <= 0);

  return (
    <div className="group hover-lift">
      <Link to={`/product/${p.id}`} className="block relative overflow-hidden bg-secondary/40 aspect-[4/5]">
        <img
          src={img}
          alt={p.name}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${soldOut ? "opacity-70" : ""}`}
        />
        {soldOut ? (
          <span className="absolute top-3 left-3 bg-espresso text-ivory text-[10px] tracking-luxe uppercase px-3 py-1">Sold out</span>
        ) : p.is_on_sale && (
          <span className="absolute top-3 left-3 bg-espresso text-ivory text-[10px] tracking-luxe uppercase px-3 py-1">Sale</span>
        )}
      </Link>
      <div className="pt-5 text-center">
        <h3 className="font-serif text-lg text-espresso">
          <Link to={`/product/${p.id}`} className="hover:text-gold transition-colors">{p.name}</Link>
        </h3>
        <div className="mt-1 text-sm text-muted-foreground flex items-center justify-center gap-2">
          {p.compare_at_price && p.compare_at_price > p.price && (
            <span className="line-through text-xs">{formatINR(p.compare_at_price)}</span>
          )}
          <span className="text-gold-dark font-medium">{formatINR(p.price)}</span>
        </div>
        <Button
          variant="outlineGold"
          size="sm"
          disabled={soldOut}
          className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => add({ id: p.id, name: p.name, price: p.price, image: img, in_stock: p.in_stock, stock_quantity: p.stock_quantity })}
        >
          {soldOut ? "Sold out" : "Add to cart"}
        </Button>
      </div>
    </div>
  );
}
