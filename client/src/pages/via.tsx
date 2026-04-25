import { useState } from "react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// ─── V.I.A. — Vanguard Innovation Academy ─────────────────────────────────
// Route: /via
// Colors: Navy #0D1B2A · Gold #c9a84c · White

const DIFFERENTIATORS = [
  {
    num: "01",
    title: "The Executive Mentor Pipeline",
    body: "Students don't just have teachers — they have access. Every student is connected to a professional mentor from our network of successful POC tech founders, attorneys, real estate developers, and entrepreneurs. By 8th grade, your child will have a network of high-powered mentors who look like them, believe in them, and are invested in their success. That network is worth more than any transcript.",
  },
  {
    num: "02",
    title: "Heritage-First Curriculum",
    body: "Traditional schools celebrate diversity as an add-on. At V.I.A., it is the operating system. We teach math through the lens of global POC innovators. History through entrepreneurship and empire-building — the Silk Road, the economics of Mansa Musa, the architects of Silicon Valley who were never given a seat at the table. Psychological safety and cultural confidence built in from day one.",
  },
  {
    num: "03",
    title: "Proof of Work, Not Just Grades",
    body: "Every student graduates with a Digital Portfolio — their own registered LLC, a functioning app or product they've built, and a public speaking reel. We are not just preparing them for high school. We are preparing them for Forbes 30 Under 30.",
  },
  {
    num: "04",
    title: "The Gamified Level-Up System",
    body: "Forget letter grades. Students earn Experience Points (XP), level up from \"Code Novice\" to \"Systems Architect,\" and compete in Squads on a live leaderboard. High-performing students mentor struggling ones to keep their squad's rank high — creating peer accountability no traditional classroom can replicate. Learning here feels like a game. The results are anything but.",
  },
  {
    num: "05",
    title: "The Full-Day Experience",
    body: "For families who need it: luxury door-to-door shuttle transport. Daily catered nutrition. Evening enrichment — coding, chess, public speaking — until 6:00 PM. One international Innovation Trip per year to tech hubs in Bangalore, Lagos, or Dubai. We are not just a school. We are a full-day support system.",
  },
];

const ELECTIVES = [
  { name: "Quantitative Modeling & Logic", aka: "Math", desc: "Numbers as data sets. Real-world simulations." },
  { name: "Rhetoric, Debate & Narrative Design", aka: "English/Speaking", desc: "High-stakes persuasion. The \"Debate Arena.\"" },
  { name: "Systems Architecture & Biomimicry", aka: "Science", desc: "3D modeling, virtual labs, engineering through nature." },
  { name: "Game Theory & Behavioral Economics", aka: "Economics", desc: "Markets and human choices through strategy." },
  { name: "Jurisprudence & The Ethics of AI", aka: "Civics", desc: "Constitutional law applied to future-tech dilemmas." },
  { name: "Full-Stack Development & Cyber-Logic", aka: "Computer Science", desc: "Python, Lua, cybersecurity fundamentals." },
  { name: "Strategic Wealth & Capital Management", aka: "Business", desc: "\"Alpha Wallet\" simulated economy, virtual stock portfolios." },
  { name: "Kinetic Performance & Biometrics", aka: "PE/Health", desc: "Physical health data tracked for peak performance." },
  { name: "Heritage Leadership & Global Trade History", aka: "History/Social Studies", desc: "POC empires, innovators, wealth-builders." },
  { name: "Visual Brand Identity & UX", aka: "Art/Design", desc: "App design, brand logos, user experience." },
];

const TIERS = [
  {
    name: "FOUNDER TIER",
    who: "Families seeking the full concierge experience and executive network",
    tuition: "$30,000/year",
    outOfPocket: "~$22,000/year with PEP scholarship",
    accent: "#c9a84c",
  },
  {
    name: "COMMUNITY TIER",
    who: "Scholarship-dependent families",
    tuition: "$10,000/year (Online track)",
    outOfPocket: "~$2,000/year with PEP scholarship",
    accent: "#1B9CE5",
    featured: true,
  },
  {
    name: "HERITAGE TIER",
    who: "Students from historically underinvested communities",
    tuition: "$0 out-of-pocket",
    outOfPocket: "PEP Scholarship + 10 Family Volunteer Hours/month",
    accent: "#2ecc71",
  },
];

const WHO_WE_SERVE = [
  "We see the Black family that has been told \"elite education\" isn't for their child.",
  "We see the POC parent who wants their child surrounded by peers who look like them.",
  "We see the family that is homeschool-curious but terrified of doing it alone.",
  "We see the parent who is tired of managing curriculum and wants a high-tech system to take over.",
  "We see the working parent who needs a full-day solution, not just a school day.",
];

export default function VIA() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    gradeLevel: "",
    numChildren: "",
    track: "",
    hasPEP: "",
    excitement: [] as string[],
    notes: "",
  });

  const submitMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("POST", "/api/newsletter/signup", { name: data.name, email: data.email, source: "via-waitlist", metadata: data });
    },
    onSuccess: () => {
      toast({ title: "You're on the list!", description: "Welcome to the V.I.A. movement. We'll be in touch with updates and founding family access." });
      setFormData({ name: "", email: "", gradeLevel: "", numChildren: "", track: "", hasPEP: "", excitement: [], notes: "" });
    },
    onError: () => {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    },
  });

  const toggleExcitement = (val: string) => {
    setFormData(prev => ({
      ...prev,
      excitement: prev.excitement.includes(val)
        ? prev.excitement.filter(v => v !== val)
        : [...prev.excitement, val],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    submitMutation.mutate(formData);
  };

  return (
    <main style={{ fontFamily: "'DM Sans', 'Inter', sans-serif", background: "#fff", color: "#1a2035" }}>
      <style>{`
        .via-page { font-family: 'DM Sans', sans-serif; }
        .via-eyebrow { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #c9a84c; font-weight: 600; display: block; margin-bottom: 14px; }
        .via-btn-gold { display: inline-block; padding: 16px 36px; background: #c9a84c; color: #0D1B2A; font-weight: 700; font-size: 15px; border-radius: 8px; text-decoration: none; letter-spacing: 0.02em; transition: background 0.2s; border: none; cursor: pointer; }
        .via-btn-gold:hover { background: #e8c97a; }
        .via-btn-ghost { display: inline-block; padding: 16px 36px; background: transparent; color: #c9a84c; font-weight: 600; font-size: 15px; border-radius: 8px; text-decoration: none; border: 1px solid rgba(201,168,76,0.4); margin-left: 16px; transition: all 0.2s; }
        .via-btn-ghost:hover { background: rgba(201,168,76,0.08); }
        .diff-card { border-left: 3px solid #c9a84c; padding: 28px 32px; background: #f8f9fc; border-radius: 0 12px 12px 0; transition: box-shadow 0.2s; }
        .diff-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.08); }
        .elective-card { background: #0D1B2A; border-radius: 12px; padding: 20px 22px; }
        .elective-aka { font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(201,168,76,0.7); font-family: 'DM Mono', monospace; margin-bottom: 6px; }
        .tier-card { border-radius: 16px; padding: 36px 32px; border: 2px solid transparent; transition: transform 0.2s; }
        .tier-card:hover { transform: translateY(-4px); }
        .serve-row { padding: 20px 24px; border-radius: 12px; background: #f8f9fc; border-left: 3px solid #c9a84c; font-size: clamp(15px, 2vw, 18px); color: #1a2035; line-height: 1.5; }
        .via-form input, .via-form select, .via-form textarea { width: 100%; padding: 14px 16px; border-radius: 8px; border: 1.5px solid #e2e8f0; font-size: 15px; font-family: inherit; outline: none; box-sizing: border-box; transition: border-color 0.2s; }
        .via-form input:focus, .via-form select:focus, .via-form textarea:focus { border-color: #c9a84c; }
        .check-pill { display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 24px; border: 1.5px solid #e2e8f0; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.2s; user-select: none; }
        .check-pill.active { background: rgba(201,168,76,0.12); border-color: #c9a84c; color: #0D1B2A; }
        @media (max-width: 768px) {
          .via-btn-ghost { margin-left: 0; margin-top: 12px; display: block; text-align: center; }
          .tier-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section style={{ background: "linear-gradient(135deg, #0D1B2A 0%, #1a2d1a 60%, #0D1B2A 100%)", padding: "120px 24px 100px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 60%, rgba(201,168,76,0.1) 0%, transparent 65%)" }} />
        <div style={{ position: "relative", maxWidth: 760, margin: "0 auto" }}>
          <span className="via-eyebrow">V.I.A. — Vanguard Innovation Academy</span>
          <h1 style={{ fontSize: "clamp(32px, 6vw, 64px)", fontWeight: 700, color: "#fff", lineHeight: 1.1, marginBottom: 16 }}>The Elite School<br />They Never Built for Us.</h1>
          <p style={{ fontSize: "clamp(18px, 2.5vw, 24px)", color: "#c9a84c", fontStyle: "italic", marginBottom: 40 }}>We built it ourselves.</p>
          <a href="#waitlist" className="via-btn-gold">Join the V.I.A. Waitlist</a>
        </div>
      </section>

      {/* ── OPENING ── */}
      <section style={{ maxWidth: 800, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        <p style={{ fontSize: "clamp(16px, 2vw, 19px)", color: "#2d3748", lineHeight: 1.85, marginBottom: 24 }}>For too long, elite education has been a closed room. The best technology, the most powerful networks, the highest-caliber instruction — all of it reserved for families who already had everything.</p>
        <p style={{ fontSize: "clamp(16px, 2vw, 19px)", color: "#2d3748", lineHeight: 1.85, marginBottom: 24 }}>V.I.A. — Vanguard Innovation Academy — is a high-impact, private K–8 learning center designed to cultivate the next generation of leaders from underserved communities. We are not just a school. We are a cultural fortress, a launchpad, and a movement — built specifically for Black and POC families who refuse to accept that excellence is someone else's birthright.</p>
        <p style={{ fontSize: "clamp(16px, 2vw, 19px)", color: "#2d3748", lineHeight: 1.85, marginBottom: 24 }}>We offer AI-adaptive curriculum, a gamified mastery system, and the data-driven results of the most elite tech schools in the country. And we pair it with something no generic private school can offer: a community that looks like your child, mentors who have walked their path, and a curriculum that treats their heritage as a competitive advantage — not an afterthought.</p>
        <p style={{ fontSize: "clamp(17px, 2.2vw, 20px)", fontWeight: 700, color: "#0D1B2A" }}>Our belief: Potential is not determined by your past. It is unlocked by your future. And the future we are building is extraordinary.</p>
      </section>

      {/* ── DIFFERENTIATORS ── */}
      <section style={{ background: "#0D1B2A", padding: "80px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <span className="via-eyebrow">Why V.I.A.</span>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 700, color: "#fff", marginBottom: 48, maxWidth: 600 }}>Five Things No Other School Can Offer</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {DIFFERENTIATORS.map((d) => (
              <div key={d.num} className="diff-card">
                <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#c9a84c", letterSpacing: "0.1em", minWidth: 24, paddingTop: 4 }}>{d.num}</span>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0D1B2A", marginBottom: 10 }}>{d.title}</h3>
                    <p style={{ fontSize: 14, color: "#4a5568", lineHeight: 1.75, margin: 0 }}>{d.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CURRICULUM ── */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <span className="via-eyebrow">The V.I.A. Tech Stack</span>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 700, color: "#0D1B2A", marginBottom: 12 }}>The Courses Sound Different Because They Are.</h2>
          <p style={{ fontSize: 16, color: "#4a5568", maxWidth: 620, lineHeight: 1.7, marginBottom: 48 }}>We map to Florida B.E.S.T. standards — but we don't call things by their boring names. Our students are doing serious work, and the course names reflect it.</p>

          <div style={{ background: "#f8f9fc", borderRadius: 16, padding: "28px 32px", marginBottom: 32 }}>
            <span style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "#c9a84c", fontWeight: 600, fontFamily: "'DM Mono', monospace", display: "block", marginBottom: 16 }}>Morning Mastery Block (AI-Adaptive)</span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
              <div>
                <div style={{ fontWeight: 700, color: "#0D1B2A", fontSize: 14, marginBottom: 4 }}>Mathematics</div>
                <div style={{ fontSize: 13, color: "#4a5568" }}>ALEKS (McGraw Hill) — procedural fluency, algebraic reasoning</div>
              </div>
              <div>
                <div style={{ fontWeight: 700, color: "#0D1B2A", fontSize: 14, marginBottom: 4 }}>English / ELA</div>
                <div style={{ fontSize: 13, color: "#4a5568" }}>Lexia PowerUp — advanced reading comprehension, argumentative writing</div>
              </div>
            </div>
          </div>

          <span style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "#c9a84c", fontWeight: 600, fontFamily: "'DM Mono', monospace", display: "block", marginBottom: 20 }}>Afternoon Alpha Electives</span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {ELECTIVES.map((e, i) => (
              <div key={i} className="elective-card">
                <div className="elective-aka">{String(i + 1).padStart(2, "0")} · aka {e.aka}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{e.name}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{e.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HYBRID MODEL ── */}
      <section style={{ background: "#0D1B2A", padding: "80px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <span className="via-eyebrow">Online + In-Person</span>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 700, color: "#fff", marginBottom: 24 }}>Learn Anywhere. Level Up Everywhere.</h2>
          <p style={{ fontSize: "clamp(15px, 2vw, 17px)", color: "rgba(255,255,255,0.7)", lineHeight: 1.85, marginBottom: 20 }}>V.I.A. operates on a hybrid model — a physical learning center for the full immersive experience, and a Virtual Track for families who need flexibility without sacrificing quality.</p>
          <p style={{ fontSize: "clamp(15px, 2vw, 17px)", color: "rgba(255,255,255,0.7)", lineHeight: 1.85, marginBottom: 20 }}>The Virtual Experience is not a Zoom call. It is a Digital Command Center. Parents have a live dashboard showing their child's rank, daily mastery score, and focus hours in real time. Weekly "Level-Up Reports" track every milestone. Squads compete across the state. Top leaderboard performers earn real-world rewards — high-end tech gear, exclusive experiences, and recognition that matters.</p>
          <p style={{ fontSize: "clamp(15px, 2vw, 17px)", color: "rgba(255,255,255,0.7)", lineHeight: 1.85 }}>For families already receiving the Florida PEP scholarship, the Virtual Track accepts your scholarship directly — making world-class education accessible for a fraction of what traditional elite programs charge.</p>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <span className="via-eyebrow">Tuition Structure</span>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 700, color: "#0D1B2A", marginBottom: 12 }}>Elite Education. Accessible by Design.</h2>
          <p style={{ fontSize: 16, color: "#4a5568", maxWidth: 640, lineHeight: 1.75, marginBottom: 48 }}>We built our pricing around a simple principle: families who can afford more fund the opportunity for families who cannot. Every tier receives the same education. The difference is in the wraparound services and the community you join.</p>

          <div className="tier-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginBottom: 40 }}>
            {TIERS.map((t) => (
              <div key={t.name} className="tier-card" style={{ background: t.featured ? "#0D1B2A" : "#f8f9fc", borderColor: t.accent, border: `2px solid ${t.accent}` }}>
                <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", letterSpacing: "0.12em", color: t.accent, marginBottom: 16, textTransform: "uppercase" }}>{t.name}</div>
                <p style={{ fontSize: 13, color: t.featured ? "rgba(255,255,255,0.65)" : "#4a5568", lineHeight: 1.6, marginBottom: 24, minHeight: 52 }}>{t.who}</p>
                <div style={{ fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 700, color: t.featured ? "#fff" : "#0D1B2A", fontFamily: "'Playfair Display', serif", marginBottom: 8 }}>{t.tuition}</div>
                <div style={{ fontSize: 13, color: t.accent }}>{t.outOfPocket}</div>
              </div>
            ))}
          </div>

          <div style={{ background: "rgba(46,204,113,0.08)", border: "1.5px solid rgba(46,204,113,0.3)", borderRadius: 12, padding: "28px 32px", marginBottom: 24 }}>
            <h4 style={{ fontSize: 16, fontWeight: 700, color: "#0D1B2A", marginBottom: 10 }}>The Heritage Tier is our mission made real.</h4>
            <p style={{ fontSize: 14, color: "#4a5568", lineHeight: 1.75, margin: 0 }}>Funded by the operational surplus of the program — it ensures the students who need this most are never priced out. Heritage families contribute 10 hours of service per month: community outreach, cultural workshops, or mentoring students in their own professional fields. This is not charity. It is community.</p>
          </div>

          <div style={{ background: "rgba(243,156,18,0.08)", border: "1.5px solid rgba(243,156,18,0.3)", borderRadius: 12, padding: "24px 32px" }}>
            <p style={{ fontSize: 14, color: "#4a5568", lineHeight: 1.75, margin: 0 }}><strong style={{ color: "#0D1B2A" }}>Florida PEP Scholarship note:</strong> The Florida PEP Scholarship (averaging $8,000/year) is currently at capacity for new students for the 2026–27 school year. We strongly encourage families who already hold the scholarship to apply now. For families without the scholarship, we will help you navigate the application process for future cycles.</p>
          </div>
        </div>
      </section>

      {/* ── WHO WE SERVE ── */}
      <section style={{ background: "#0D1B2A", padding: "80px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <span className="via-eyebrow">Our Community</span>
          <h2 style={{ fontSize: "clamp(28px, 4.5vw, 48px)", fontWeight: 700, color: "#fff", marginBottom: 48 }}>We See You.</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {WHO_WE_SERVE.map((line, i) => (
              <div key={i} className="serve-row">{line}</div>
            ))}
          </div>
          <p style={{ fontSize: "clamp(18px, 2.5vw, 22px)", fontWeight: 700, color: "#c9a84c", marginTop: 48, lineHeight: 1.4 }}>You're not looking for a school. You're looking for a movement. Welcome home.</p>
        </div>
      </section>

      {/* ── WAITLIST FORM ── */}
      <section id="waitlist" style={{ padding: "80px 24px", background: "#f8f9fc" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <span className="via-eyebrow">Secure Your Child's Seat</span>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 700, color: "#0D1B2A", marginBottom: 16 }}>The Doors Aren't Open Yet. But the List Is.</h2>
          <p style={{ fontSize: 16, color: "#4a5568", lineHeight: 1.75, marginBottom: 40 }}>V.I.A. is currently in development — Phase 2 of Rising Promise's growth plan. The families who join our waitlist today will be the first to receive enrollment invitations, founding family pricing, and exclusive access to our pre-launch community events. This is how movements start — not with a grand opening, but with the people who believed before the doors were open.</p>

          <form className="via-form" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <input type="text" placeholder="Your Name *" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} required />
              <input type="email" placeholder="Email Address *" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} required />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <select value={formData.gradeLevel} onChange={e => setFormData(p => ({ ...p, gradeLevel: e.target.value }))}>
                <option value="">Child's Grade Level</option>
                {["Pre-K", "Kindergarten", "1st Grade", "2nd Grade", "3rd Grade", "4th Grade", "5th Grade", "6th Grade", "7th Grade", "8th Grade"].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <select value={formData.numChildren} onChange={e => setFormData(p => ({ ...p, numChildren: e.target.value }))}>
                <option value="">Number of Children Enrolling</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3+">3+</option>
              </select>
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#0D1B2A", marginBottom: 12 }}>Program Track Interest</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {["Physical Campus (South Florida)", "Online Virtual Track", "Both", "Not Sure Yet"].map(opt => (
                  <label key={opt} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 14, color: "#2d3748" }}>
                    <input type="radio" name="track" value={opt} checked={formData.track === opt} onChange={e => setFormData(p => ({ ...p, track: e.target.value }))} style={{ width: "auto", accentColor: "#c9a84c" }} />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#0D1B2A", marginBottom: 12 }}>Do you currently hold a Florida PEP Scholarship?</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {["Yes, we have it", "No, but we're interested", "Not sure what that is"].map(opt => (
                  <label key={opt} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 14, color: "#2d3748" }}>
                    <input type="radio" name="pep" value={opt} checked={formData.hasPEP === opt} onChange={e => setFormData(p => ({ ...p, hasPEP: e.target.value }))} style={{ width: "auto", accentColor: "#c9a84c" }} />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#0D1B2A", marginBottom: 12 }}>What excites you most about V.I.A.? (select all that apply)</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {["The AI-Gamified Curriculum", "The Cultural & Heritage Focus", "The Executive Mentor Network", "The Heritage Tier", "The Online Flexibility", "The Full-Day Experience"].map(opt => (
                  <span key={opt} className={`check-pill ${formData.excitement.includes(opt) ? "active" : ""}`} onClick={() => toggleExcitement(opt)}>
                    {formData.excitement.includes(opt) ? "✓ " : ""}{opt}
                  </span>
                ))}
              </div>
            </div>
            <textarea placeholder="Anything else you want us to know? (optional)" value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} rows={4} style={{ resize: "vertical" }} />
            <button type="submit" className="via-btn-gold" disabled={submitMutation.isPending} style={{ textAlign: "center", width: "100%", fontSize: 16 }}>
              {submitMutation.isPending ? "Joining..." : "Join the V.I.A. Movement →"}
            </button>
            <p style={{ fontSize: 12, color: "#9aa3b2", textAlign: "center", lineHeight: 1.6 }}>By joining the waitlist, you are not committing to enrollment. You are simply telling us you believe in what we are building — and we will make sure you are the first to know when it is ready. No spam. Ever.</p>
          </form>
        </div>
      </section>

      {/* ── CLOSING CTA ── */}
      <section style={{ background: "#0D1B2A", padding: "80px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(26px, 4.5vw, 44px)", fontWeight: 700, color: "#fff", marginBottom: 24, lineHeight: 1.2 }}>This Isn't Just a School. It's a Statement.</h2>
          <p style={{ fontSize: "clamp(15px, 2vw, 17px)", color: "rgba(255,255,255,0.7)", lineHeight: 1.85, marginBottom: 40 }}>A statement that excellence belongs to every child. That technology is a tool for liberation, not just profit. That the next generation of Black and POC founders, investors, and leaders deserves the same head start as everyone else. We are building that future right now. And we want your family to be part of it from day one.</p>
          <div>
            <a href="#waitlist" className="via-btn-gold">Join the Waitlist</a>
            <Link href="/programs" className="via-btn-ghost">Learn About Our Programs</Link>
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 48, lineHeight: 1.6 }}>V.I.A. — Vanguard Innovation Academy is a division of Rising Promise, a 501(c)(3) nonprofit organization. Texas-Based. Serving Communities Nationwide.</p>
        </div>
      </section>
    </main>
  );
}
