import { Link } from "wouter";

// ─── Programs Overview Page ────────────────────────────────────────────────
// Route: /programs
// Voice: Mission-first, emotional, direct. Never corporate.
// Colors: Navy #0D1B2A · Gold #c9a84c · White · Sky blue #1B9CE5

export default function Programs() {
  return (
    <main className="programs-page">
      <style>{`
        .programs-page {
          font-family: 'DM Sans', 'Inter', sans-serif;
          background: #fff;
          color: #1a2035;
        }

        /* ── HERO ── */
        .prog-hero {
          background: linear-gradient(135deg, #0D1B2A 0%, #1e2d45 100%);
          padding: 100px 24px 80px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .prog-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 60% 40%, rgba(201,168,76,0.08) 0%, transparent 70%);
        }
        .prog-hero-eyebrow {
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #c9a84c;
          margin-bottom: 16px;
          font-weight: 500;
          position: relative;
        }
        .prog-hero h1 {
          font-size: clamp(28px, 5vw, 52px);
          font-weight: 700;
          color: #fff;
          line-height: 1.15;
          max-width: 760px;
          margin: 0 auto 20px;
          position: relative;
        }
        .prog-hero p {
          font-size: clamp(15px, 2vw, 18px);
          color: rgba(255,255,255,0.7);
          max-width: 580px;
          margin: 0 auto 36px;
          line-height: 1.7;
          position: relative;
        }
        .prog-hero-note {
          display: inline-block;
          background: rgba(201,168,76,0.15);
          border: 1px solid rgba(201,168,76,0.3);
          border-radius: 8px;
          padding: 12px 22px;
          font-size: 13px;
          color: rgba(255,255,255,0.65);
          position: relative;
        }
        .prog-hero-note strong {
          color: #c9a84c;
        }

        /* ── SECTION WRAPPER ── */
        .prog-section {
          padding: 80px 24px;
          max-width: 1080px;
          margin: 0 auto;
        }
        .prog-section-narrow {
          max-width: 760px;
          margin: 0 auto;
          padding: 64px 24px;
          text-align: center;
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

        /* ── PROGRAM CARDS ── */
        .prog-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
          margin-top: 48px;
        }
        .prog-card {
          background: #fff;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          display: flex;
          flex-direction: column;
          text-decoration: none;
          color: inherit;
        }
        .prog-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.1);
        }
        .prog-card-top {
          background: #0D1B2A;
          padding: 28px 28px 24px;
          position: relative;
        }
        .prog-card-top.gold-accent {
          background: linear-gradient(135deg, #0D1B2A, #1e2d45);
          border-bottom: 3px solid #c9a84c;
        }
        .prog-card-top.blue-accent {
          background: linear-gradient(135deg, #0D1B2A, #0d2a3a);
          border-bottom: 3px solid #1B9CE5;
        }
        .prog-card-top.green-accent {
          background: linear-gradient(135deg, #0D1B2A, #0d2a1e);
          border-bottom: 3px solid #2ecc71;
        }
        .prog-card-icon {
          width: 44px;
          height: 44px;
          background: rgba(201,168,76,0.15);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
          font-size: 20px;
        }
        .prog-card-status {
          position: absolute;
          top: 20px;
          right: 20px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 20px;
        }
        .status-building {
          background: rgba(243,156,18,0.2);
          color: #f39c12;
          border: 1px solid rgba(243,156,18,0.3);
        }
        .status-phase2 {
          background: rgba(201,168,76,0.15);
          color: #c9a84c;
          border: 1px solid rgba(201,168,76,0.25);
        }
        .status-audit {
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.55);
          border: 1px solid rgba(255,255,255,0.12);
        }
        .prog-card-top h3 {
          font-size: 20px;
          font-weight: 700;
          color: #fff;
          margin: 0 0 6px;
          line-height: 1.2;
        }
        .prog-card-top p {
          font-size: 13px;
          color: rgba(255,255,255,0.55);
          margin: 0;
          line-height: 1.5;
        }
        .prog-card-body {
          padding: 24px 28px 28px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .prog-card-body p {
          font-size: 14px;
          color: #4a5568;
          line-height: 1.7;
          margin-bottom: 18px;
          flex: 1;
        }
        .prog-card-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 20px;
        }
        .tag {
          font-size: 11px;
          padding: 4px 10px;
          background: #f0f4f8;
          color: #4a5568;
          border-radius: 20px;
          font-weight: 500;
        }
        .prog-card-link {
          font-size: 13px;
          font-weight: 600;
          color: #0D1B2A;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: gap 0.2s;
        }
        .prog-card:hover .prog-card-link { gap: 10px; }

        /* ── MISSION BRIDGE ── */
        .mission-bridge {
          background: #0D1B2A;
          padding: 72px 24px;
          text-align: center;
        }
        .mission-bridge h2 {
          font-size: clamp(24px, 4vw, 40px);
          color: #fff;
          font-weight: 700;
          max-width: 680px;
          margin: 0 auto 20px;
          line-height: 1.3;
        }
        .mission-bridge p {
          font-size: 16px;
          color: rgba(255,255,255,0.65);
          max-width: 560px;
          margin: 0 auto 36px;
          line-height: 1.75;
        }
        .btn-gold {
          display: inline-block;
          padding: 14px 32px;
          background: #c9a84c;
          color: #0D1B2A;
          font-weight: 700;
          font-size: 14px;
          border-radius: 8px;
          text-decoration: none;
          letter-spacing: 0.03em;
          transition: background 0.2s;
        }
        .btn-gold:hover { background: #e8c97a; }
        .btn-ghost {
          display: inline-block;
          padding: 14px 32px;
          background: transparent;
          color: #c9a84c;
          font-weight: 600;
          font-size: 14px;
          border-radius: 8px;
          text-decoration: none;
          border: 1px solid rgba(201,168,76,0.4);
          margin-left: 12px;
          transition: all 0.2s;
        }
        .btn-ghost:hover { background: rgba(201,168,76,0.08); }

        /* ── PIPELINE ── */
        .pipeline-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
          margin: 48px 0 0;
          position: relative;
        }
        .pipeline-row::before {
          content: '';
          position: absolute;
          top: 28px;
          left: 12.5%;
          right: 12.5%;
          height: 2px;
          background: linear-gradient(90deg, #c9a84c, rgba(201,168,76,0.2));
        }
        .pipeline-step {
          text-align: center;
          padding: 0 16px;
          position: relative;
        }
        .pipeline-dot {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #0D1B2A;
          border: 2px solid #c9a84c;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          font-size: 20px;
          position: relative;
          z-index: 1;
        }
        .pipeline-step h4 {
          font-size: 14px;
          font-weight: 700;
          color: #0D1B2A;
          margin-bottom: 6px;
        }
        .pipeline-step p {
          font-size: 12px;
          color: #6b7280;
          line-height: 1.5;
        }

        /* ── WHO WE SERVE ── */
        .serve-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-top: 40px;
        }
        .serve-card {
          background: #f8f9fc;
          border-radius: 12px;
          padding: 24px;
          border-left: 3px solid #c9a84c;
        }
        .serve-card h4 {
          font-size: 15px;
          font-weight: 700;
          color: #0D1B2A;
          margin-bottom: 6px;
        }
        .serve-card p {
          font-size: 13px;
          color: #6b7280;
          line-height: 1.6;
          margin: 0;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .prog-section { padding: 56px 18px; }
          .pipeline-row { grid-template-columns: 1fr 1fr; gap: 24px; }
          .pipeline-row::before { display: none; }
          .btn-ghost { margin-left: 0; margin-top: 12px; display: block; text-align: center; }
        }
        @media (max-width: 480px) {
          .pipeline-row { grid-template-columns: 1fr; }
          .prog-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section className="prog-hero">
        <p className="prog-hero-eyebrow">What We Do</p>
        <h1>Real Pathways.<br />Real Careers.<br />Real Change.</h1>
        <p>Rising Promise is a government-registered, 501(c)(3) nonprofit creating direct pathways in healthcare, technology, and housing for people who need it most. Every program we run is designed to lead to employment, stability, and economic independence — not just a certificate.</p>
        <div className="prog-hero-note">
          <strong>Honest note:</strong> Our programs are in active development. We don't launch until we're ready to deliver. See where each one stands below.
        </div>
      </section>

      {/* ── MISSION INTRO ── */}
      <section className="prog-section-narrow">
        <p style={{fontSize: 'clamp(16px, 2vw, 19px)', color: '#2d3748', lineHeight: 1.85, marginBottom: 24}}>We built Rising Promise because we know the system wasn't built for everyone. We know what it feels like to have potential and no pathway. We know what it means to work hard and still fall short because the right door was never opened for you.</p>
        <p style={{fontSize: 'clamp(18px, 2.5vw, 22px)', fontWeight: 700, color: '#0D1B2A', marginBottom: 24}}>That ends here.</p>
        <p style={{fontSize: 'clamp(16px, 2vw, 19px)', color: '#2d3748', lineHeight: 1.85}}>Our programs are not charity. They are investments — in your skills, your future, and your family's next chapter. Every credential we offer leads directly to a job. Every support service we provide removes the barrier that was going to stop you from finishing. We don't believe in half-measures.</p>
      </section>

      {/* ── THE PIPELINE ── */}
      <section className="prog-section">
        <span className="eyebrow">How It Works</span>
        <h2 style={{fontSize: 'clamp(22px, 3.5vw, 34px)', fontWeight: 700, color: '#0D1B2A', marginBottom: 8}}>One Organization. One Pathway.</h2>
        <p style={{fontSize: 15, color: '#6b7280', maxWidth: 560, lineHeight: 1.7}}>Most programs hand you a certificate and wish you luck. We stay in the picture — training, placing, and stabilizing all at once.</p>
        <div className="pipeline-row">
          {[
            {icon: '📚', title: 'Train', desc: 'Career-focused certification — online + in-person'},
            {icon: '✅', title: 'Certify', desc: 'Industry-recognized credentials that employers want'},
            {icon: '💼', title: 'Place', desc: 'Job placement support and employer partnerships'},
            {icon: '🏠', title: 'Stabilize', desc: 'Housing support so the job actually sticks'},
          ].map((s, i) => (
            <div className="pipeline-step" key={i}>
              <div className="pipeline-dot">{s.icon}</div>
              <h4>{s.title}</h4>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROGRAM CARDS ── */}
      <section style={{padding: '0 24px 80px', maxWidth: 1080, margin: '0 auto'}}>
        <span className="eyebrow">Current Programs</span>
        <h2 style={{fontSize: 'clamp(22px, 3.5vw, 34px)', fontWeight: 700, color: '#0D1B2A', marginBottom: 8}}>What We're Building</h2>
        <p style={{fontSize: 15, color: '#6b7280', maxWidth: 560, lineHeight: 1.7, marginBottom: 0}}>Each program is designed around what our communities actually need — not what looks good on paper.</p>

        <div className="prog-grid">
          {/* CNA */}
          <Link href="/programs/cna" className="prog-card">
            <div className="prog-card-top gold-accent">
              <div className="prog-card-icon">🏥</div>
              <span className="prog-card-status status-building">In Development</span>
              <h3>The Heart of Healthcare</h3>
              <p>Fast-Track Your Career. Change Someone's Life. Starting With Your Own.</p>
            </div>
            <div className="prog-card-body">
              <p>A fast-track pathway to becoming a Certified Nursing Assistant — built for the single mom who needs a career, not just a paycheck. For the veteran who served this country. For the person who just needs one real opportunity. Hybrid online + in-person. Wraparound support included.</p>
              <div className="prog-card-tags">
                <span className="tag">CNA Certification</span>
                <span className="tag">Hybrid Online + Clinical</span>
                <span className="tag">WIOA Eligible · Up to $8,500</span>
              </div>
              <span className="prog-card-link">Learn more →</span>
            </div>
          </Link>

          {/* CompTIA */}
          <Link href="/programs/it" className="prog-card">
            <div className="prog-card-top blue-accent">
              <div className="prog-card-icon" style={{background: 'rgba(27,156,229,0.15)'}}>💻</div>
              <span className="prog-card-status status-audit">Under Audit</span>
              <h3>Pathways in Technology</h3>
              <p>The Tech Industry Has a Door. We're Opening It for You.</p>
            </div>
            <div className="prog-card-body">
              <p>CompTIA A+, Network+, and Security+ — the entry points employers across every industry are hiring for. No degree required. No prior experience required. Just the willingness to learn and the commitment to show up. Our instructors are career coaches.</p>
              <div className="prog-card-tags">
                <span className="tag">CompTIA A+</span>
                <span className="tag">Network+</span>
                <span className="tag">Security+</span>
                <span className="tag">WIOA Eligible · $7,500–$8,500</span>
              </div>
              <span className="prog-card-link">Learn more →</span>
            </div>
          </Link>

          {/* Housing */}
          <Link href="/programs/housing" className="prog-card">
            <div className="prog-card-top green-accent">
              <div className="prog-card-icon" style={{background: 'rgba(46,204,113,0.15)'}}>🏠</div>
              <span className="prog-card-status status-building">Planning Phase</span>
              <h3>You Can't Build a Career Without a Foundation</h3>
              <p>Workforce Training Meets Housing Stability.</p>
            </div>
            <div className="prog-card-body">
              <p>You cannot focus on a new career if you do not have a safe place to sleep. Rising Promise addresses both sides — workforce development and housing stability — as a single, integrated mission. Transitional housing, ALF staffing pipeline, and foster youth support.</p>
              <div className="prog-card-tags">
                <span className="tag">Transitional Housing</span>
                <span className="tag">Foster Youth 18–24</span>
                <span className="tag">HUD CoC Aligned</span>
              </div>
              <span className="prog-card-link">Learn more →</span>
            </div>
          </Link>

          {/* V.I.A. */}
          <Link href="/via" className="prog-card">
            <div className="prog-card-top" style={{background: 'linear-gradient(135deg, #0D1B2A, #2d1a0d)', borderBottom: '3px solid #c9a84c'}}>
              <div className="prog-card-icon">🎓</div>
              <span className="prog-card-status status-phase2">Phase 2</span>
              <h3>V.I.A. — Vanguard Innovation Academy</h3>
              <p>The Learning Center Built for the Leaders They Haven't Met Yet.</p>
            </div>
            <div className="prog-card-body">
              <p>A high-impact K–8 learning center designed specifically for Black and POC families who refuse to accept that excellence is someone else's birthright. AI-driven curriculum. Gamified mastery system. Florida PEP scholarship accepted directly.</p>
              <div className="prog-card-tags">
                <span className="tag">K–8 Learning Center</span>
                <span className="tag">PEP Scholarship · ~$8,000/yr</span>
                <span className="tag">Florida · Phase 2</span>
              </div>
              <span className="prog-card-link">Learn more →</span>
            </div>
          </Link>
        </div>
      </section>

      {/* ── WHO WE SERVE ── */}
      <section style={{background: '#f8f9fc', padding: '72px 24px'}}>
        <div style={{maxWidth: 1080, margin: '0 auto'}}>
          <span className="eyebrow">Who We See</span>
          <h2 style={{fontSize: 'clamp(22px, 3.5vw, 34px)', fontWeight: 700, color: '#0D1B2A', marginBottom: 8}}>These programs are built for you.</h2>
          <p style={{fontSize: 15, color: '#6b7280', maxWidth: 560, lineHeight: 1.7}}>Not the idea of you. Not a statistic. You — with a real name, a real story, and a future that's still being written.</p>
          <div className="serve-grid">
            {[
              {title: 'Women in Crisis', desc: 'Rebuilding stability through a career that pays and a community that shows up.'},
              {title: 'Veterans', desc: 'You served this country. Now let\'s build something that serves you back.'},
              {title: 'Foster Youth 18–24', desc: 'You aged out of the system. You haven\'t aged out of the opportunity.'},
              {title: 'Career Changers', desc: 'Your past job doesn\'t have to define your next chapter.'},
              {title: 'Returning Citizens', desc: 'A record shouldn\'t be a life sentence. We build pathways, not barriers.'},
              {title: 'Families Seeking Stability', desc: 'One trained, employed adult changes the entire household equation.'},
            ].map((s, i) => (
              <div className="serve-card" key={i}>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── METRICS ── */}
      <section style={{background: '#0D1B2A', padding: '80px 24px'}}>
        <div style={{maxWidth: 1080, margin: '0 auto', textAlign: 'center'}}>
          <span className="eyebrow">The Numbers We Are Building Toward</span>
          <h2 style={{fontSize: 'clamp(22px, 3.5vw, 34px)', fontWeight: 700, color: '#fff', marginBottom: 48}}>Our Year 1 Targets</h2>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32}}>
            {[
              {num: '100+', label: 'Lives Served', note: 'Year 1 Target'},
              {num: '80%+', label: 'Job Placement Rate', note: 'Projected'},
              {num: '$2M+', label: 'Graduate Earnings Impact', note: 'Projected'},
              {num: 'TX · FL · NY', label: 'States Served', note: 'Launch Markets'},
            ].map((m, i) => (
              <div key={i} style={{padding: '28px 16px', borderTop: '2px solid rgba(201,168,76,0.3)'}}>
                <div style={{fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, color: '#c9a84c', fontFamily: "'Playfair Display', serif", lineHeight: 1, marginBottom: 8}}>{m.num}</div>
                <div style={{fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4}}>{m.label}</div>
                <div style={{fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: "'DM Mono', monospace"}}>{m.note}</div>
              </div>
            ))}
          </div>
          <p style={{fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 40, maxWidth: 640, margin: '40px auto 0', lineHeight: 1.7, fontStyle: 'italic'}}>We are transparent about where we are: these are our Year 1 targets, built on industry data, program design, and an unshakeable commitment to accountability.</p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{background: '#f8f9fc', padding: '80px 24px'}}>
        <div style={{maxWidth: 640, margin: '0 auto', textAlign: 'center'}}>
          <span className="eyebrow">Be Part of the Promise</span>
          <h2 style={{fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 700, color: '#0D1B2A', marginBottom: 16}}>Not Sure Which Program Is Right for You?</h2>
          <p style={{fontSize: 16, color: '#4a5568', lineHeight: 1.75, marginBottom: 40}}>You don't have to figure it out alone. Drop your name and email and we will reach out personally to help you find the right pathway. No pressure. No spam. Just a real conversation about your future.</p>
          <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); window.location.href = `/get-involved?name=${encodeURIComponent(fd.get('name') as string)}&email=${encodeURIComponent(fd.get('email') as string)}&interest=${encodeURIComponent(fd.get('interest') as string)}`; }} style={{display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left'}}>
            <input name="name" type="text" placeholder="Your Name" required style={{padding: '14px 16px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 15, outline: 'none'}} />
            <input name="email" type="email" placeholder="Email Address" required style={{padding: '14px 16px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 15, outline: 'none'}} />
            <select name="interest" style={{padding: '14px 16px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 15, color: '#4a5568', outline: 'none', background: '#fff'}}>
              <option value="">What are you most interested in?</option>
              <option value="healthcare">Healthcare (CNA)</option>
              <option value="technology">Technology (CompTIA)</option>
              <option value="housing">Housing Support</option>
              <option value="via">V.I.A. Academy</option>
              <option value="unsure">Not Sure Yet</option>
            </select>
            <button type="submit" style={{padding: '16px 32px', background: '#c9a84c', color: '#0D1B2A', fontWeight: 700, fontSize: 15, borderRadius: 8, border: 'none', cursor: 'pointer', letterSpacing: '0.02em'}}>Start the Conversation</button>
          </form>
        </div>
      </section>

      {/* ── MISSION BRIDGE ── */}
      <section className="mission-bridge">
        <h2>If you show up ready to fight for your future,<br />we will fight with you.</h2>
        <p>Our programs are in active development. Get notified the moment enrollment opens.</p>
        <Link href="/get-involved" className="btn-gold">Get Notified</Link>
      </section>
    </main>
  );
}
