import { Link } from "wouter";

// ─── V.I.A. Academy Page ──────────────────────────────────────────────────
// Route: /programs/via
// V.I.A. = Vanguard Innovation Academy (Phase 1 online)
// Transitions to NOBLE Institute (physical school Phase 2)

export default function ProgramVIA() {
  return (
    <main className="via-page">
      <style>{`
        .via-page {
          font-family: 'DM Sans', 'Inter', sans-serif;
          background: #fff;
          color: #1a2035;
        }
        .eyebrow {
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #c9a84c;
          font-weight: 600;
          margin-bottom: 12px;
          display: block;
        }

        /* HERO */
        .via-hero {
          background: linear-gradient(135deg, #0D1B2A 0%, #2d1a0d 60%, #1a0d00 100%);
          padding: 100px 24px 80px;
          position: relative;
          overflow: hidden;
        }
        .via-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 70% 30%, rgba(201,168,76,0.1) 0%, transparent 60%);
        }
        .via-hero-inner { max-width: 760px; position: relative; }
        .via-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(201,168,76,0.15);
          border: 1px solid rgba(201,168,76,0.3);
          border-radius: 20px;
          padding: 6px 14px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #c9a84c;
          margin-bottom: 20px;
        }
        .via-monogram {
          font-size: clamp(48px, 8vw, 80px);
          font-weight: 900;
          color: #c9a84c;
          letter-spacing: 0.1em;
          line-height: 1;
          margin-bottom: 12px;
          font-family: 'Playfair Display', Georgia, serif;
        }
        .via-hero h1 { font-size: clamp(22px, 4vw, 38px); font-weight: 700; color: #fff; line-height: 1.2; margin-bottom: 8px; }
        .via-hero h2 { font-size: clamp(14px, 2vw, 17px); font-weight: 400; color: rgba(255,255,255,0.6); margin-bottom: 20px; letter-spacing: 0.04em; }
        .via-hero p { font-size: clamp(15px, 2vw, 17px); color: rgba(255,255,255,0.7); line-height: 1.75; max-width: 580px; margin-bottom: 32px; }
        .btn-gold {
          padding: 14px 30px;
          background: #c9a84c;
          color: #0D1B2A;
          font-weight: 700;
          font-size: 14px;
          border-radius: 8px;
          text-decoration: none;
          transition: background 0.2s;
          display: inline-block;
        }
        .btn-gold:hover { background: #e8c97a; }
        .btn-outline {
          padding: 14px 30px;
          background: transparent;
          color: rgba(255,255,255,0.7);
          font-weight: 500;
          font-size: 14px;
          border-radius: 8px;
          text-decoration: none;
          border: 1px solid rgba(255,255,255,0.18);
          transition: all 0.2s;
          display: inline-block;
          margin-left: 12px;
        }
        .btn-outline:hover { background: rgba(255,255,255,0.06); }

        /* SECTIONS */
        .section { padding: 72px 24px; }
        .section-inner { max-width: 1000px; margin: 0 auto; }
        .section-alt { background: #f8f9fc; }
        .section-dark { background: #0D1B2A; }

        /* PHASE 2 BANNER */
        .phase2-banner {
          background: rgba(201,168,76,0.08);
          border: 1px solid rgba(201,168,76,0.22);
          border-radius: 12px;
          padding: 20px 24px;
          display: flex;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 48px;
        }
        .phase2-banner h4 { font-size: 14px; font-weight: 700; color: #c9a84c; margin-bottom: 4px; }
        .phase2-banner p { font-size: 13px; color: #6b7280; line-height: 1.6; margin: 0; }

        /* THE CONCEPT */
        .concept-split {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: start;
          margin-top: 40px;
        }
        .concept-block {
          background: #0D1B2A;
          border-radius: 14px;
          padding: 32px;
          position: relative;
          overflow: hidden;
        }
        .concept-block::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 80% 20%, rgba(201,168,76,0.06) 0%, transparent 65%);
        }
        .concept-block-label {
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #c9a84c;
          margin-bottom: 10px;
          position: relative;
        }
        .concept-block h3 {
          font-size: clamp(20px, 3vw, 28px);
          font-weight: 700;
          color: #fff;
          margin-bottom: 12px;
          line-height: 1.2;
          position: relative;
        }
        .concept-block .tagline {
          font-size: 13px;
          color: #c9a84c;
          font-style: italic;
          margin-bottom: 16px;
          position: relative;
        }
        .concept-block p {
          font-size: 14px;
          color: rgba(255,255,255,0.65);
          line-height: 1.75;
          margin: 0;
          position: relative;
        }

        /* PRICING */
        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-top: 40px;
        }
        .pricing-card {
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid rgba(0,0,0,0.08);
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }
        .pricing-card-top {
          background: #0D1B2A;
          padding: 24px;
          border-bottom: 2px solid #c9a84c;
        }
        .pricing-card-top.heritage { border-bottom-color: #2ecc71; }
        .pricing-tier { font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #c9a84c; margin-bottom: 8px; }
        .pricing-tier.heritage-label { color: #2ecc71; }
        .pricing-name { font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 4px; }
        .pricing-sub { font-size: 12px; color: rgba(255,255,255,0.5); }
        .pricing-card-body { padding: 22px 24px; background: #fff; }
        .pricing-amount { font-size: 34px; font-weight: 700; color: #0D1B2A; font-family: 'Playfair Display', serif; margin-bottom: 4px; }
        .pricing-amount span { font-size: 14px; font-weight: 400; color: #9aa3c0; }
        .pricing-pep { font-size: 12px; color: #6b7280; margin-bottom: 14px; }
        .pricing-features { list-style: none; padding: 0; margin: 0; }
        .pricing-features li { font-size: 13px; color: #4a5568; padding: 6px 0; border-bottom: 1px solid rgba(0,0,0,0.05); display: flex; align-items: center; gap: 8px; }
        .pricing-features li:last-child { border-bottom: none; }
        .pricing-features li::before { content: '✓'; color: #c9a84c; font-weight: 700; flex-shrink: 0; }
        .pricing-features.heritage-feats li::before { color: #2ecc71; }

        /* CURRICULUM */
        .curriculum-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
          margin-top: 36px;
        }
        .curriculum-card {
          background: #fff;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 12px;
          padding: 22px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .curriculum-card-top { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
        .curr-icon { font-size: 20px; }
        .curr-name { font-size: 14px; font-weight: 700; color: #0D1B2A; }
        .curr-real { font-size: 11px; color: #c9a84c; font-weight: 600; }
        .curriculum-card p { font-size: 13px; color: #6b7280; line-height: 1.65; margin: 0; }

        /* NOBLE TEASER */
        .noble-teaser {
          background: linear-gradient(135deg, #0D1B2A, #2d1a0d);
          border: 1px solid rgba(201,168,76,0.25);
          border-radius: 16px;
          padding: 48px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .noble-teaser::before {
          content: 'NOBLE';
          position: absolute;
          bottom: -20px;
          right: -20px;
          font-size: 120px;
          font-weight: 900;
          color: rgba(201,168,76,0.04);
          font-family: 'Playfair Display', serif;
          letter-spacing: 0.1em;
          line-height: 1;
        }
        .noble-teaser h3 { font-size: clamp(22px, 4vw, 36px); font-weight: 700; color: #fff; margin-bottom: 10px; position: relative; }
        .noble-teaser .noble-full { font-size: 13px; color: #c9a84c; letter-spacing: 0.06em; margin-bottom: 18px; position: relative; font-style: italic; }
        .noble-teaser p { font-size: 15px; color: rgba(255,255,255,0.65); max-width: 500px; margin: 0 auto; line-height: 1.75; position: relative; }
        .noble-tagline { font-size: 18px; font-style: italic; color: rgba(255,255,255,0.85); margin-top: 24px; position: relative; font-family: 'Playfair Display', serif; }

        /* CTA */
        .via-cta { background: linear-gradient(135deg, #0D1B2A, #2d1a0d); padding: 72px 24px; text-align: center; }
        .via-cta h2 { font-size: clamp(22px, 4vw, 36px); font-weight: 700; color: #fff; margin-bottom: 16px; }
        .via-cta p { font-size: 16px; color: rgba(255,255,255,0.6); max-width: 500px; margin: 0 auto 32px; line-height: 1.75; }

        @media (max-width: 768px) {
          .concept-split { grid-template-columns: 1fr; gap: 20px; }
          .pricing-grid { grid-template-columns: 1fr; }
          .via-hero { padding: 80px 18px 60px; }
          .section { padding: 56px 18px; }
          .btn-outline { margin-left: 0; margin-top: 12px; display: block; text-align: center; }
          .noble-teaser { padding: 36px 24px; }
        }
      `}</style>

      {/* HERO */}
      <section className="via-hero">
        <div className="via-hero-inner">
          <div className="via-hero-badge">✦ Phase 2 — Planned</div>
          <div className="via-monogram">V.I.A.</div>
          <h1>Vanguard Innovation Academy</h1>
          <h2>Via — Latin for <em>The Path</em> · K–8 Learning Center · Florida</h2>
          <p>An online-first learning center for registered homeschool families. Gamified, AI-driven, culturally grounded. Built for the next generation of underserved leaders — and designed to be accessible through Florida's PEP scholarship program.</p>
          <Link href="/get-involved" className="btn-gold">Join the Waitlist</Link>
          <Link href="/programs" className="btn-outline">← All Programs</Link>
        </div>
      </section>

      {/* STATUS */}
      <section className="section">
        <div className="section-inner">
          <div className="phase2-banner">
            <span style={{fontSize: 20, flexShrink: 0, marginTop: 2}}>📍</span>
            <div>
              <h4>Phase 2 — Launching After Workforce Programs</h4>
              <p>V.I.A. launches after Rising Promise's workforce training programs are funded and stabilized. It's fully planned, financially modeled, and ready to build — but we don't split our focus until Phase 1 is running. This waitlist puts you first in line when we open.</p>
            </div>
          </div>

          {/* VIA vs NOBLE */}
          <span className="eyebrow">Two Phases. One Vision.</span>
          <h2 style={{fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 700, color: '#0D1B2A', marginBottom: 8}}>Online first. Physical flagship second.</h2>
          <p style={{fontSize: 15, color: '#6b7280', maxWidth: 560, lineHeight: 1.7}}>The brand evolves with the organization. We start as a homeschool learning center. We grow into a diploma-granting institution.</p>
          <div className="concept-split">
            <div className="concept-block">
              <div className="concept-block-label">Phase 2 Launch · Online</div>
              <h3>V.I.A.</h3>
              <div className="tagline">Vanguard Innovation Academy</div>
              <p>Online-first learning center for registered homeschoolers. Students use V.I.A. as their primary educational provider through the Florida PEP scholarship program. Full-day immersive curriculum, not an à la carte enrichment center.</p>
            </div>
            <div className="concept-block">
              <div className="concept-block-label">Phase 3 · Physical Flagship</div>
              <h3>NOBLE<br />Institute</h3>
              <div className="tagline">Network of Bold Leaders & Entrepreneurs</div>
              <p>When V.I.A. proves the model, the brand transitions to NOBLE — a physical school where diplomas are earned, legacy is built, and the next generation of excellence is forged. Reclaiming nobility for underrepresented communities.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CURRICULUM */}
      <section className="section section-alt">
        <div className="section-inner">
          <span className="eyebrow">The Curriculum</span>
          <h2 style={{fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 700, color: '#0D1B2A', marginBottom: 8}}>Elite subjects. Real-world logic.</h2>
          <p style={{fontSize: 15, color: '#6b7280', maxWidth: 580, lineHeight: 1.7}}>We map directly to Florida B.E.S.T. standards — but we don't call things by their boring names. Kids deserve subjects that sound as serious as what they're actually learning.</p>
          <div className="curriculum-grid">
            {[
              {icon: '📊', name: 'Quantitative Modeling & Logic', real: 'aka Math', desc: 'From the economics of the Silk Road to Mansa Musa\'s empire — math taught through the lens of people who built wealth.'},
              {icon: '⚖️', name: 'Jurisprudence & Ethics of AI', real: 'aka Civics / Technology', desc: 'How laws work, why they matter, and what it means to build technology responsibly in a world you\'ll inherit.'},
              {icon: '🌍', name: 'Global Systems & Civilizations', real: 'aka History / Social Studies', desc: 'The stories they skipped — empire-building, innovation, trade routes, and the people history tried to erase.'},
              {icon: '🔬', name: 'Applied Sciences & Engineering', real: 'aka Science', desc: 'Hands-on, problem-solving science. Build things. Break things. Understand how the world actually works.'},
              {icon: '📝', name: 'Rhetoric & Narrative Power', real: 'aka English / Language Arts', desc: 'Reading, writing, and the ability to communicate with authority. Your voice is your most powerful tool.'},
              {icon: '💼', name: 'Entrepreneurial Foundations', real: 'aka Business / Financial Literacy', desc: 'How to start something, fund it, run it, and own it. The course we all should have had in school.'},
            ].map((c, i) => (
              <div className="curriculum-card" key={i}>
                <div className="curriculum-card-top">
                  <span className="curr-icon">{c.icon}</span>
                  <div>
                    <div className="curr-name">{c.name}</div>
                    <div className="curr-real">{c.real}</div>
                  </div>
                </div>
                <p>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="section">
        <div className="section-inner">
          <span className="eyebrow">Tuition Structure</span>
          <h2 style={{fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 700, color: '#0D1B2A', marginBottom: 8}}>The Robin Hood Model.</h2>
          <p style={{fontSize: 15, color: '#6b7280', maxWidth: 580, lineHeight: 1.7}}>Families who can pay full price fund the Heritage Tier for students who can't. Everyone gets the same education. The difference is who pays for it.</p>
          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="pricing-card-top">
                <div className="pricing-tier">Standard Enrollment</div>
                <div className="pricing-name">Standard Tier</div>
                <div className="pricing-sub">All families · PEP scholarship eligible</div>
              </div>
              <div className="pricing-card-body">
                <div className="pricing-amount">$15,000<span>/yr</span></div>
                <div className="pricing-pep">~$7,000 out-of-pocket after $8,000 PEP scholarship</div>
                <ul className="pricing-features">
                  <li>Full curriculum access</li>
                  <li>AI-adaptive learning tools</li>
                  <li>Socratic seminars</li>
                  <li>Digital portfolio tracking</li>
                  <li>Community events access</li>
                </ul>
              </div>
            </div>
            <div className="pricing-card">
              <div className="pricing-card-top heritage">
                <div className="pricing-tier heritage-label">Legacy Grant</div>
                <div className="pricing-name">Heritage Tier</div>
                <div className="pricing-sub">Mission-based eligibility · underserved communities</div>
              </div>
              <div className="pricing-card-body">
                <div className="pricing-amount">$0<span> out-of-pocket</span></div>
                <div className="pricing-pep">PEP scholarship covers 100% of tuition</div>
                <ul className="pricing-features pricing-feats">
                  <li>Everything in Standard</li>
                  <li>Legacy Grant covers the gap</li>
                  <li>Family volunteer pathway available</li>
                  <li>Funded by program surplus</li>
                  <li>Mission-aligned family interview</li>
                </ul>
              </div>
            </div>
            <div className="pricing-card">
              <div className="pricing-card-top" style={{borderBottom: '2px solid #1B9CE5'}}>
                <div className="pricing-tier" style={{color: '#1B9CE5'}}>PEP Scholarship</div>
                <div className="pricing-name">Florida Families</div>
                <div className="pricing-sub">Step Up For Students · PEP eligible</div>
              </div>
              <div className="pricing-card-body">
                <div className="pricing-amount" style={{color: '#1B9CE5'}}>~$8,000<span>/yr</span></div>
                <div className="pricing-pep">Average PEP scholarship value · paid directly to V.I.A.</div>
                <ul className="pricing-features" style={{listStyleType: 'none'}}>
                  <li style={{borderBottom: '1px solid rgba(0,0,0,0.05)'}}>✓ Apply through Step Up For Students</li>
                  <li style={{borderBottom: '1px solid rgba(0,0,0,0.05)'}}>✓ Funds go directly to V.I.A.</li>
                  <li style={{borderBottom: '1px solid rgba(0,0,0,0.05)'}}>✓ Family pays remaining gap only</li>
                  <li>✓ Quarterly disbursements</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NOBLE TEASER */}
      <section className="section section-dark">
        <div className="section-inner">
          <div className="noble-teaser">
            <h3>NOBLE Institute</h3>
            <div className="noble-full">Network of Bold Leaders & Entrepreneurs</div>
            <p>When V.I.A. proves the model — enrollment is full, students are thriving, families are committed — the brand transitions to its permanent identity. A physical school. A diploma-granting institution. A space where nobility belongs to us.</p>
            <div className="noble-tagline">"A Noble path to a global legacy."</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="via-cta">
        <h2>Be part of the founding class.</h2>
        <p>V.I.A. hasn't launched yet — but the waitlist is open. Founding families get first enrollment priority and direct input on the program before it opens.</p>
        <Link href="/get-involved" className="btn-gold">Join the Founding Waitlist</Link>
      </section>
    </main>
  );
}
