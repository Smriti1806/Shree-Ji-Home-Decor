import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  stock_quantity?: number | null;
  in_stock?: boolean;
};

type CartCtx = {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">, qty?: number) => boolean;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  total: number;
  count: number;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "shreeji-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
  });

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(items)); }, [items]);

  const add: CartCtx["add"] = (item, qty = 1) => {
    if (item.in_stock === false) { toast.error("This item is sold out."); return false; }
    const existing = items.find(p => p.id === item.id);
    const nextQty = (existing?.quantity || 0) + qty;
    if (item.stock_quantity != null && nextQty > item.stock_quantity) {
      toast.error(`Only ${item.stock_quantity} in stock.`);
      return false;
    }
    setItems(prev => {
      const ex = prev.find(p => p.id === item.id);
      if (ex) return prev.map(p => p.id === item.id ? { ...p, quantity: p.quantity + qty } : p);
      return [...prev, { ...item, quantity: qty }];
    });
    supabase.from("cart_events").insert({
      product_id: item.id,
      product_name: item.name,
      session_id: getSession(),
      event_type: "add",
    }).then(() => {});
    return true;
  };

  const remove = (id: string) => setItems(prev => prev.filter(p => p.id !== id));
  const setQty = (id: string, qty: number) =>
    setItems(prev => prev.map(p => {
      if (p.id !== id) return p;
      const max = p.stock_quantity ?? Infinity;
      const clamped = Math.min(Math.max(1, qty), max);
      if (qty > max) toast.error(`Only ${max} in stock.`);
      return { ...p, quantity: clamped };
    }));
  const clear = () => setItems([]);
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return <Ctx.Provider value={{ items, add, remove, setQty, clear, total, count }}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}

function getSession() {
  let s = localStorage.getItem("shreeji-session");
  if (!s) { s = crypto.randomUUID(); localStorage.setItem("shreeji-session", s); }
  return s;
}

export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
