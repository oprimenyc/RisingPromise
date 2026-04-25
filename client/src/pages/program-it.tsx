import { Link } from "wouter";

// ─── CompTIA IT Program Page ──────────────────────────────────────────────
// Route: /programs/it
// Status: Under Audit — honest, no launch promises

export default function ProgramIT() {
  return (
    <main className="it-page">
      <style>{`
        .it-page {
          font-family: 'DM Sans', 'Inter', sans-serif;
          background: #fff;
          color: #1a2035;
        }
        .eyebrow {
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #1B9CE5;
          font-weight: 600;
          margin-bottom: 12px;
          display: block;
        }

        /* HERO */
        .it-hero {
          background: linear-gradient(135deg, #0D1B2A 0%, #0d2a3a 100%);
          padding: 100px 24px 80px;
          position: relative;
          overflow: hidden;
        }
        .it-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 65% 35%, rgba(27,156,229,0.08) 0%, transparent 65%);
        }
        .it-hero-inner { max-width: 760px; position: relative; }
        .it-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 20px;
          padding: 6px 14px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.6);
          margin-bottom: 20px;
        }
        .it-hero h1 { font-size: clamp(28px, 5vw, 52px); font-weight: 700; color: #fff; line-height: 1.15; margin-bottom: 8px; }
        .it-hero h2 { font-size: clamp(15px, 2.5vw, 20px); font-weight: 400; color: #1B9CE5; margin-bottom: 20px; }
        .it-hero p { font-size: clamp(15px, 2vw, 17px); color: rgba(255,255,255,0.7); line-height: 1.75; max-width: 580px; margin-bottom: 32px; }
        .hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }
        .btn-blue {
          padding: 14px 30px;
          background: #1B9CE5;
          color: #fff;
          font-weight: 700;
          font-size: 14px;
          border-radius: 8px;
          text-decoration: none;
          transition: background 0.2s;
          display: inline-block;
        }
        .btn-blue:hover { background: #2cb5ff; }
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
        }
        .btn-outline:hover { background: rgba(255,255,255,0.06); }

        /* SECTION */
        .section { padding: 72px 24px; }
        .section-inner { max-width: 1000px; margin: 0 auto; }
        .section-alt { background: #f8f9fc; }
        .section-dark { background: #0D1B2A; }

        /* STATUS BANNER */
        .status-banner {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 22px 26px;
          display: flex;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 48px;
        }
        .status-banner-icon { font-size: 20px; flex-shrink: 0; margin-top: 2px; }
        .status-banner h4 { font-size: 14px; font-weight: 700; color: rgba(255,255,255,0.85); margin-bottom: 4px; }
        .status-banner p { font-size: 13px; color: rgba(255,255,255,0.55); line-height: 1.65; margin: 0; }

        /* CERT TRACKS */
        .cert-tracks {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-top: 40px;
        }
        .cert-track {
          background: #fff;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.05);
        }
        .cert-track-top {
          background: #0D1B2A;
          padding: 22px 24px 18px;
          border-bottom: 2px solid #1B9CE5;
        }
        .cert-track-label { font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: #1B9CE5; font-weight: 600; margin-bottom: 6px; }
        .cert-track-top h3 { font-size: 18px; font-weight: 700; color: #fff; margin: 0 0 4px; }
        .cert-track-top p { font-size: 12px; color: rgba(255,255,255,0.5); margin: 0; }
        .cert-track-body { padding: 20px 24px 24px; }
        .cert-track-body p { font-size: 13.5px; color: #4a5568; line-height: 1.7; margin-bottom: 14px; }
        .cert-track-jobs { display: flex; flex-wrap: wrap; gap: 6px; }
        .job-tag { font-size: 11px; padding: 4px 10px; background: #e8f4fd; color: #1a6291; border-radius: 20px; font-weight: 500; }

        /* PLATFORM PREVIEW */
        .platform-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-top: 40px;
        }
        .pstat {
          text-align: center;
          padding: 24px 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
        }
        .pstat-num { font-size: 32px; font-weight: 700; color: #1B9CE5; font-family: 'Playfair Display', serif; line-height: 1; margin-bottom: 6px; }
        .pstat-label { font-size: 12px; color: rgba(255,255,255,0.55); line-height: 1.4; }

        /* CURRICULUM PREVIEW */
        .modules-list {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 32px;
        }
        .module-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          background: #fff;
          border: 1px solid rgba(0,0,0,0.07);
          border-radius: 10px;
        }
        .module-num {
          width: 32px;
          height: 32px;
          background: #0D1B2A;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: #1B9CE5;
          font-weight: 600;
          flex-shrink: 0;
        }
        .module-info h5 { font-size: 13.5px; font-weight: 700; color: #0D1B2A; margin: 0 0 2px; }
        .module-info span { font-size: 11px; color: #9aa3c0; font-family: 'DM Mono', monospace; }

        /* FUNDING */
        .funding-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 18px;
          margin-top: 36px;
        }
        .funding-card {
          background: #fff;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 12px;
          padding: 22px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .funding-card .amt { font-size: 26px; font-weight: 700; color: #c9a84c; font-family: 'Playfair Display', serif; margin-bottom: 4px; }
        .funding-card h4 { font-size: 14px; font-weight: 700; color: #0D1B2A; margin-bottom: 6px; }
        .funding-card p { font-size: 13px; color: #6b7280; line-height: 1.6; margin: 0; }

        /* CTA */
        .it-cta { background: #0d2a3a; padding: 72px 24px; text-align: center; }
        .it-cta h2 { font-size: clamp(22px, 4vw, 36px); font-weight: 700; color: #fff; margin-bottom: 16px; }
        .it-cta p { font-size: 16px; color: rgba(255,255,255,0.6); max-width: 500px; margin: 0 auto 32px; line-height: 1.7; }

        @media (max-width: 768px) {
          .platform-stats { grid-template-columns: 1fr 1fr; }
          .modules-list { grid-template-columns: 1fr; }
          .funding-row { grid-template-columns: 1fr; }
          .it-hero { padding: 80px 18px 60px; }
          .section { padding: 56px 18px; }
          .hero-actions { flex-direction: column; }
          .hero-actions a { text-align: center; }
        }
      `}</style>

      {/* HERO */}
      <section className="it-hero">
        <div className="it-hero-inner">
          <div className="it-hero-badge">🔍 Under Audit</div>
          <h1>Pathways in Technology</h1>
          <h2>CompTIA IT Certification Training</h2>
          <p>Industry-recognized CompTIA certifications for career-changers entering the tech workforce. The platform is built. We're auditing it before we open doors — because we don't promise what we can't deliver.</p>
          <div className="hero-actions">
            <Link href="/get-involved" className="btn-blue">Get Notified When Open</Link>
            <Link href="/programs" className="btn-outline">← All Programs</Link>
          </div>
        </div>
      </section>

      {/* STATUS */}
      <section className="section section-dark">
        <div className="section-inner">
          <div className="status-banner">
            <span className="status-banner-icon">🔍</span>
            <div>
              <h4>Where We Stand Right Now</h4>
              <p>A full-stack training platform has been built — 40 hours of structured curriculum, AI chatbot, resume builder, progress tracking, and WIOA compliance tools. We're currently auditing it to verify completion, fix any gaps, and determine what budget is needed to finalize before launch. We'll be honest with you about the timeline when we have one.</p>
            </div>
          </div>

          <span className="eyebrow" style={{color: '#1B9CE5'}}>Platform Snapshot</span>
          <h2 style={{fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 700, color: '#fff', marginBottom: 8}}>What's already built.</h2>
          <p style={{fontSize: 15, color: 'rgba(255,255,255,0.6)', maxWidth: 560, lineHeight: 1.7}}>This isn't an idea. The platform exists. Here's what the audit is evaluating.</p>
          <div className="platform-stats">
            {[
              {num: '40', label: 'Hours of Structured Curriculum'},
              {num: '9', label: 'Modules Across Core 1 & Core 2'},
              {num: 'AI', label: 'Study Chatbot Built In'},
              {num: '90%+', label: 'Target Pass Rate Design'},
            ].map((s, i) => (
              <div className="pstat" key={i}>
                <div className="pstat-num">{s.num}</div>
                <div className="pstat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CERT TRACKS */}
      <section className="section">
        <div className="section-inner">
          <span className="eyebrow">Certification Tracks</span>
          <h2 style={{fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 700, color: '#0D1B2A', marginBottom: 8}}>Three credentials. Real career doors.</h2>
          <p style={{fontSize: 15, color: '#6b7280', maxWidth: 560, lineHeight: 1.7}}>CompTIA certifications are recognized by employers across every industry. They're not just credentials — they're keys.</p>
          <div className="cert-tracks">
            <div className="cert-track">
              <div className="cert-track-top">
                <div className="cert-track-label">Start Here</div>
                <h3>CompTIA A+</h3>
                <p>220-1101 · 220-1102 · 40 Hours</p>
              </div>
              <div className="cert-track-body">
                <p>The foundation of IT. Covers hardware, networking, operating systems, security, and troubleshooting. Required by most entry-level IT employers and a gateway to every advanced certification.</p>
                <div className="cert-track-jobs">
                  <span className="job-tag">IT Support Specialist</span>
                  <span className="job-tag">Help Desk Tech</span>
                  <span className="job-tag">Field Service Tech</span>
                </div>
              </div>
            </div>
            <div className="cert-track">
              <div className="cert-track-top">
                <div className="cert-track-label">Level Up</div>
                <h3>CompTIA Network+</h3>
                <p>N10-009 · Foundation Networking</p>
              </div>
              <div className="cert-track-body">
                <p>The networking credential. Covers network infrastructure, operations, security, and troubleshooting. Opens doors to network administration and infrastructure roles.</p>
                <div className="cert-track-jobs">
                  <span className="job-tag">Network Admin</span>
                  <span className="job-tag">Systems Administrator</span>
                  <span className="job-tag">IT Manager</span>
                </div>
              </div>
            </div>
            <div className="cert-track">
              <div className="cert-track-top">
                <div className="cert-track-label">High Value</div>
                <h3>CompTIA Security+</h3>
                <p>SY0-701 · Cybersecurity Focus</p>
              </div>
              <div className="cert-track-body">
                <p>The entry point into cybersecurity — one of the fastest-growing and highest-paying fields in tech. DoD-approved and globally recognized. Significantly increases earning potential.</p>
                <div className="cert-track-jobs">
                  <span className="job-tag">Security Analyst</span>
                  <span className="job-tag">SOC Analyst</span>
                  <span className="job-tag">Cybersecurity Specialist</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CURRICULUM PREVIEW */}
      <section className="section section-alt">
        <div className="section-inner">
          <span className="eyebrow">What You'll Cover</span>
          <h2 style={{fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 700, color: '#0D1B2A', marginBottom: 8}}>CompTIA A+ Curriculum — 40 Hours</h2>
          <p style={{fontSize: 15, color: '#6b7280', maxWidth: 560, lineHeight: 1.7}}>The platform displays exact time per topic so you always know what you're committing to before you start.</p>
          <div className="modules-list">
            {[
              {num: '01', title: 'Mobile Devices', time: '270 min'},
              {num: '02', title: 'Networking Fundamentals', time: '300 min'},
              {num: '03', title: 'Hardware', time: '330 min'},
              {num: '04', title: 'Virtualization & Cloud', time: '150 min'},
              {num: '05', title: 'Hardware & Network Troubleshooting', time: '150 min'},
              {num: '06', title: 'Operating Systems', time: '300 min'},
              {num: '07', title: 'Security', time: '300 min'},
              {num: '08', title: 'Software Troubleshooting', time: '300 min'},
              {num: '09', title: 'Operational Procedures', time: '300 min'},
            ].map((m, i) => (
              <div className="module-item" key={i}>
                <div className="module-num">{m.num}</div>
                <div className="module-info">
                  <h5>{m.title}</h5>
                  <span>{m.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FUNDING */}
      <section className="section">
        <div className="section-inner">
          <span className="eyebrow">Funding Options</span>
          <h2 style={{fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 700, color: '#0D1B2A', marginBottom: 8}}>You shouldn't have to pay to change your life.</h2>
          <p style={{fontSize: 15, color: '#6b7280', maxWidth: 560, lineHeight: 1.7}}>We're building multiple funding pathways. Confirmed options will be announced at enrollment launch.</p>
          <div className="funding-row">
            <div className="funding-card">
              <div className="amt">$0</div>
              <h4>WIOA Vouchers</h4>
              <p>Government-funded training for eligible students through CareerSource Florida and state workforce boards. Covers full tuition.</p>
            </div>
            <div className="funding-card">
              <div className="amt">$8,500</div>
              <h4>Private Enrollment</h4>
              <p>Direct pay for students who self-fund or use employer tuition assistance. Includes all three CompTIA tracks.</p>
            </div>
            <div className="funding-card">
              <div className="amt">TBD</div>
              <h4>Scholarship Track</h4>
              <p>Grant-funded scholarships for students who qualify based on income and mission alignment. Details announced at launch.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="it-cta">
        <h2>The platform is built.<br />The audit is happening now.</h2>
        <p>We'll send you a direct notification the moment enrollment is open — no spam, just the one email that matters.</p>
        <Link href="/get-involved" className="btn-blue">Join the Waitlist</Link>
      </section>
    </main>
  );
}
