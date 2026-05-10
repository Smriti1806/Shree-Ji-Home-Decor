import { ReactNode } from "react";
import { Navigate, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Package, FolderTree, ShoppingCart, MessageSquare,
  Star, BarChart3, Settings, LogOut, ShoppingBasket, KeyRound, HelpCircle
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/incomplete", label: "Incomplete carts", icon: ShoppingBasket },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/complaints", label: "Complaints", icon: MessageSquare },
  { to: "/admin/questions", label: "Customer Q&A", icon: HelpCircle },
  { to: "/admin/analytics", label: "Cart analytics", icon: BarChart3 },
  { to: "/admin/settings", label: "Settings", icon: Settings },
  { to: "/admin/change-password", label: "Change password", icon: KeyRound },
];

export default function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const loc = useLocation();

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  if (!user || !isAdmin) return <Navigate to="/admin/login" state={{ from: loc }} replace />;

  return (
    <div className="min-h-screen flex bg-secondary/30">
      <aside className="w-64 bg-background border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <p className="text-xs tracking-luxe uppercase text-gold">Shree Ji</p>
          <h1 className="font-serif text-2xl text-espresso">Admin</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  isActive ? "bg-gold/10 text-gold border-l-2 border-gold" : "text-espresso/70 hover:bg-secondary/60 hover:text-espresso"
                }`
              }>
              <n.icon className="w-4 h-4" /> {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground truncate mb-2">{user.email}</p>
          <Button variant="outline" size="sm" className="w-full" onClick={signOut}>
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto"><Outlet /></div>
      </main>
    </div>
  );
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between mb-8">
      <div>
        <h1 className="font-serif text-4xl text-espresso">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      {action}
    </div>
  );
}
