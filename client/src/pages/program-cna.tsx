import { Link } from "wouter";

// ─── CNA Program Page ─────────────────────────────────────────────────────
// Route: /programs/cna
// Status: In Development — honest, no overpromising

export default function ProgramCNA() {
  return (
    <main className="cna-page">
      <style>{`
        .cna-page {
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
        .cna-hero {
          background: linear-gradient(135deg, #0D1B2A 0%, #1e3a2a 100%);
          padding: 100px 24px 80px;
          position: relative;
          overflow: hidden;
        }
        .cna-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 70% 30%, rgba(46,204,113,0.06) 0%, transparent 65%);
        }
        .cna-hero-inner {
          max-width: 760px;
          position: relative;
        }
        .cna-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(243,156,18,0.15);
          border: 1px solid rgba(243,156,18,0.3);
          border-radius: 20px;
          padding: 6px 14px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #f39c12;
          margin-bottom: 20px;
        }
        .cna-hero h1 {
          font-size: clamp(28px, 5vw, 52px);
          font-weight: 700;
          color: #fff;
          line-height: 1.15;
          margin-bottom: 8px;
        }
        .cna-hero h2 {
          font-size: clamp(16px, 2.5vw, 22px);
          font-weight: 400;
          color: #c9a84c;
          margin-bottom: 20px;
        }
        .cna-hero p {
          font-size: clamp(15px, 2vw, 17px);
          color: rgba(255,255,255,0.7);
          line-height: 1.75;
          max-width: 580px;
          margin-bottom: 32px;
        }
        .hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }
        .btn-primary {
          padding: 14px 30px;
          background: #c9a84c;
          color: #0D1B2A;
          font-weight: 700;
          font-size: 14px;
          border-radius: 8px;
          text-decoration: none;
          letter-spacing: 0.02em;
          transition: background 0.2s;
          display: inline-block;
        }
        .btn-primary:hover { background: #e8c97a; }
        .btn-outline {
          padding: 14px 30px;
          background: transparent;
          color: rgba(255,255,255,0.8);
          font-weight: 500;
          font-size: 14px;
          border-radius: 8px;
          text-decoration: none;
          border: 1px solid rgba(255,255,255,0.2);
          transition: all 0.2s;
          display: inline-block;
        }
        .btn-outline:hover { background: rgba(255,255,255,0.07); }

        /* SECTIONS */
        .section { padding: 72px 24px; }
        .section-inner { max-width: 1000px; margin: 0 auto; }
        .section-alt { background: #f8f9fc; }
        .section-dark { background: #0D1B2A; }

        /* HONEST STATUS BANNER */
        .status-banner {
          background: rgba(243,156,18,0.08);
          border: 1px solid rgba(243,156,18,0.25);
          border-radius: 12px;
          padding: 20px 24px;
          display: flex;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 48px;
        }
        .status-banner-icon {
          font-size: 20px;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .status-banner h4 {
          font-size: 14px;
          font-weight: 700;
          color: #f39c12;
          margin-bottom: 4px;
        }
        .status-banner p {
          font-size: 13px;
          color: #6b7280;
          line-height: 1.6;
          margin: 0;
        }

        /* WHAT YOU GET */
        .certs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          margin-top: 36px;
        }
        .cert-card {
          background: #fff;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 12px;
          padding: 22px;
          border-top: 3px solid #c9a84c;
          box-shadow: 0 2px 10px rgba(0,0,0,0.04);
        }
        .cert-card .cert-icon { font-size: 24px; margin-bottom: 12px; }
        .cert-card h4 { font-size: 15px; font-weight: 700; color: #0D1B2A; margin-bottom: 6px; }
        .cert-card p { font-size: 13px; color: #6b7280; line-height: 1.6; margin: 0; }

        /* FORMAT */
        .format-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-top: 36px;
        }
        .format-block {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 26px;
        }
        .format-block h4 { font-size: 15px; font-weight: 700; color: #c9a84c; margin-bottom: 10px; }
        .format-block p { font-size: 13px; color: rgba(255,255,255,0.65); line-height: 1.7; margin: 0; }
        .format-pct {
          font-size: 40px;
          font-weight: 700;
          color: #fff;
          font-family: 'Playfair Display', serif;
          line-height: 1;
          margin-bottom: 8px;
        }

        /* QUOTE */
        .director-quote {
          background: #0D1B2A;
          border-radius: 14px;
          padding: 36px;
          position: relative;
          overflow: hidden;
        }
        .director-quote::before {
          content: '"';
          position: absolute;
          top: -10px;
          left: 24px;
          font-size: 120px;
          color: rgba(201,168,76,0.12);
          font-family: Georgia, serif;
          line-height: 1;
        }
        .director-quote p {
          font-size: clamp(16px, 2.5vw, 20px);
          color: #fff;
          font-style: italic;
          line-height: 1.75;
          margin-bottom: 16px;
          position: relative;
        }
        .director-quote .attr {
          font-size: 13px;
          color: #c9a84c;
          font-weight: 600;
          font-style: normal;
        }

        /* FUNDING */
        .funding-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-top: 36px;
        }
        .funding-card {
          background: #fff;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.04);
        }
        .funding-card h4 { font-size: 15px; font-weight: 700; color: #0D1B2A; margin-bottom: 8px; }
        .funding-card p { font-size: 13px; color: #6b7280; line-height: 1.6; margin: 0; }
        .funding-card .amount {
          font-size: 26px;
          font-weight: 700;
          color: #c9a84c;
          font-family: 'Playfair Display', serif;
          margin-bottom: 4px;
        }

        /* CTA */
        .cna-cta {
          background: linear-gradient(135deg, #0D1B2A, #1e3a2a);
          padding: 72px 24px;
          text-align: center;
        }
        .cna-cta h2 { font-size: clamp(24px, 4vw, 38px); font-weight: 700; color: #fff; margin-bottom: 16px; }
        .cna-cta p { font-size: 16px; color: rgba(255,255,255,0.65); max-width: 500px; margin: 0 auto 32px; line-height: 1.7; }

        @media (max-width: 768px) {
          .format-row { grid-template-columns: 1fr; }
          .cna-hero { padding: 80px 18px 60px; }
          .section { padding: 56px 18px; }
          .hero-actions { flex-direction: column; }
          .hero-actions a { text-align: center; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section className="cna-hero">
        <div className="cna-hero-inner">
          <div className="cna-hero-badge">⚙ In Development</div>
          <h1>Heart of Healthcare</h1>
          <h2>CNA Certification Program</h2>
          <p>A fast-track pathway to becoming a Certified Nursing Assistant. Built for people who are ready — not for people who already have a head start. No healthcare background required.</p>
          <div className="hero-actions">
            <Link href="/get-involved" className="btn-primary">Get Notified When Open</Link>
            <Link href="/programs" className="btn-outline">← All Programs</Link>
          </div>
        </div>
      </section>

      {/* ── STATUS ── */}
      <section className="section">
        <div className="section-inner">
          <div className="status-banner">
            <span className="status-banner-icon">🔧</span>
            <div>
              <h4>Where We Stand Right Now</h4>
              <p>The curriculum is in development. We're completing a platform audit and finalizing our clinical site partnership before we announce enrollment. We don't launch until we're ready to deliver — and we're getting close. Drop your email and you'll be the first to know.</p>
            </div>
          </div>

          <span className="eyebrow">What You'll Earn</span>
          <h2 style={{fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 700, color: '#0D1B2A', marginBottom: 8}}>Four credentials. One program.</h2>
          <p style={{fontSize: 15, color: '#6b7280', maxWidth: 560, lineHeight: 1.7}}>We don't just hand you one certificate and send you out. Every graduate leaves with a package employers recognize and respect.</p>
          <div className="certs-grid">
            {[
              {icon: '🏥', title: 'Rising Promise CNA Certificate', desc: 'State-pathway certification meeting Texas HHSC NATCEP standards. The foundation of your healthcare career.'},
              {icon: '❤️', title: 'CPR / First Aid (AHA)', desc: 'American Heart Association CPR certification. Required by employers and valid for two years.'},
              {icon: '🔒', title: 'HIPAA Compliance', desc: 'Healthcare privacy law training. Required by every clinical employer, included at no extra cost.'},
              {icon: '🛡️', title: 'Infection Control', desc: 'Essential safety protocols. Part of the clinical skills curriculum, validated on Skills Day.'},
            ].map((c, i) => (
              <div className="cert-card" key={i}>
                <div className="cert-icon">{c.icon}</div>
                <h4>{c.title}</h4>
                <p>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FORMAT ── */}
      <section className="section section-dark">
        <div className="section-inner">
          <span className="eyebrow" style={{color: '#c9a84c'}}>Program Format</span>
          <h2 style={{fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 700, color: '#fff', marginBottom: 8}}>Built around your life. Not the other way around.</h2>
          <p style={{fontSize: 15, color: 'rgba(255,255,255,0.6)', maxWidth: 560, lineHeight: 1.7, marginBottom: 0}}>We know you have a life outside of training. The program is designed so you can get certified without putting everything else on hold.</p>
          <div className="format-row">
            <div className="format-block">
              <div className="format-pct">70%</div>
              <h4>Online — Self-Paced</h4>
              <p>Core curriculum, HIPAA, infection control, patient care theory. Learn on your schedule, on your device. No commute, no fixed class times.</p>
            </div>
            <div className="format-block">
              <div className="format-pct">30%</div>
              <h4>In-Person Skills & Clinical</h4>
              <p>Monthly Skills Day with a contracted licensed nurse for hands-on competency verification. Clinical hours at a partner facility — where real patients and real practice happen.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── DIRECTOR QUOTE ── */}
      <section className="section">
        <div className="section-inner">
          <div className="director-quote">
            <p>"I became a nurse because I wanted to help people heal. Now I help them build futures. This program is built on what I know works — rigorous enough to produce competent CNAs, accessible enough to serve people who've never had a clinical background in their lives."</p>
            <span className="attr">— Shawn J. Wright, FNP · Program Director · Rising Promise</span>
          </div>
        </div>
      </section>

      {/* ── WHO IT'S FOR ── */}
      <section className="section section-alt">
        <div className="section-inner">
          <span className="eyebrow">Who This Program Is For</span>
          <h2 style={{fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 700, color: '#0D1B2A', marginBottom: 8}}>No experience required. Commitment required.</h2>
          <p style={{fontSize: 15, color: '#6b7280', maxWidth: 560, lineHeight: 1.7}}>The only thing we ask is that you show up.</p>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginTop: 32}}>
            {['Women in crisis or transition', 'Veterans', 'Career-changers of any age', 'Foster youth 18–24', 'Returning citizens', 'Underemployed adults seeking stable income'].map((item, i) => (
              <div key={i} style={{padding: '14px 18px', background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 10, fontSize: 14, color: '#0D1B2A', fontWeight: 500}}>
                ✓ {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FUNDING PATHS ── */}
      <section className="section">
        <div className="section-inner">
          <span className="eyebrow">How You Can Pay — Or Not</span>
          <h2 style={{fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 700, color: '#0D1B2A', marginBottom: 8}}>Cost should never be the reason.</h2>
          <p style={{fontSize: 15, color: '#6b7280', maxWidth: 560, lineHeight: 1.7}}>We're building this program to be accessible. Here are the funding pathways we're targeting — confirmed options will be announced with enrollment.</p>
          <div className="funding-grid">
            <div className="funding-card">
              <div className="amount">$0</div>
              <h4>WIOA Funding</h4>
              <p>Workforce Innovation and Opportunity Act vouchers cover training costs for eligible students. CareerSource Florida and state workforce boards refer funded students directly.</p>
            </div>
            <div className="funding-card">
              <div className="amount">$900–$1,500</div>
              <h4>Direct Enrollment</h4>
              <p>Private-pay option for students who don't qualify for WIOA or prefer to self-fund. Scholarship and payment plan options will be available for qualifying students.</p>
            </div>
            <div className="funding-card">
              <div className="amount">Free</div>
              <h4>Work Commitment Track</h4>
              <p>Students who commit to a 6-month placement with a Rising Promise employer partner may qualify for fully subsidized training through a formal agreement.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cna-cta">
        <h2>This program is almost ready for you.</h2>
        <p>We're not taking applications yet — but we are building a notification list. Drop your info and we'll reach out the moment enrollment opens.</p>
        <Link href="/get-involved" className="btn-primary">Join the Waitlist</Link>
      </section>
    </main>
  );
}
