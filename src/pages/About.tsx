import { useEffect, useState } from "react";
import { Instagram, ChevronDown } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import hero from "@/assets/hero.jpg";

const FAQS = [
  { q: "What products does Shree JI Home Decor specialize in?", a: "Shree JI Home Decor offers a wide range of home furnishing and textile products including bedsheets, towels, comforters, cushions, sofa covers, doormats, runners, yoga mats, mattresses, kitchen essentials, Jaipuri razai, gifting sets, and many more." },
  { q: "Where is Shree JI Home Decor located?", a: "Our store is located in Khatipura, Jaipur, Inside Jain Medical." },
  { q: "What are the business operating hours?", a: "We are open from Monday to Saturday, 10:30 AM to 8:30 PM." },
  { q: "What payment methods are accepted?", a: "We accept Cash and Online Payments for customer convenience." },
  { q: "Do you provide wholesale or bulk orders?", a: "Yes, we provide wholesale and bulk orders for retailers, traders, and resellers across India." },
  { q: "Do you offer Pan India delivery?", a: "Yes, Shree JI Home Decor offers Pan India delivery services." },
  { q: "Why should customers choose Shree JI Home Decor?", a: "Customers choose us for affordable wholesale pricing, quality products, reliable service, and a wide variety of home décor essentials." },
  { q: "Can customers visit the store directly?", a: "Yes, customers are welcome to visit our store during working hours to explore products and discuss their requirements." },
  { q: "Do you support reseller partnerships?", a: "Yes, we welcome resellers and business partners who want to grow with our quality textile and home décor products." },
  { q: "How do you maintain product quality?", a: "We carefully select and provide quality products that meet customer expectations for comfort, durability, and design." },
  { q: "Are your products suitable for gifting purposes?", a: "Yes, we offer various gifting sets, embroidered items, and home décor products suitable for festivals, weddings, and special occasions." },
  { q: "Do you sell seasonal products?", a: "Yes, we also deal in seasonal products like umbrellas, raincoats, AC blankets, and festive Garba dresses." },
  { q: "Can I place orders online?", a: "Yes, customers can contact us online for product inquiries, bulk orders, and delivery services." },
  { q: "Do you offer products for kids?", a: "Yes, we provide kids' bedsheets, comforters, and other comfortable home textile products for children." },
  { q: "What makes Shree JI Home Decor different?", a: "Our focus on customer satisfaction, affordable pricing, quality products, and trusted service makes us a preferred choice for home décor and textile shopping." },
];

const askSchema = z.object({
  customer_name: z.string().trim().min(2, "Enter your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255).optional().or(z.literal("")),
  question: z.string().trim().min(8, "Question is too short").max(800),
});

export default function About() {
  const [content, setContent] = useState<string>("");
  const [instagram, setInstagram] = useState<string>("https://www.instagram.com/shreeji_home_decors");
  const [publicQs, setPublicQs] = useState<any[]>([]);
  const [form, setForm] = useState({ customer_name: "", email: "", question: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.from("site_settings").select("about_content, instagram_url").maybeSingle().then(({ data }) => {
      if (data?.about_content) setContent(data.about_content);
      if (data?.instagram_url) setInstagram(data.instagram_url);
    });
    supabase.from("customer_questions" as any)
      .select("id, customer_name, question, answer, answered_at")
      .eq("is_public", true)
      .not("answer", "is", null)
      .order("answered_at", { ascending: false })
      .limit(20)
      .then(({ data }) => setPublicQs((data as any) || []));
  }, []);

  const submitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = askSchema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setSubmitting(true);
    const { error } = await supabase.from("customer_questions" as any).insert({
      customer_name: parsed.data.customer_name,
      email: parsed.data.email || null,
      question: parsed.data.question,
    });
    setSubmitting(false);
    if (error) { toast.error("Could not send question"); return; }
    toast.success("Thanks! We'll get back to you soon.");
    setForm({ customer_name: "", email: "", question: "" });
  };

  const paragraphs = content.split(/\n\n+/).filter(Boolean);
  const heading = paragraphs[0]?.startsWith("About") ? paragraphs.shift() : "About Shree JI Home Decor";

  return (
    <div>
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <img src={hero} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-espresso/50" />
        <div className="relative container h-full flex flex-col justify-end pb-16">
          <p className="text-xs tracking-luxe uppercase text-gold-light mb-3">Our story</p>
          <h1 className="font-serif text-5xl md:text-6xl text-ivory max-w-3xl">{heading}</h1>
        </div>
      </section>

      <section className="container max-w-3xl py-20">
        <div className="space-y-6 text-espresso/85 leading-relaxed">
          {paragraphs.map((p, i) => (
            <p key={i} className={i === 0 ? "font-serif text-xl md:text-2xl text-espresso" : "text-base"}>
              {p}
            </p>
          ))}
        </div>

        <div className="h-px w-16 bg-gold mx-auto my-12" />

        <div className="text-center">
          <p className="text-xs tracking-luxe uppercase text-gold mb-3">Follow us</p>
          <a href={instagram} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-espresso hover:text-gold transition-colors">
            <Instagram className="w-5 h-5" />
            <span className="text-sm">@shreeji_home_decors</span>
          </a>
        </div>
      </section>

      {/* Why Shree Ji Home Decor / FAQ */}
      <section className="bg-secondary/30 border-y border-border/60">
        <div className="container max-w-3xl py-20">
          <div className="text-center mb-12">
            <p className="text-xs tracking-luxe uppercase text-gold mb-3">FAQ</p>
            <h2 className="font-serif text-4xl text-espresso">Why Shree Ji Home Decor</h2>
            <p className="text-muted-foreground mt-3 text-sm">Everything you need to know — answered.</p>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-border/60">
                <AccordionTrigger className="text-left font-serif text-espresso text-base hover:text-gold hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-espresso/75 leading-relaxed">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Ask a question */}
      <section className="container max-w-3xl py-20">
        <div className="text-center mb-10">
          <p className="text-xs tracking-luxe uppercase text-gold mb-3">Have a question?</p>
          <h2 className="font-serif text-4xl text-espresso">Ask us anything</h2>
          <p className="text-muted-foreground mt-3 text-sm">We'll respond as soon as possible.</p>
        </div>

        <form onSubmit={submitQuestion} className="space-y-5 max-w-xl mx-auto">
          <div>
            <Label className="text-xs tracking-luxe uppercase text-espresso/70 mb-2 block">Your name</Label>
            <Input value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })} required />
          </div>
          <div>
            <Label className="text-xs tracking-luxe uppercase text-espresso/70 mb-2 block">Email (optional)</Label>
            <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs tracking-luxe uppercase text-espresso/70 mb-2 block">Your question</Label>
            <Textarea rows={4} value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} required />
          </div>
          <Button type="submit" variant="gold" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Sending…" : "Send question"}
          </Button>
        </form>

        {publicQs.length > 0 && (
          <div className="mt-16">
            <h3 className="font-serif text-2xl text-espresso text-center mb-8">Answered customer questions</h3>
            <Accordion type="single" collapsible className="w-full">
              {publicQs.map((q) => (
                <AccordionItem key={q.id} value={q.id} className="border-border/60">
                  <AccordionTrigger className="text-left font-serif text-espresso text-base hover:text-gold hover:no-underline">
                    {q.question}
                    <span className="ml-3 text-[10px] tracking-luxe uppercase text-muted-foreground hidden sm:inline">— {q.customer_name}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-espresso/75 leading-relaxed whitespace-pre-wrap">{q.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}
      </section>
    </div>
  );
}
