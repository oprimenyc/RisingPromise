import { siteConfig } from "@/lib/siteConfig";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { StatCounter } from "@/components/StatCounter";
import { GraduationCap, Users, Heart, Facebook, Instagram, Linkedin, Twitter, Menu, X, ArrowRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { motion, useReducedMotion, useInView } from "framer-motion";
import horizontalLogoImage from "@assets/IMG_7944_1775777740428.png";

const iconMap: Record<string, any> = {
  "Graduation Cap": GraduationCap,
  "Users": Users,
  "Heart": Heart,
};

const PRESET_AMOUNTS = [25, 50, 100, 250, 500];
const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [joinUsName, setJoinUsName] = useState("");
  const [joinUsEmail, setJoinUsEmail] = useState("");
  const [footerEmail, setFooterEmail] = useState("");
  const [donationDialogOpen, setDonationDialogOpen] = useState(false);
  const [donationAmount, setDonationAmount] = useState<number | "">(50);
  const [customAmount, setCustomAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const { toast } = useToast();
  const shouldReduceMotion = useReducedMotion();

  const impactRef = useRef(null);
  const impactInView = useInView(impactRef, { once: true, margin: "-100px" });

  const newsletterMutation = useMutation({
    mutationFn: async (data: { email: string; name?: string; source: string }) =>
      apiRequest("POST", "/api/newsletter/signup", data),
    onSuccess: () => {
      toast({ title: "Success!", description: "You've been subscribed to our newsletter." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to subscribe. Please try again.", variant: "destructive" });
    },
  });

  const donationMutation = useMutation({
    mutationFn: async (data: { amount: number; donorName?: string; donorEmail: string }) => {
      const response = await apiRequest("POST", "/api/donations/create-checkout-session", data);
      return response.json();
    },
    onSuccess: (data: { url: string }) => { window.location.href = data.url; },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to initiate donation. Please try again.", variant: "destructive" });
    },
  });

  const handleDonationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = customAmount ? parseFloat(customAmount) : donationAmount;
    if (!finalAmount || finalAmount < 1) {
      toast({ title: "Invalid Amount", description: "Please enter an amount of at least $1.00", variant: "destructive" });
      return;
    }
    if (!donorEmail) {
      toast({ title: "Email Required", description: "Please enter your email address for the receipt", variant: "destructive" });
      return;
    }
    donationMutation.mutate({ amount: Math.round(finalAmount * 100), donorName: donorName || undefined, donorEmail });
  };

  const handleJoinUsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    newsletterMutation.mutate({ email: joinUsEmail, name: joinUsName || undefined, source: "homepage" });
    setJoinUsName("");
    setJoinUsEmail("");
  };

  const handleFooterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    newsletterMutation.mutate({ email: footerEmail, source: "footer" });
    setFooterEmail("");
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        const offsetPosition = element.getBoundingClientRect().top + window.pageYOffset - 64;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        setMobileMenuOpen(false);
      }
    }
  };

  const mv = (delay = 0, duration = 0.6, y = 24) =>
    shouldReduceMotion
      ? {}
      : { variants: fadeUp, initial: "hidden", whileInView: "visible", viewport: { once: true }, transition: { duration, delay, ease: EASE } };

  const mfade = (delay = 0, duration = 0.5) =>
    shouldReduceMotion
      ? {}
      : { variants: fadeIn, initial: "hidden", whileInView: "visible", viewport: { once: true }, transition: { duration, delay, ease: EASE } };

  const heroAnim = (delay: number, duration = 0.6) =>
    shouldReduceMotion
      ? {}
      : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration, delay, ease: EASE } };

  return (
    <div className="min-h-screen font-sans" style={{ background: '#FAFAF9', color: '#0B1F3A' }}>

      {/* ─── NAVIGATION ─── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: '#0B1F3A',
          height: isScrolled ? '56px' : '64px',
          boxShadow: isScrolled ? '0 2px 20px rgba(0,0,0,0.15)' : 'none',
        }}
        data-testid="header-nav"
      >
        <div className="mx-auto px-6 flex items-center justify-between h-full" style={{ maxWidth: '1100px' }}>
          <a href="/" className="flex items-center" data-testid="link-home">
            <img
              src={horizontalLogoImage}
              alt="Rising Promise"
              className="transition-all duration-300"
              style={{ height: isScrolled ? '28px' : '34px', filter: 'brightness(0) invert(1)' }}
            />
          </a>
          <nav className="hidden md:flex items-center gap-8" data-testid="nav-desktop">
            {siteConfig.navigation.menuItems.map((item, i) => (
              <a
                key={i}
                href={item.href}
                onClick={(e) => { if (item.href.startsWith('#')) { e.preventDefault(); scrollToSection(item.href); } }}
                className="font-sans text-white/80 hover:text-accent transition-colors"
                style={{ fontSize: '0.9rem', letterSpacing: '0.03em', textDecoration: 'none' }}
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

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60]" style={{ background: '#0B1F3A' }} data-testid="nav-mobile">
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
                onClick={(e) => { if (item.href.startsWith('#')) { e.preventDefault(); scrollToSection(item.href); } }}
                className="font-sans text-white hover:text-accent transition-colors uppercase tracking-wide text-2xl"
                data-testid={`link-nav-mobile-${item.text.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {item.text}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ─── HERO ─── */}
      <section
        className="relative overflow-hidden flex items-center"
        style={{ minHeight: '100vh', paddingTop: '140px', paddingBottom: '120px', background: 'linear-gradient(135deg, #0B1F3A 0%, #0D2845 60%, #0B1F3A 100%)' }}
        data-testid="section-hero"
      >
        {/* Background image as subtle texture */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url('${siteConfig.hero.backgroundImage}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.15,
          }}
        />
        {/* Noise texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '200px 200px',
            opacity: 0.04,
          }}
        />
        <div className="relative z-10 mx-auto px-6 w-full" style={{ maxWidth: '1100px' }}>
          <motion.p
            {...heroAnim(0, 0.4)}
            className="font-sans font-medium uppercase mb-5"
            style={{ color: '#E8A020', fontSize: '0.7rem', letterSpacing: '0.12em' }}
          >
            Nonprofit Workforce Training
          </motion.p>
          <motion.div
            {...heroAnim(0.1, 0.5)}
            style={{ width: '48px', height: '3px', background: '#E8A020', marginBottom: '24px' }}
          />
          <motion.h1
            {...heroAnim(0.15, 0.7)}
            className="font-heading text-white"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', letterSpacing: '-0.02em', lineHeight: '1.1', maxWidth: '680px', marginBottom: '24px' }}
            data-testid="text-hero-headline"
          >
            {siteConfig.hero.headline}
          </motion.h1>
          <motion.p
            {...heroAnim(0.35, 0.6)}
            className="font-sans"
            style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.25rem', lineHeight: '1.6', maxWidth: '560px', marginBottom: '40px' }}
            data-testid="text-hero-subheadline"
          >
            {siteConfig.hero.subheadline}
          </motion.p>
          <motion.div {...heroAnim(0.5, 0.5)} className="flex flex-wrap gap-4">
            <button
              onClick={() => scrollToSection(siteConfig.hero.primaryButtonHref)}
              className="font-sans font-medium text-white transition-colors"
              style={{ padding: '14px 32px', borderRadius: '4px', fontSize: '1rem', border: 'none', cursor: 'pointer', background: '#1A56DB' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#1447C0')}
              onMouseLeave={e => (e.currentTarget.style.background = '#1A56DB')}
              data-testid="button-hero-primary"
            >
              {siteConfig.hero.primaryButtonText}
            </button>
            <button
              onClick={() => scrollToSection(siteConfig.hero.secondaryButtonHref)}
              className="font-sans font-medium text-white transition-colors"
              style={{ padding: '14px 32px', borderRadius: '4px', fontSize: '1rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.6)', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              data-testid="button-hero-secondary"
            >
              {siteConfig.hero.secondaryButtonText}
            </button>
          </motion.div>
        </div>
      </section>

      {/* ─── STORY ─── */}
      <section
        id="story"
        className="relative overflow-hidden"
        style={{ padding: '96px 0', background: '#FAFAF9' }}
        data-testid="section-story"
      >
        <div className="absolute top-0 right-0 font-heading select-none pointer-events-none" style={{ fontSize: '20rem', color: '#0B1F3A', opacity: 0.03, lineHeight: 1, transform: 'translateY(-10%)' }}>01</div>
        <div className="mx-auto px-6" style={{ maxWidth: '1100px' }}>
          <div style={{ maxWidth: '720px' }}>
            <motion.p {...mfade(0)} className="font-sans font-medium uppercase mb-3" style={{ fontSize: '0.75rem', letterSpacing: '0.08em', color: '#E8A020' }}>
              Our Story
            </motion.p>
            <motion.h2
              {...mv(0.05)}
              className="font-heading mb-10"
              style={{ fontSize: '2.75rem', color: '#0B1F3A', lineHeight: '1.15' }}
              data-testid="text-story-headline"
            >
              {siteConfig.story.headline}
            </motion.h2>
            <motion.div {...(shouldReduceMotion ? {} : { variants: stagger, initial: "hidden", whileInView: "visible", viewport: { once: true } })} className="space-y-5">
              {siteConfig.story.paragraphs.map((p, i) => (
                <motion.p
                  key={i}
                  {...(shouldReduceMotion ? {} : { variants: fadeUp, transition: { duration: 0.5, delay: i * 0.08, ease: EASE } })}
                  className="font-sans leading-[1.7]"
                  style={{
                    fontSize: '1rem',
                    color: '#4A5568',
                    ...(i === 0 ? { paddingLeft: '20px', borderLeft: '3px solid #E8A020' } : {}),
                  }}
                  data-testid={`text-story-p${i + 1}`}
                >
                  {p}
                </motion.p>
              ))}
            </motion.div>
            <motion.p
              {...mv(0.3)}
              className="font-heading mt-10"
              style={{ fontSize: '2rem', color: '#0B1F3A' }}
              data-testid="text-story-closing"
            >
              {siteConfig.story.closing}
            </motion.p>
          </div>
        </div>
      </section>

      {/* ─── WHO WE SEE ─── */}
      <section
        id="who-we-see"
        className="relative"
        style={{ padding: '96px 0', background: '#0B1F3A' }}
        data-testid="section-who-we-see"
      >
        <div className="mx-auto px-6" style={{ maxWidth: '1100px' }}>
          <motion.p {...mfade(0)} className="font-sans font-medium uppercase mb-3" style={{ fontSize: '0.75rem', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)' }}>
            Who We Serve
          </motion.p>
          <motion.h2
            {...mv(0.05)}
            className="font-heading text-white mb-10"
            style={{ fontSize: '2.75rem', lineHeight: '1.15' }}
            data-testid="text-who-headline"
          >
            {siteConfig.whoWeSee.headline}
          </motion.h2>
          <motion.div
            {...(shouldReduceMotion ? {} : { variants: stagger, initial: "hidden", whileInView: "visible", viewport: { once: true } })}
            className="space-y-5 mb-10"
            style={{ maxWidth: '720px' }}
          >
            {siteConfig.whoWeSee.paragraphs.map((p, i) => (
              <motion.p
                key={i}
                {...(shouldReduceMotion ? {} : { variants: fadeUp, transition: { duration: 0.5, delay: i * 0.08, ease: EASE } })}
                className="font-sans text-white leading-[1.7] pl-4"
                style={{ borderLeft: '2px solid #E8A020', fontSize: '1.05rem' }}
                data-testid={`text-who-p${i + 1}`}
              >
                {p}
              </motion.p>
            ))}
          </motion.div>
          <motion.div
            {...mv(0.3)}
            className="rounded-lg p-8"
            style={{ background: '#E8A020', maxWidth: '720px' }}
          >
            <p className="font-sans font-semibold leading-relaxed" style={{ color: '#0B1F3A', fontSize: '1.05rem' }} data-testid="text-who-closing">
              {siteConfig.whoWeSee.closing}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── WHAT WE DO ─── */}
      <section
        id="what-we-do"
        className="relative overflow-hidden"
        style={{ padding: '96px 0', background: '#F4F4F2' }}
        data-testid="section-what-we-do"
      >
        <div className="absolute top-0 right-0 font-heading select-none pointer-events-none" style={{ fontSize: '20rem', color: '#0B1F3A', opacity: 0.03, lineHeight: 1, transform: 'translateY(-10%)' }}>02</div>
        <div className="mx-auto px-6" style={{ maxWidth: '1100px' }}>
          <motion.p {...mfade(0)} className="font-sans font-medium uppercase mb-3" style={{ fontSize: '0.75rem', letterSpacing: '0.08em', color: '#E8A020' }}>
            What We Do
          </motion.p>
          <motion.h2
            {...mv(0.05)}
            className="font-heading mb-4"
            style={{ fontSize: '2.75rem', color: '#0B1F3A', lineHeight: '1.15' }}
            data-testid="text-what-headline"
          >
            {siteConfig.whatWeDo.headline}
          </motion.h2>
          {siteConfig.whatWeDo.introText && (
            <motion.p
              {...mv(0.1)}
              className="font-sans leading-[1.7] mb-12"
              style={{ color: '#4A5568', maxWidth: '640px', fontSize: '1rem' }}
              data-testid="text-what-intro"
            >
              {siteConfig.whatWeDo.introText}
            </motion.p>
          )}
          <motion.div
            {...(shouldReduceMotion ? {} : { variants: stagger, initial: "hidden", whileInView: "visible", viewport: { once: true } })}
            className="grid grid-cols-1 md:grid-cols-3 mb-12"
            style={{ gap: '24px' }}
          >
            {siteConfig.whatWeDo.features.map((feature, i) => {
              const Icon = iconMap[feature.icon] || GraduationCap;
              return (
                <motion.div
                  key={i}
                  {...(shouldReduceMotion ? {} : { variants: fadeUp, transition: { duration: 0.5, delay: i * 0.1, ease: EASE } })}
                  className="bg-white rounded-lg overflow-hidden"
                  style={{ border: '1px solid #E2E6EA', boxShadow: 'none', transition: 'box-shadow 0.2s ease' }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                  data-testid={`card-feature-${i}`}
                >
                  <div style={{ height: '3px', background: '#1A56DB' }} />
                  <div className="p-8">
                    <div
                      className="mb-5 inline-flex items-center justify-center"
                      style={{ width: '40px', height: '40px', background: '#FEF3DC', borderRadius: '8px' }}
                    >
                      <Icon className="w-5 h-5" style={{ color: '#1A56DB' }} />
                    </div>
                    <h3 className="font-sans font-semibold mb-3" style={{ fontSize: '1.1rem', color: '#0B1F3A' }} data-testid={`text-feature-title-${i}`}>
                      {feature.title}
                    </h3>
                    <p className="font-sans leading-[1.7]" style={{ color: '#4A5568', fontSize: '0.95rem' }} data-testid={`text-feature-desc-${i}`}>
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
          <motion.div
            {...mv(0.2)}
            className="rounded-lg mb-8 p-6"
            style={{ background: '#0B1F3A', borderLeft: '4px solid #E8A020' }}
          >
            <p className="font-sans font-semibold text-white" style={{ fontSize: '1.05rem' }} data-testid="text-promise">
              {siteConfig.whatWeDo.promise}
            </p>
          </motion.div>
          <motion.div {...mfade(0.25)}>
            <button
              className="font-sans font-medium text-white transition-colors"
              style={{
                padding: '14px 32px', borderRadius: '4px', fontSize: '1rem', border: 'none', cursor: siteConfig.whatWeDo.buttonComingSoon ? 'default' : 'pointer',
                background: '#1A56DB', opacity: siteConfig.whatWeDo.buttonComingSoon ? 0.5 : 1,
              }}
              disabled={siteConfig.whatWeDo.buttonComingSoon}
              data-testid="button-explore-programs"
            >
              {siteConfig.whatWeDo.buttonText}
              {siteConfig.whatWeDo.buttonComingSoon && (
                <span className="ml-2 font-sans" style={{ fontSize: '0.7rem', background: '#E8A020', color: '#0B1F3A', padding: '2px 8px', borderRadius: '4px' }}>
                  Coming Soon
                </span>
              )}
            </button>
          </motion.div>
        </div>
      </section>

      {/* ─── IMPACT ─── */}
      <section
        id="impact"
        className="relative"
        style={{ padding: '96px 0', background: '#0B1F3A' }}
        ref={impactRef}
        data-testid="section-impact"
      >
        <div className="mx-auto px-6" style={{ maxWidth: '1100px' }}>
          <motion.h2
            {...mv()}
            className="font-heading text-white text-center mb-4"
            style={{ fontSize: '2.75rem', lineHeight: '1.15' }}
            data-testid="text-impact-headline"
          >
            {siteConfig.impact.headline}
          </motion.h2>
          <motion.p
            {...mv(0.1)}
            className="font-sans text-center mb-16"
            style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', maxWidth: '640px', margin: '0 auto 4rem' }}
            data-testid="text-impact-intro"
          >
            {siteConfig.impact.introText}
          </motion.p>
          <motion.div
            {...(shouldReduceMotion ? {} : { variants: stagger, initial: "hidden", whileInView: "visible", viewport: { once: true } })}
            className="grid grid-cols-1 md:grid-cols-3 mb-12"
          >
            {siteConfig.impact.stats.map((stat, i) => (
              <motion.div
                key={i}
                {...(shouldReduceMotion ? {} : { variants: fadeUp, transition: { duration: 0.5, delay: i * 0.1, ease: EASE } })}
                className="text-center py-8"
                style={i > 0 ? { borderLeft: '1px solid rgba(255,255,255,0.1)' } : {}}
                data-testid={`card-stat-${i}`}
              >
                <StatCounter
                  value={stat.number}
                  isVisible={impactInView}
                  className="font-heading block mb-2"
                  style={{ fontSize: '4rem', color: '#E8A020', lineHeight: '1' }}
                  testId={`text-stat-number-${i}`}
                />
                <div className="font-sans font-medium text-white mb-1" style={{ fontSize: '1rem' }} data-testid={`text-stat-label-${i}`}>
                  {stat.label}
                </div>
                {stat.sublabel && (
                  <div className="font-sans uppercase" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', letterSpacing: '0.06em' }} data-testid={`text-stat-sublabel-${i}`}>
                    {stat.sublabel}
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
          <motion.p
            {...mv(0.2)}
            className="font-sans italic text-center"
            style={{ color: 'rgba(255,255,255,0.8)', maxWidth: '640px', margin: '0 auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '32px' }}
            data-testid="text-impact-closing"
          >
            {siteConfig.impact.closing}
          </motion.p>
        </div>
      </section>

      {/* ─── TEAM ─── */}
      <section
        id="team"
        className="relative overflow-hidden"
        style={{ padding: '96px 0', background: '#FAFAF9' }}
        data-testid="section-team"
      >
        <div className="absolute top-0 right-0 font-heading select-none pointer-events-none" style={{ fontSize: '20rem', color: '#0B1F3A', opacity: 0.03, lineHeight: 1, transform: 'translateY(-10%)' }}>03</div>
        <div className="mx-auto px-6" style={{ maxWidth: '1100px' }}>
          <motion.h2
            {...mv()}
            className="font-heading text-center mb-3"
            style={{ fontSize: '2.75rem', color: '#0B1F3A', lineHeight: '1.15' }}
            data-testid="text-team-headline"
          >
            {siteConfig.team.headline}
          </motion.h2>
          <motion.p
            {...mv(0.1)}
            className="font-sans text-center"
            style={{ color: '#4A5568', fontSize: '1rem', maxWidth: '640px', margin: '0 auto 1.5rem' }}
            data-testid="text-team-intro"
          >
            {siteConfig.team.introText}
          </motion.p>
          <motion.p
            {...mv(0.15)}
            className="font-sans font-medium uppercase text-center mb-12"
            style={{ fontSize: '0.7rem', letterSpacing: '0.1em', color: '#E8A020' }}
          >
            Leadership Team
          </motion.p>
          <motion.div
            {...(shouldReduceMotion ? {} : { variants: stagger, initial: "hidden", whileInView: "visible", viewport: { once: true } })}
            className="grid grid-cols-1 md:grid-cols-2 mb-12"
            style={{ gap: '24px' }}
          >
            {siteConfig.team.members.map((member, i) => {
              const nameOnly = member.name.split(',')[0].trim();
              const parts = nameOnly.split(' ').filter(p => p.length > 1 && !p.endsWith('.'));
              const initials = parts.length >= 2
                ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
                : (parts[0]?.[0] ?? '?').toUpperCase();

              return (
                <motion.div
                  key={i}
                  {...(shouldReduceMotion ? {} : { variants: fadeUp, transition: { duration: 0.5, delay: i * 0.1, ease: EASE } })}
                  className="bg-white rounded-lg overflow-hidden"
                  style={{ border: '1px solid #E2E6EA', boxShadow: 'none', transition: 'box-shadow 0.2s ease' }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                  data-testid={`card-team-${i}`}
                >
                  <div style={{ height: '3px', background: '#E8A020' }} />
                  <div className="flex gap-5" style={{ padding: '32px' }}>
                    {/* Initials square */}
                    <div
                      className="flex-shrink-0 flex items-center justify-center"
                      style={{ width: '64px', height: '64px', borderRadius: '8px', background: '#0B1F3A' }}
                      data-testid={`avatar-team-${i}`}
                    >
                      <span className="font-heading" style={{ fontSize: '1.5rem', color: '#E8A020', lineHeight: 1 }}>
                        {initials}
                      </span>
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-sans font-semibold mb-0.5" style={{ fontSize: '1rem', color: '#0B1F3A' }} data-testid={`text-team-name-${i}`}>
                        {member.name}
                      </h3>
                      <p className="font-sans mb-3" style={{ color: '#4A5568', fontSize: '0.8rem' }} data-testid={`text-team-title-${i}`}>
                        {member.title}
                      </p>
                      <div className="relative">
                        <span className="font-heading absolute pointer-events-none" style={{ fontSize: '2.5rem', color: '#E8A020', lineHeight: '1', top: '-6px', left: '-4px' }}>"</span>
                        <p className="font-heading italic pt-4 leading-relaxed" style={{ color: '#0B1F3A', fontSize: '0.875rem', lineHeight: '1.6' }} data-testid={`text-team-quote-${i}`}>
                          {member.quote}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
          <motion.p
            {...mv(0.2)}
            className="font-heading text-center"
            style={{ fontSize: '2rem', color: '#0B1F3A' }}
            data-testid="text-team-closing"
          >
            {siteConfig.team.closing}
          </motion.p>
        </div>
      </section>

      {/* ─── JOIN US ─── */}
      <section
        id="join-us"
        className="relative"
        style={{ padding: '96px 0', background: '#F4F4F2' }}
        data-testid="section-join-us"
      >
        <div className="mx-auto px-6" style={{ maxWidth: '1100px' }}>
          <motion.h2
            {...mv()}
            className="font-heading text-center mb-14"
            style={{ fontSize: '2.75rem', color: '#0B1F3A', lineHeight: '1.15' }}
            data-testid="text-join-headline"
          >
            {siteConfig.joinUs.headline}
          </motion.h2>
          <motion.div
            {...(shouldReduceMotion ? {} : { variants: stagger, initial: "hidden", whileInView: "visible", viewport: { once: true } })}
            className="grid grid-cols-1 lg:grid-cols-2 mx-auto"
            style={{ gap: '24px', maxWidth: '900px' }}
          >
            {/* Need Us card */}
            <motion.div
              {...(shouldReduceMotion ? {} : { variants: fadeUp, transition: { duration: 0.5, ease: EASE } })}
              className="bg-white rounded-lg overflow-hidden"
              style={{ border: '1px solid #E2E6EA' }}
            >
              <div style={{ height: '3px', background: '#1A56DB' }} />
              <div style={{ padding: '40px' }}>
                <h3 className="font-sans font-semibold mb-3" style={{ fontSize: '1.25rem', color: '#0B1F3A' }} data-testid="text-need-headline">
                  {siteConfig.joinUs.needUs.headline}
                </h3>
                <p className="font-sans mb-6 leading-[1.7]" style={{ color: '#4A5568', fontSize: '0.95rem' }} data-testid="text-need-description">
                  {siteConfig.joinUs.needUs.text}
                </p>
                <form className="space-y-3" onSubmit={handleJoinUsSubmit} data-testid="form-need-updates">
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
                  <button
                    type="submit"
                    className="w-full font-sans font-medium text-white transition-colors"
                    style={{ padding: '12px 24px', borderRadius: '4px', fontSize: '0.95rem', border: 'none', cursor: 'pointer', background: '#1A56DB' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#1447C0')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#1A56DB')}
                    disabled={newsletterMutation.isPending}
                    data-testid="button-need-submit"
                  >
                    {newsletterMutation.isPending ? "Subscribing..." : siteConfig.joinUs.needUs.buttonText}
                  </button>
                  <p className="font-sans text-center" style={{ color: '#8A96A3', fontSize: '0.8rem' }} data-testid="text-need-note">
                    {siteConfig.joinUs.needUs.note}
                  </p>
                </form>
              </div>
            </motion.div>

            {/* Believe In Us card */}
            <motion.div
              {...(shouldReduceMotion ? {} : { variants: fadeUp, transition: { duration: 0.5, delay: 0.1, ease: EASE } })}
              className="bg-white rounded-lg overflow-hidden"
              style={{ border: '1px solid #E2E6EA' }}
            >
              <div style={{ height: '3px', background: '#E8A020' }} />
              <div style={{ padding: '40px' }}>
                <h3 className="font-sans font-semibold mb-3" style={{ fontSize: '1.25rem', color: '#0B1F3A' }} data-testid="text-believe-headline">
                  {siteConfig.joinUs.believeInUs.headline}
                </h3>
                <p className="font-sans mb-6 leading-[1.7]" style={{ color: '#4A5568', fontSize: '0.95rem' }} data-testid="text-believe-description">
                  {siteConfig.joinUs.believeInUs.text}
                </p>
                <div className="mb-6" style={{ borderBottom: '1px solid #E2E6EA' }}>
                  {siteConfig.joinUs.believeInUs.actions.map((action, i) => {
                    const isDonate = action.text === "Donate Now";
                    if (isDonate) {
                      return (
                        <div key={i} className="mb-4">
                          <button
                            className="w-full font-sans font-medium text-white transition-colors"
                            style={{ padding: '12px 24px', borderRadius: '4px', fontSize: '0.95rem', border: 'none', cursor: 'pointer', background: '#1A56DB', display: 'block' }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#1447C0')}
                            onMouseLeave={e => (e.currentTarget.style.background = '#1A56DB')}
                            onClick={() => setDonationDialogOpen(true)}
                            data-testid={`button-action-${i}`}
                          >
                            {action.text}
                          </button>
                        </div>
                      );
                    }
                    return (
                      <button
                        key={i}
                        className="w-full font-sans font-medium flex items-center justify-between group transition-colors"
                        style={{
                          padding: '12px 0',
                          background: 'none',
                          border: 'none',
                          borderTop: '1px solid #E2E6EA',
                          cursor: action.comingSoon ? 'default' : 'pointer',
                          color: action.comingSoon ? '#8A96A3' : '#0B1F3A',
                          fontSize: '0.95rem',
                        }}
                        disabled={action.comingSoon}
                        onClick={() => {
                          if (action.comingSoon) return;
                          if (action.text === "Partner With Us") {
                            window.location.href = `mailto:${siteConfig.organization.email}`;
                          } else if (action.text === "Share Our Story") {
                            if (navigator.share) {
                              navigator.share({ title: "Rising Promise", text: "Everyone deserves a fighting chance.", url: window.location.origin }).catch(() => {});
                            } else {
                              navigator.clipboard.writeText(window.location.origin).then(() => {
                                toast({ title: "Link copied!", description: "Share link has been copied to your clipboard." });
                              }).catch(() => {});
                            }
                          }
                        }}
                        data-testid={`button-action-${i}`}
                      >
                        <span className={!action.comingSoon ? 'group-hover:underline' : ''}>
                          {action.text}
                        </span>
                        {action.comingSoon ? (
                          <span className="font-sans" style={{ fontSize: '0.7rem', color: '#8A96A3', background: '#F4F4F2', padding: '2px 8px', borderRadius: '4px' }}>Soon</span>
                        ) : (
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="font-sans italic" style={{ color: '#4A5568', fontSize: '0.875rem' }} data-testid="text-join-closing">
                  {siteConfig.joinUs.believeInUs.closing}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── DONATION DIALOG ─── */}
      <Dialog open={donationDialogOpen} onOpenChange={setDonationDialogOpen}>
        <DialogContent className="sm:max-w-md" data-testid="dialog-donation">
          <DialogHeader>
            <DialogTitle className="font-heading" style={{ fontSize: '1.5rem' }}>Make a Donation to Rising Promise</DialogTitle>
            <DialogDescription className="font-sans">
              Your donation directly funds workforce training, wraparound support, and job placement for people rebuilding their lives. Rising Promise is a registered 501(c)(3) nonprofit — your gift is tax-deductible.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDonationSubmit} className="space-y-6">
            <div>
              <Label className="mb-3 block font-sans">Select Amount</Label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {PRESET_AMOUNTS.map((amount) => {
                  const selected = donationAmount === amount && !customAmount;
                  return (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => { setDonationAmount(amount); setCustomAmount(""); }}
                      className="font-sans font-medium transition-colors"
                      style={{
                        padding: '10px',
                        borderRadius: '4px',
                        fontSize: '0.95rem',
                        border: `1px solid ${selected ? '#1A56DB' : '#E2E6EA'}`,
                        background: selected ? '#1A56DB' : 'transparent',
                        color: selected ? 'white' : '#0B1F3A',
                        cursor: 'pointer',
                      }}
                      data-testid={`button-amount-${amount}`}
                    >
                      ${amount}
                    </button>
                  );
                })}
              </div>
              <div>
                <Label htmlFor="customAmount" className="font-sans">Or enter a custom amount</Label>
                <Input
                  id="customAmount"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="Enter amount"
                  value={customAmount}
                  onChange={(e) => { setCustomAmount(e.target.value); setDonationAmount(""); }}
                  data-testid="input-custom-amount"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="donorName" className="font-sans">Name (Optional)</Label>
              <Input id="donorName" placeholder="Your Name" value={donorName} onChange={(e) => setDonorName(e.target.value)} data-testid="input-donor-name" />
            </div>
            <div>
              <Label htmlFor="donorEmail" className="font-sans">Email Address *</Label>
              <Input id="donorEmail" type="email" placeholder="your@email.com" value={donorEmail} onChange={(e) => setDonorEmail(e.target.value)} required data-testid="input-donor-email" />
              <p className="font-sans mt-1" style={{ fontSize: '0.75rem', color: '#8A96A3' }}>Required for your tax receipt</p>
            </div>
            <button
              type="submit"
              className="w-full font-sans font-medium text-white transition-colors"
              style={{ padding: '14px', borderRadius: '4px', fontSize: '1rem', border: 'none', cursor: 'pointer', background: '#1A56DB', opacity: donationMutation.isPending ? 0.7 : 1 }}
              onMouseEnter={e => { if (!donationMutation.isPending) e.currentTarget.style.background = '#1447C0'; }}
              onMouseLeave={e => (e.currentTarget.style.background = '#1A56DB')}
              disabled={donationMutation.isPending}
              data-testid="button-donate-submit"
            >
              {donationMutation.isPending ? "Processing..." : "Continue to Secure Payment"}
            </button>
            <p className="font-sans text-center" style={{ fontSize: '0.75rem', color: '#8A96A3' }}>
              You'll be redirected to Stripe's secure checkout. Rising Promise is a 501(c)(3) nonprofit. EIN available upon request.
            </p>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── FOOTER ─── */}
      <footer id="footer" style={{ background: '#0B1F3A', paddingTop: '64px', paddingBottom: '48px' }} data-testid="section-footer">
        <div className="mx-auto px-6" style={{ maxWidth: '1100px' }}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div>
              <h4 className="font-sans font-semibold uppercase mb-4 text-white" style={{ fontSize: '0.75rem', letterSpacing: '0.08em' }} data-testid="text-footer-org">
                {siteConfig.organization.name}
              </h4>
              <p className="font-sans mb-5 leading-[1.7]" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }} data-testid="text-footer-tagline">
                {siteConfig.organization.tagline}
              </p>
              <div className="flex gap-4">
                {[
                  { href: siteConfig.social.facebook, Icon: Facebook, testId: "link-social-facebook" },
                  { href: siteConfig.social.instagram, Icon: Instagram, testId: "link-social-instagram" },
                  { href: siteConfig.social.linkedin, Icon: Linkedin, testId: "link-social-linkedin" },
                  { href: siteConfig.social.twitter, Icon: Twitter, testId: "link-social-twitter" },
                ].map(({ href, Icon, testId }) => (
                  <a
                    key={testId}
                    href={href}
                    className="transition-colors"
                    style={{ color: 'rgba(255,255,255,0.5)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#E8A020')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
                    data-testid={testId}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-sans font-semibold uppercase mb-4 text-white" style={{ fontSize: '0.75rem', letterSpacing: '0.08em' }}>Quick Links</h4>
              <ul className="space-y-2">
                {siteConfig.navigation.menuItems.map((item, i) => (
                  <li key={i}>
                    <a
                      href={item.href}
                      className="font-sans transition-colors hover:text-white"
                      style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', textDecoration: 'none' }}
                      data-testid={`link-footer-${item.text.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-sans font-semibold uppercase mb-4 text-white" style={{ fontSize: '0.75rem', letterSpacing: '0.08em' }}>Contact</h4>
              <div className="space-y-2 font-sans" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>
                <p data-testid="text-footer-email">{siteConfig.organization.email}</p>
                <p data-testid="text-footer-phone">{siteConfig.organization.phone}</p>
                <p data-testid="text-footer-address">{siteConfig.organization.address}</p>
              </div>
            </div>
            <div>
              <h4 className="font-sans font-semibold uppercase mb-2 text-white" style={{ fontSize: '0.75rem', letterSpacing: '0.08em' }}>Stay Connected</h4>
              <p className="font-sans mb-3" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>
                Get program updates, impact stories, and ways to get involved.
              </p>
              <form className="space-y-2" onSubmit={handleFooterSubmit} data-testid="form-footer-newsletter">
                <Input
                  type="email"
                  placeholder="Your Email Address"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  value={footerEmail}
                  onChange={(e) => setFooterEmail(e.target.value)}
                  required
                  data-testid="input-footer-email"
                />
                <button
                  type="submit"
                  className="w-full font-sans font-medium text-white transition-colors"
                  style={{ padding: '10px', borderRadius: '4px', fontSize: '0.875rem', border: 'none', cursor: 'pointer', background: '#1A56DB' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#1447C0')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#1A56DB')}
                  disabled={newsletterMutation.isPending}
                  data-testid="button-footer-subscribe"
                >
                  {newsletterMutation.isPending ? "Subscribing..." : "Subscribe"}
                </button>
              </form>
            </div>
          </div>
          <div className="pt-8 text-center font-sans" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="mb-2" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }} data-testid="text-footer-copyright">
              © 2026 {siteConfig.organization.name}. All rights reserved.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }} data-testid="text-footer-nonprofit">
              {siteConfig.organization.nonprofitStatus}
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}

