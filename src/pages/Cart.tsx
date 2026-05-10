import { Link } from "react-router-dom";
import { Trash2, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatINR, useCart } from "@/lib/cart";

export default function Cart() {
  const { items, remove, setQty, total } = useCart();
  const blocked = items.some(i => i.in_stock === false || (i.stock_quantity != null && i.quantity > i.stock_quantity));

  if (items.length === 0) {
    return (
      <div className="container py-32 text-center">
        <h1 className="font-serif text-5xl text-espresso">Your cart is empty</h1>
        <p className="text-muted-foreground mt-4">Begin your story with a piece that speaks to you.</p>
        <Button asChild variant="luxe" size="lg" className="mt-8"><Link to="/shop">Shop the collection</Link></Button>
      </div>
    );
  }

  return (
    <div className="container py-16 max-w-5xl">
      <header className="text-center mb-12">
        <p className="text-xs tracking-luxe uppercase text-gold mb-3">Cart</p>
        <h1 className="font-serif text-5xl text-espresso">Your selection</h1>
      </header>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {items.map(i => (
            <div key={i.id} className="flex gap-5 pb-6 border-b border-border">
              <div className="w-24 h-28 bg-secondary/40 overflow-hidden shrink-0">
                {i.image && <img src={i.image} alt={i.name} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 flex flex-col">
                <h3 className="font-serif text-xl text-espresso">{i.name}</h3>
                <p className="text-sm text-gold-dark mt-1">{formatINR(i.price)}</p>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center border border-border">
                    <button onClick={() => setQty(i.id, i.quantity - 1)} className="px-3 py-1.5 hover:text-gold"><Minus className="w-3 h-3" /></button>
                    <span className="px-3 text-sm">{i.quantity}</span>
                    <button onClick={() => setQty(i.id, i.quantity + 1)} className="px-3 py-1.5 hover:text-gold"><Plus className="w-3 h-3" /></button>
                  </div>
                  <button onClick={() => remove(i.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-espresso">{formatINR(i.price * i.quantity)}</p>
              </div>
            </div>
          ))}
        </div>

        <aside className="bg-secondary/40 p-8 h-fit">
          <h2 className="font-serif text-2xl text-espresso mb-6">Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatINR(total)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="text-xs italic text-muted-foreground">Calculated by location</span></div>
          </div>
          <div className="h-px bg-border my-5" />
          <div className="flex justify-between font-medium text-lg">
            <span>Total</span><span className="text-gold-dark">{formatINR(total)}</span>
          </div>
          {blocked ? (
            <>
              <Button variant="gold" size="lg" className="w-full mt-6" disabled>Checkout unavailable</Button>
              <p className="text-[10px] tracking-luxe uppercase text-destructive mt-3 text-center">One or more items exceed available stock</p>
            </>
          ) : (
            <Button asChild variant="gold" size="lg" className="w-full mt-6"><Link to="/checkout">Checkout</Link></Button>
          )}
          <p className="text-[10px] tracking-luxe uppercase text-muted-foreground mt-4 text-center">Order placed via WhatsApp</p>
        </aside>
      </div>
    </div>
  );
}
