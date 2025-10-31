import { siteConfig } from "@/lib/siteConfig";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Trophy, Ticket, Calendar, Info, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import logoImage from "@assets/logo.png";

export default function Raffle() {
  const [pageLoaded, setPageLoaded] = useState(false);
  const prizesRef = useScrollReveal();
  const pricingRef = useScrollReveal();
  const detailsRef = useScrollReveal();
  const faqRef = useScrollReveal();

  useEffect(() => {
    setPageLoaded(true);
  }, []);

  if (!siteConfig.features.raffleActive) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-2xl p-12 text-center">
          <Trophy className="w-24 h-24 mx-auto mb-6 text-primary" />
          <h1 className="font-heading text-4xl font-bold mb-4" data-testid="text-raffle-coming-soon">
            Raffle Coming Soon!
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            We're getting ready to launch an exciting raffle that will fund scholarships and training programs. 
            Every ticket helps build futures.
          </p>
          <p className="text-lg mb-8">
            Sign up for our newsletter on the homepage to be the first to know when tickets go on sale.
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
            What You Can Win
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto card-stagger scroll-reveal">
            {siteConfig.raffle.prizes.map((prize, i) => (
              <Card key={i} className="p-8 text-center relative" data-testid={`card-prize-${i}`}>
                {prize.badge && (
                  <Badge className="absolute top-4 right-4 bg-accent">Top Prize</Badge>
                )}
                <Trophy className={`w-16 h-16 mx-auto mb-4 ${i === 0 ? 'text-accent' : 'text-primary'}`} />
                <div className="font-heading text-2xl font-bold mb-2" data-testid={`text-prize-place-${i}`}>
                  {prize.place}
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

      {/* Ticket Pricing Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 ref={pricingRef.ref as any} className="font-heading text-4xl font-bold text-center mb-12 scroll-reveal" data-testid="text-pricing-headline">
            Choose Your Entries
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto card-stagger scroll-reveal">
            {siteConfig.raffle.ticketPricing.map((option, i) => (
              <Card key={i} className="p-8 text-center relative hover-elevate" data-testid={`card-pricing-${i}`}>
                {option.badge && (
                  <Badge className="absolute top-4 right-4 bg-primary">Best Value</Badge>
                )}
                <Ticket className="w-12 h-12 mx-auto mb-4 text-primary" />
                <div className="text-3xl font-bold mb-2" data-testid={`text-price-${i}`}>
                  {option.price}
                </div>
                <div className="font-heading text-xl font-bold mb-2" data-testid={`text-entries-${i}`}>
                  {option.entries}
                </div>
                <div className="text-sm text-muted-foreground mb-6" data-testid={`text-price-desc-${i}`}>
                  {option.description}
                </div>
                <Button className="w-full no-default-hover-elevate no-default-active-elevate btn-minimal-hover" disabled data-testid={`button-buy-${i}`}>
                  Buy Tickets
                  <span className="ml-2 text-xs">(Coming Soon)</span>
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Details Section */}
      <section className="py-16 bg-muted/30">
        <div ref={detailsRef.ref as any} className="container mx-auto px-6 max-w-4xl scroll-reveal">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 card-stagger">
            <Card className="p-6">
              <Calendar className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-heading text-xl font-bold mb-2">Draw Date</h3>
              <p className="text-2xl font-bold text-primary" data-testid="text-draw-date">
                {siteConfig.raffle.details.drawDate}
              </p>
            </Card>

            <Card className="p-6">
              <Ticket className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-heading text-xl font-bold mb-2">Total Tickets</h3>
              <p className="text-2xl font-bold text-primary" data-testid="text-total-tickets">
                {siteConfig.raffle.details.totalTickets}
              </p>
            </Card>
          </div>

          <Card className="p-8 mb-12">
            <div className="flex items-start gap-4">
              <Info className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-heading text-xl font-bold mb-3">Where Your Money Goes</h3>
                <p className="text-lg mb-4" data-testid="text-where-money-goes">
                  {siteConfig.raffle.details.whereMoneyGoes}
                </p>
                <h4 className="font-semibold mb-2">Official Rules:</h4>
                <ul className="space-y-2">
                  {siteConfig.raffle.details.rules.map((rule, i) => (
                    <li key={i} className="flex items-start gap-2" data-testid={`text-rule-${i}`}>
                      <span className="text-primary mt-1">•</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          {/* FAQ Section */}
          <div ref={faqRef.ref as any} className="scroll-reveal">
            <h2 className="font-heading text-3xl font-bold mb-6 text-center" data-testid="text-faq-headline">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="space-y-4">
              {siteConfig.raffle.faq.map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border rounded-lg px-6">
                  <AccordionTrigger className="font-semibold" data-testid={`accordion-question-${i}`}>
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground" data-testid={`accordion-answer-${i}`}>
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-accent text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-heading text-4xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Buy your raffle tickets today. Win big. Change lives.
          </p>
          <Button size="lg" variant="secondary" className="bg-white text-primary no-default-hover-elevate no-default-active-elevate btn-minimal-hover" disabled data-testid="button-buy-cta">
            Get Your Tickets (Coming Soon)
          </Button>
        </div>
      </section>
    </div>
  );
}
