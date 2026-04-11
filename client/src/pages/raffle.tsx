import { siteConfig } from "@/lib/siteConfig";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Trophy, Ticket, Calendar, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import logoImage from "@assets/logo.png";

export default function Raffle() {
  const [pageLoaded, setPageLoaded] = useState(false);
  const prizesRef = useScrollReveal();
  const pricingRef = useScrollReveal();
  const detailsRef = useScrollReveal();

  // Checkout form state
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null);
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    setPageLoaded(true);
    // Show success message if redirected back from Stripe
    const params = new URLSearchParams(window.location.search);
    if (params.get("purchase") === "success") {
      window.history.replaceState({}, "", "/raffle");
    }
  }, []);

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTierId || !buyerEmail) return;

    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const res = await fetch("/api/raffle/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tierId: selectedTierId,
          email: buyerEmail,
          name: buyerName,
          drawDate: siteConfig.raffle.drawDate,
          legal: siteConfig.raffle.legal,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setCheckoutError(data.error || "Something went wrong. Please try again.");
        setCheckoutLoading(false);
      }
    } catch {
      setCheckoutError("Connection error. Please try again.");
      setCheckoutLoading(false);
    }
  }

  if (!siteConfig.raffle.active) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-2xl p-12 text-center">
          <Trophy className="w-24 h-24 mx-auto mb-6 text-primary" />
          <h1 className="font-heading text-4xl font-bold mb-4" data-testid="text-raffle-coming-soon">
            Something Big Is Coming
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            We're launching a raffle to fund scholarships and wraparound support for our first student cohort. Every ticket directly funds a real person's shot at a new career.
          </p>
          <p className="text-lg mb-8">
            Sign up on our homepage to be the first to know when tickets go on sale — and get an exclusive early-access offer.
          </p>
          <Link href="/">
            <Button size="lg" className="no-default-hover-elevate no-default-active-elevate btn-minimal-hover" data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Homepage
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const selectedTier = siteConfig.raffle.ticketTiers.find((t) => t.id === selectedTierId);

  return (
    <div className={`min-h-screen bg-background ${pageLoaded ? 'animate-hero-fade' : ''}`}>
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-accent text-white py-16">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-3 mb-6">
            <img src={logoImage} alt="Rising Promise Logo" className="h-14" />
            <span className="font-heading text-2xl font-bold">{siteConfig.organization.name}</span>
          </div>
          <Link href="/">
            <Button variant="ghost" className="text-white mb-4 no-default-hover-elevate no-default-active-elevate btn-minimal-hover" data-testid="link-back-home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Homepage
            </Button>
          </Link>
          <h1 className="font-heading text-5xl md:text-6xl font-bold mb-4" data-testid="text-raffle-headline">
            {siteConfig.raffle.headline}
          </h1>
          <p className="text-xl md:text-2xl opacity-95 max-w-3xl" data-testid="text-raffle-subheadline">
            {siteConfig.raffle.subheadline}
          </p>
        </div>
      </header>

      {/* Prizes Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <h2 ref={prizesRef.ref as any} className="font-heading text-4xl font-bold text-center mb-12 scroll-reveal" data-testid="text-prizes-headline">
            What You Could Win
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto card-stagger scroll-reveal">
            {siteConfig.raffle.prizes.map((prize, i) => (
              <Card key={prize.tier} className="p-8 text-center relative" data-testid={`card-prize-${i}`}>
                {prize.tier === 1 && (
                  <Badge className="absolute top-4 right-4 bg-accent">Top Prize</Badge>
                )}
                <Trophy className={`w-16 h-16 mx-auto mb-4 ${prize.tier === 1 ? 'text-accent' : 'text-primary'}`} />
                <div className="font-heading text-2xl font-bold mb-2" data-testid={`text-prize-place-${i}`}>
                  {prize.label}
                </div>
                <div className="text-4xl font-bold text-primary mb-2" data-testid={`text-prize-value-${i}`}>
                  {prize.value}
                </div>
                <div className="text-muted-foreground" data-testid={`text-prize-desc-${i}`}>
                  {prize.description}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Ticket Tiers Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 ref={pricingRef.ref as any} className="font-heading text-4xl font-bold text-center mb-12 scroll-reveal" data-testid="text-pricing-headline">
            Choose Your Impact
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto card-stagger scroll-reveal">
            {siteConfig.raffle.ticketTiers.map((tier, i) => (
              <Card
                key={tier.id}
                className={`p-8 text-center relative hover-elevate transition-all ${selectedTierId === tier.id ? 'ring-2 ring-primary' : ''}`}
                data-testid={`card-pricing-${i}`}
              >
                {tier.badge && (
                  <Badge className="absolute top-4 right-4 bg-primary">{tier.badge}</Badge>
                )}
                <Ticket className="w-12 h-12 mx-auto mb-4 text-primary" />
                <div className="text-3xl font-bold mb-1" data-testid={`text-price-${i}`}>
                  ${tier.price}
                </div>
                <div className="font-heading text-xl font-bold mb-2" data-testid={`text-entries-${i}`}>
                  {tier.entries} {tier.entries === 1 ? "Entry" : "Entries"}
                </div>
                <div className="text-sm text-muted-foreground mb-6" data-testid={`text-price-desc-${i}`}>
                  {tier.description}
                </div>
                <Button
                  className="w-full no-default-hover-elevate no-default-active-elevate btn-minimal-hover"
                  onClick={() => setSelectedTierId(selectedTierId === tier.id ? null : tier.id)}
                  variant={selectedTierId === tier.id ? "outline" : "default"}
                  data-testid={`button-buy-${i}`}
                >
                  {selectedTierId === tier.id ? "Cancel" : "Buy Tickets"}
                </Button>
              </Card>
            ))}
          </div>

          {/* Inline checkout form — shown when a tier is selected */}
          {selectedTierId && selectedTier && (
            <div className="max-w-md mx-auto mt-12">
              <Card className="p-8">
                <h3 className="font-heading text-xl font-bold mb-1">Complete Your Purchase</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {selectedTier.label} — ${selectedTier.price} for {selectedTier.entries} {selectedTier.entries === 1 ? "entry" : "entries"}
                </p>
                <form onSubmit={handleCheckout} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="buyer-name">
                      Name <span className="text-muted-foreground font-normal">(optional)</span>
                    </label>
                    <input
                      id="buyer-name"
                      type="text"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      placeholder="Your name"
                      className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="buyer-email">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="buyer-email"
                      type="email"
                      required
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Your entry confirmation will be sent here.</p>
                  </div>
                  {checkoutError && (
                    <p className="text-sm text-red-600">{checkoutError}</p>
                  )}
                  <Button
                    type="submit"
                    className="w-full no-default-hover-elevate no-default-active-elevate btn-minimal-hover"
                    disabled={checkoutLoading || !buyerEmail}
                    data-testid="button-checkout-submit"
                  >
                    {checkoutLoading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Redirecting to checkout…</>
                    ) : (
                      `Pay $${selectedTier.price} — Secure Checkout`
                    )}
                  </Button>
                </form>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Powered by Stripe. Your payment is secure.
                </p>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* Draw Date & Sponsor */}
      <section className="py-16 bg-muted/30">
        <div ref={detailsRef.ref as any} className="container mx-auto px-6 max-w-4xl scroll-reveal">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 card-stagger">
            <Card className="p-6">
              <Calendar className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-heading text-xl font-bold mb-2">Draw Date</h3>
              <p className="text-2xl font-bold text-primary" data-testid="text-draw-date">
                {siteConfig.raffle.drawDate}
              </p>
              {siteConfig.raffle.drawDateNote && (
                <p className="text-sm text-muted-foreground mt-2" data-testid="text-draw-date-note">
                  {siteConfig.raffle.drawDateNote}
                </p>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="font-heading text-xl font-bold mb-2">Presenting Sponsor</h3>
              {siteConfig.raffle.sponsor.logoUrl && (
                <img
                  src={siteConfig.raffle.sponsor.logoUrl}
                  alt={siteConfig.raffle.sponsor.name}
                  className="h-12 mb-3"
                />
              )}
              <p className="text-2xl font-bold text-primary" data-testid="text-sponsor-name">
                {siteConfig.raffle.sponsor.name}
              </p>
              {siteConfig.raffle.sponsor.tagline && (
                <p className="text-sm text-muted-foreground mt-1" data-testid="text-sponsor-tagline">
                  {siteConfig.raffle.sponsor.tagline}
                </p>
              )}
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-accent text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-heading text-4xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Buy a ticket. Fund a future. Win big.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="bg-white text-primary no-default-hover-elevate no-default-active-elevate btn-minimal-hover"
            onClick={() => {
              document.getElementById("ticket-tiers-section")?.scrollIntoView({ behavior: "smooth" });
            }}
            data-testid="button-buy-cta"
          >
            Get Your Tickets
          </Button>
          {siteConfig.raffle.legal && (
            <p className="text-sm opacity-70 mt-6 max-w-xl mx-auto" data-testid="text-legal">
              {siteConfig.raffle.legal}
              {siteConfig.raffle.rulesUrl && (
                <> <a href={siteConfig.raffle.rulesUrl} className="underline ml-1" target="_blank" rel="noopener noreferrer">Full rules.</a></>
              )}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
