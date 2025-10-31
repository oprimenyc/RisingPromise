import { siteConfig } from "@/lib/siteConfig";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { StatCounter } from "@/components/StatCounter";
import { GraduationCap, Users, Heart, Facebook, Instagram, Linkedin, Twitter, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const iconMap: Record<string, any> = {
  "Graduation Cap": GraduationCap,
  "Users": Users,
  "Heart": Heart,
};

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [joinUsName, setJoinUsName] = useState("");
  const [joinUsEmail, setJoinUsEmail] = useState("");
  const [footerEmail, setFooterEmail] = useState("");
  const { toast } = useToast();

  // Scroll reveal hooks for sections
  const storyReveal = useScrollReveal();
  const whoWeSeeReveal = useScrollReveal();
  const whatWeDoReveal = useScrollReveal();
  const impactReveal = useScrollReveal();
  const teamReveal = useScrollReveal();
  const joinUsReveal = useScrollReveal();

  const newsletterMutation = useMutation({
    mutationFn: async (data: { email: string; name?: string; source: string }) =>
      apiRequest("POST", "/api/newsletter/signup", data),
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "You've been subscribed to our newsletter.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleJoinUsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    newsletterMutation.mutate({
      email: joinUsEmail,
      name: joinUsName || undefined,
      source: "homepage",
    });
    setJoinUsName("");
    setJoinUsEmail("");
  };

  const handleFooterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    newsletterMutation.mutate({
      email: footerEmail,
      source: "footer",
    });
    setFooterEmail("");
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        const offset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        setMobileMenuOpen(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-secondary/95 shadow-md h-16' : 'bg-transparent h-20'}`}>
        <div className="container mx-auto px-6 flex items-center justify-between">
          <a href="/" className="font-heading text-2xl font-bold text-white" data-testid="link-home">
            {siteConfig.organization.name}
          </a>
          <nav className="hidden md:flex gap-8" data-testid="nav-desktop">
            {siteConfig.navigation.menuItems.map((item, i) => (
              <a
                key={i}
                href={item.href}
                onClick={(e) => {
                  if (item.href.startsWith('#')) {
                    e.preventDefault();
                    scrollToSection(item.href);
                  }
                }}
                className="text-white font-semibold text-sm uppercase tracking-wide hover:text-primary transition-colors"
                data-testid={`link-nav-${item.text.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {item.text}
              </a>
            ))}
          </nav>
          <button 
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(true)}
            data-testid="button-mobile-menu"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-secondary" data-testid="nav-mobile">
          <div className="flex flex-col items-center justify-center h-full gap-8">
            <button 
              className="absolute top-6 right-6 text-white"
              onClick={() => setMobileMenuOpen(false)}
              data-testid="button-close-mobile-menu"
              aria-label="Close menu"
            >
              <X className="w-8 h-8" />
            </button>
            {siteConfig.navigation.menuItems.map((item, i) => (
              <a
                key={i}
                href={item.href}
                onClick={(e) => {
                  if (item.href.startsWith('#')) {
                    e.preventDefault();
                    scrollToSection(item.href);
                  }
                }}
                className="text-white font-semibold text-2xl uppercase tracking-wide hover:text-primary transition-colors"
                data-testid={`link-nav-mobile-${item.text.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {item.text}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center animate-hero-fade"
        style={{
          backgroundImage: `url('${siteConfig.hero.backgroundImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
        data-testid="section-hero"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/85 to-secondary/60" />
        <div className="relative z-10 text-center max-w-4xl px-6">
          <h1 className="font-heading text-5xl md:text-7xl font-bold text-white mb-6 leading-tight" data-testid="text-hero-headline">
            {siteConfig.hero.headline}
          </h1>
          <p className="text-xl md:text-2xl text-white/95 mb-8 max-w-3xl mx-auto leading-relaxed" data-testid="text-hero-subheadline">
            {siteConfig.hero.subheadline}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button 
              onClick={() => scrollToSection(siteConfig.hero.primaryButtonHref)} 
              size="lg" 
              className="text-lg px-8 py-6 btn-minimal-hover"
              data-testid="button-hero-primary"
            >
              {siteConfig.hero.primaryButtonText}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => scrollToSection(siteConfig.hero.secondaryButtonHref)} 
              size="lg" 
              className="text-lg px-8 py-6 bg-white/10 backdrop-blur-sm border-white text-white btn-minimal-hover"
              data-testid="button-hero-secondary"
            >
              {siteConfig.hero.secondaryButtonText}
            </Button>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section id="story" className="py-20 md:py-32" data-testid="section-story">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 
            ref={storyReveal.ref as any}
            className={`font-heading text-4xl md:text-5xl font-bold text-center mb-12 scroll-reveal ${storyReveal.isVisible ? 'is-visible' : ''}`} 
            data-testid="text-story-headline"
          >
            {siteConfig.story.headline}
          </h2>
          <div className="space-y-6">
            {siteConfig.story.paragraphs.map((p, i) => (
              <p key={i} className="text-xl md:text-2xl text-muted-foreground leading-relaxed" data-testid={`text-story-p${i+1}`}>
                {p}
              </p>
            ))}
          </div>
          <p className="font-heading text-3xl md:text-4xl font-bold text-center mt-12" data-testid="text-story-closing">
            {siteConfig.story.closing}
          </p>
        </div>
      </section>

      {/* Who We See Section */}
      <section id="who-we-see" className="py-20 md:py-32 bg-muted/30" data-testid="section-who-we-see">
        <div className="container mx-auto px-6 max-w-5xl">
          <h2 
            ref={whoWeSeeReveal.ref as any}
            className={`font-heading text-4xl md:text-5xl font-bold text-center mb-12 scroll-reveal ${whoWeSeeReveal.isVisible ? 'is-visible' : ''}`}
            data-testid="text-who-headline"
          >
            {siteConfig.whoWeSee.headline}
          </h2>
          <div className="space-y-8">
            {siteConfig.whoWeSee.paragraphs.map((p, i) => (
              <p key={i} className="text-xl md:text-2xl pl-8 border-l-4 border-primary leading-relaxed" data-testid={`text-who-p${i+1}`}>
                {p}
              </p>
            ))}
          </div>
          <div className="mt-12 p-8 bg-primary/10 rounded-xl">
            <p className="text-xl md:text-2xl font-semibold text-center leading-relaxed" data-testid="text-who-closing">
              {siteConfig.whoWeSee.closing}
            </p>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section id="what-we-do" className="py-20 md:py-32" data-testid="section-what-we-do">
        <div className="container mx-auto px-6">
          <h2 
            ref={whatWeDoReveal.ref as any}
            className={`font-heading text-4xl md:text-5xl font-bold text-center mb-12 scroll-reveal ${whatWeDoReveal.isVisible ? 'is-visible' : ''}`}
            data-testid="text-what-headline"
          >
            {siteConfig.whatWeDo.headline}
          </h2>
          
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-6xl mx-auto card-stagger ${whatWeDoReveal.isVisible ? 'is-visible' : ''}`}>
            {siteConfig.whatWeDo.features.map((feature, i) => {
              const Icon = iconMap[feature.icon] || GraduationCap;
              return (
                <Card key={i} className="p-8 text-center scroll-reveal hover-elevate active-elevate-2" data-testid={`card-feature-${i}`}>
                  <Icon className="w-16 h-16 mx-auto mb-6 text-primary" />
                  <h3 className="font-heading text-2xl font-bold mb-4" data-testid={`text-feature-title-${i}`}>
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed" data-testid={`text-feature-desc-${i}`}>
                    {feature.description}
                  </p>
                </Card>
              );
            })}
          </div>
          
          <div className="max-w-4xl mx-auto p-8 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl mb-8">
            <p className="font-heading text-2xl md:text-3xl font-bold text-center" data-testid="text-promise">
              {siteConfig.whatWeDo.promise}
            </p>
          </div>
          
          <div className="text-center">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 btn-minimal-hover" 
              disabled={siteConfig.whatWeDo.buttonComingSoon}
              data-testid="button-explore-programs"
            >
              {siteConfig.whatWeDo.buttonText}
              {siteConfig.whatWeDo.buttonComingSoon && (
                <span className="ml-2 px-2 py-1 bg-accent text-accent-foreground text-xs rounded">Coming Soon</span>
              )}
            </Button>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="py-20 md:py-32 bg-secondary text-white" data-testid="section-impact">
        <div className="container mx-auto px-6">
          <h2 
            ref={impactReveal.ref as any}
            className={`font-heading text-4xl md:text-5xl font-bold text-center mb-8 scroll-reveal ${impactReveal.isVisible ? 'is-visible' : ''}`}
            data-testid="text-impact-headline"
          >
            {siteConfig.impact.headline}
          </h2>
          <p className="text-xl md:text-2xl text-center max-w-4xl mx-auto mb-16 text-white/90" data-testid="text-impact-intro">
            {siteConfig.impact.introText}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            {siteConfig.impact.stats.map((stat, i) => (
              <div key={i} className="text-center" data-testid={`card-stat-${i}`}>
                <StatCounter
                  value={stat.number}
                  isVisible={impactReveal.isVisible}
                  className="font-heading text-6xl md:text-7xl font-bold text-primary mb-4 block"
                  testId={`text-stat-number-${i}`}
                />
                <div className="text-xl font-semibold mb-2" data-testid={`text-stat-label-${i}`}>
                  {stat.label}
                </div>
                {stat.sublabel && (
                  <div className="text-sm text-white/70" data-testid={`text-stat-sublabel-${i}`}>
                    {stat.sublabel}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <p className="text-xl font-semibold text-center" data-testid="text-impact-closing">
            {siteConfig.impact.closing}
          </p>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-20 md:py-32" data-testid="section-team">
        <div className="container mx-auto px-6">
          <h2 
            ref={teamReveal.ref as any}
            className={`font-heading text-4xl md:text-5xl font-bold text-center mb-8 scroll-reveal ${teamReveal.isVisible ? 'is-visible' : ''}`}
            data-testid="text-team-headline"
          >
            {siteConfig.team.headline}
          </h2>
          <p className="text-xl text-center max-w-3xl mx-auto mb-16 text-muted-foreground" data-testid="text-team-intro">
            {siteConfig.team.introText}
          </p>
          
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 card-stagger ${teamReveal.isVisible ? 'is-visible' : ''}`}>
            {siteConfig.team.members.map((member, i) => (
              <div key={i} className="text-center scroll-reveal" data-testid={`card-team-${i}`}>
                <img 
                  src={member.photo} 
                  alt={member.name} 
                  className="w-48 h-48 rounded-full mx-auto mb-6 object-cover border-4 border-primary"
                  data-testid={`img-team-${i}`}
                />
                <h3 className="font-heading text-xl font-bold mb-2" data-testid={`text-team-name-${i}`}>
                  {member.name}
                </h3>
                <p className="text-sm text-primary font-semibold uppercase tracking-wide mb-4" data-testid={`text-team-title-${i}`}>
                  {member.title}
                </p>
                <p className="text-sm italic text-muted-foreground leading-relaxed" data-testid={`text-team-quote-${i}`}>
                  "{member.quote}"
                </p>
              </div>
            ))}
          </div>
          
          <p className="font-heading text-3xl font-bold text-center" data-testid="text-team-closing">
            {siteConfig.team.closing}
          </p>
        </div>
      </section>

      {/* Join Us Section */}
      <section id="join-us" className="py-20 md:py-32 bg-muted/30" data-testid="section-join-us">
        <div className="container mx-auto px-6">
          <h2 
            ref={joinUsReveal.ref as any}
            className={`font-heading text-4xl md:text-5xl font-bold text-center mb-16 scroll-reveal ${joinUsReveal.isVisible ? 'is-visible' : ''}`}
            data-testid="text-join-headline"
          >
            {siteConfig.joinUs.headline}
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Need Us Column */}
            <Card className="p-8">
              <h3 className="font-heading text-2xl font-bold mb-4" data-testid="text-need-headline">
                {siteConfig.joinUs.needUs.headline}
              </h3>
              <p className="text-lg mb-6 text-muted-foreground" data-testid="text-need-description">
                {siteConfig.joinUs.needUs.text}
              </p>
              <form className="space-y-4" onSubmit={handleJoinUsSubmit} data-testid="form-need-updates">
                <Input 
                  placeholder={siteConfig.joinUs.needUs.formPlaceholderName} 
                  value={joinUsName}
                  onChange={(e) => setJoinUsName(e.target.value)}
                  data-testid="input-need-name" 
                />
                <Input 
                  type="email" 
                  placeholder={siteConfig.joinUs.needUs.formPlaceholderEmail}
                  value={joinUsEmail}
                  onChange={(e) => setJoinUsEmail(e.target.value)}
                  required
                  data-testid="input-need-email" 
                />
                <Button 
                  type="submit" 
                  className="w-full btn-minimal-hover" 
                  disabled={newsletterMutation.isPending}
                  data-testid="button-need-submit"
                >
                  {newsletterMutation.isPending ? "Subscribing..." : siteConfig.joinUs.needUs.buttonText}
                </Button>
                <p className="text-sm text-center text-muted-foreground" data-testid="text-need-note">
                  {siteConfig.joinUs.needUs.note}
                </p>
              </form>
            </Card>

            {/* Believe In Us Column */}
            <Card className="p-8">
              <h3 className="font-heading text-2xl font-bold mb-4" data-testid="text-believe-headline">
                {siteConfig.joinUs.believeInUs.headline}
              </h3>
              <p className="text-lg mb-6 text-muted-foreground" data-testid="text-believe-description">
                {siteConfig.joinUs.believeInUs.text}
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {siteConfig.joinUs.believeInUs.actions.map((action, i) => (
                  <Button 
                    key={i} 
                    variant="outline" 
                    className="flex items-center justify-center gap-2 h-auto py-4 btn-minimal-hover"
                    disabled={action.comingSoon}
                    data-testid={`button-action-${i}`}
                  >
                    <span>{action.text}</span>
                    {action.comingSoon && (
                      <span className="px-2 py-1 bg-accent text-accent-foreground text-xs rounded">Soon</span>
                    )}
                  </Button>
                ))}
              </div>
              <p className="text-sm font-semibold italic text-muted-foreground" data-testid="text-join-closing">
                {siteConfig.joinUs.believeInUs.closing}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="footer" className="bg-secondary text-white py-16" data-testid="section-footer">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-heading font-bold mb-4" data-testid="text-footer-org">
                {siteConfig.organization.name}
              </h4>
              <p className="text-sm opacity-90 mb-4" data-testid="text-footer-tagline">
                {siteConfig.organization.tagline}
              </p>
              <div className="flex gap-4">
                <a href={siteConfig.social.facebook} className="hover:text-primary transition-colors" data-testid="link-social-facebook">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href={siteConfig.social.instagram} className="hover:text-primary transition-colors" data-testid="link-social-instagram">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href={siteConfig.social.linkedin} className="hover:text-primary transition-colors" data-testid="link-social-linkedin">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href={siteConfig.social.twitter} className="hover:text-primary transition-colors" data-testid="link-social-twitter">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-heading font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                {siteConfig.navigation.menuItems.map((item, i) => (
                  <li key={i}>
                    <a 
                      href={item.href} 
                      className="opacity-80 hover:text-primary transition-colors"
                      data-testid={`link-footer-${item.text.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-heading font-bold mb-4">Contact</h4>
              <div className="space-y-2 text-sm opacity-90">
                <p>{siteConfig.organization.email}</p>
                <p>{siteConfig.organization.phone}</p>
                <p>{siteConfig.organization.address}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-heading font-bold mb-4">Stay Connected</h4>
              <form className="space-y-2" onSubmit={handleFooterSubmit} data-testid="form-footer-newsletter">
                <Input 
                  type="email"
                  placeholder="Your Email" 
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  value={footerEmail}
                  onChange={(e) => setFooterEmail(e.target.value)}
                  required
                  data-testid="input-footer-email" 
                />
                <Button 
                  type="submit"
                  variant="secondary" 
                  className="w-full bg-accent btn-minimal-hover"
                  disabled={newsletterMutation.isPending}
                  data-testid="button-footer-subscribe"
                >
                  {newsletterMutation.isPending ? "Subscribing..." : "Subscribe"}
                </Button>
              </form>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 text-center text-sm">
            <p className="opacity-80 mb-2" data-testid="text-footer-copyright">
              © 2025 {siteConfig.organization.name}. All rights reserved.
            </p>
            <p className="opacity-70" data-testid="text-footer-nonprofit">
              {siteConfig.organization.nonprofitStatus}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
