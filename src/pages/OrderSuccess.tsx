import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function OrderSuccess() {
  return (
    <div className="container py-32 text-center max-w-xl">
      <CheckCircle2 className="w-16 h-16 text-gold mx-auto" strokeWidth={1} />
      <h1 className="font-serif text-5xl text-espresso mt-8">Thank you</h1>
      <p className="text-muted-foreground mt-4 leading-relaxed">
        Your order has been sent via WhatsApp. Our team will confirm shipping details and total shortly.
      </p>
      <Button asChild variant="luxe" size="lg" className="mt-10"><Link to="/shop">Continue shopping</Link></Button>
    </div>
  );
}
