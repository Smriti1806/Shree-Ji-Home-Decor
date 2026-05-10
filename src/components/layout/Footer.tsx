import { Link } from "react-router-dom";
import { Instagram, Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border/60 bg-secondary/30 mt-32">
      <div className="container py-16 grid md:grid-cols-4 gap-12">
        <div>
          <h3 className="font-serif text-2xl text-espresso">Shree Ji</h3>
          <p className="text-[10px] tracking-luxe uppercase text-gold mt-1">Home Decor</p>
          <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
            Timeless luxury for the modern home. Curated decor crafted with intention.
          </p>
        </div>
        <div>
          <h4 className="text-xs tracking-luxe uppercase text-espresso mb-4">Shop</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/shop" className="hover:text-gold">All products</Link></li>
            <li><Link to="/categories" className="hover:text-gold">Categories</Link></li>
            <li><Link to="/shop?sale=1" className="hover:text-gold">Sale</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs tracking-luxe uppercase text-espresso mb-4">Help</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-gold">About us</Link></li>
            <li><Link to="/contact" className="hover:text-gold">Contact</Link></li>
            <li><span className="text-gold">No return policy</span></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs tracking-luxe uppercase text-espresso mb-4">Connect</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> +91 94605 57934</li>
            <li className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> <a href="mailto:hdecor433@gmail.com" className="hover:text-gold transition-colors">hdecor433@gmail.com</a></li>
            <li className="flex items-center gap-2"><Instagram className="w-3.5 h-3.5" /> <a href="https://www.instagram.com/shreeji_home_decors" target="_blank" rel="noreferrer" className="hover:text-gold transition-colors">@shreeji_home_decors</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="container py-6 text-xs text-muted-foreground flex flex-col md:flex-row justify-between gap-2">
          <p>© {new Date().getFullYear()} Shree Ji Home Decor. All rights reserved.</p>
          <Link to="/admin" className="hover:text-gold tracking-wider uppercase">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
