import { Link } from "wouter";

// ─── Workforce Housing & ALF Pipeline Page ────────────────────────────────
// Route: /programs/housing

export default function ProgramHousing() {
  return (
    <main className="housing-page">
      <style>{`
        .housing-page {
          font-family: 'DM Sans', 'Inter', sans-serif;
          background: #fff;
          color: #1a2035;
        }
        .eyebrow {
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #2ecc71;
          font-weight: 600;
          margin-bottom: 12px;
          display: block;
        }

        /* HERO */
        .housing-hero {
          background: linear-gradient(135deg, #0D1B2A 0%, #0d2a1e 100%);
          padding: 100px 24px 80px;
          position: relative;
          overflow: hidden;
        }
        .housing-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 65% 30%, rgba(46,204,113,0.07) 0%, transparent 65%);
        }
        .housing-hero-inner { max-width: 760px; position: relative; }
        .housing-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(46,204,113,0.12);
          border: 1px solid rgba(46,204,113,0.25);
          border-radius: 20px;
          padding: 6px 14px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #2ecc71;
          margin-bottom: 20px;
        }
        .housing-hero h1 { font-size: clamp(28px, 5vw, 50px); font-weight: 700; color: #fff; line-height: 1.15; margin-bottom: 8px; }
        .housing-hero h2 { font-size: clamp(14px, 2vw, 18px); font-weight: 400; color: rgba(255,255,255,0.55); margin-bottom: 20px; }
        .housing-hero p { font-size: clamp(15px, 2vw, 17px); color: rgba(255,255,255,0.7); line-height: 1.75; max-width: 580px; margin-bottom: 32px; }
        .btn-green {
          padding: 14px 30px;
          background: #2ecc71;
          color: #0D1B2A;
          font-weight: 700;
          font-size: 14px;
          border-radius: 8px;
          text-decoration: none;
          transition: background 0.2s;
          display: inline-block;
        }
        .btn-green:hover { background: #3dd88a; }
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

        .section { padding: 72px 24px; }
        .section-inner { max-width: 1000px; margin: 0 auto; }
        .section-alt { background: #f8f9fc; }
        .section-dark { background: #0D1B2A; }

        /* STATUS */
        .status-banner {
          background: rgba(243,156,18,0.07);
          border: 1px solid rgba(243,156,18,0.22);
          border-radius: 12px;
          padding: 20px 24px;
          display: flex;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 48px;
        }
        .status-banner h4 { font-size: 14px; font-weight: 700; color: #f39c12; margin-bottom: 4px; }
        .status-banner p { font-size: 13px; color: #6b7280; line-height: 1.6; margin: 0; }

        /* ECOSYSTEM */
        .eco-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-top: 40px;
        }
        .eco-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 28px;
          position: relative;
        }
        .eco-label { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; color: #c9a84c; margin-bottom: 8px; }
        .eco-entity { font-size: 17px; font-weight: 700; color: #fff; margin-bottom: 4px; }
        .eco-role { font-size: 12px; color: rgba(255,255,255,0.45); margin-bottom: 14px; }
        .eco-card p { font-size: 13px; color: rgba(255,255,255,0.6); line-height: 1.7; margin: 0; }
        .eco-arrow {
          display: none;
        }

        /* HOUSING TYPES */
        .housing-types {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-top: 40px;
        }
        .housing-type {
          background: #fff;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.05);
        }
        .housing-type-top {
          background: #0D1B2A;
          padding: 22px 24px;
          border-bottom: 2px solid #2ecc71;
        }
        .housing-type-top h3 { font-size: 17px; font-weight: 700; color: #fff; margin: 0 0 4px; }
        .housing-type-top p { font-size: 12px; color: rgba(255,255,255,0.5); margin: 0; }
        .housing-type-body { padding: 22px 24px; }
        .housing-type-body p { font-size: 14px; color: #4a5568; line-height: 1.7; margin-bottom: 14px; }
        .revenue-note {
          background: rgba(46,204,113,0.08);
          border: 1px solid rgba(46,204,113,0.2);
          border-radius: 8px;
          padding: 12px 14px;
          font-size: 13px;
          color: #1a6b3f;
        }
        .revenue-note strong { color: #2ecc71; }

        /* ALF MODEL */
        .alf-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-top: 36px;
        }
        .alf-stat {
          text-align: center;
          padding: 20px 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
        }
        .alf-num { font-size: 28px; font-weight: 700; color: #2ecc71; font-family: 'Playfair Display', serif; line-height: 1; margin-bottom: 4px; }
        .alf-label { font-size: 11px; color: rgba(255,255,255,0.5); line-height: 1.4; }

        /* FUNDING SOURCES */
        .funding-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 14px;
          margin-top: 36px;
        }
        .funding-item {
          background: #fff;
          border: 1px solid rgba(0,0,0,0.07);
          border-radius: 10px;
          padding: 18px 20px;
          border-left: 3px solid #2ecc71;
        }
        .funding-item h4 { font-size: 14px; font-weight: 700; color: #0D1B2A; margin-bottom: 4px; }
        .funding-item p { font-size: 13px; color: #6b7280; margin: 0; line-height: 1.5; }

        /* CTA */
        .housing-cta { background: linear-gradient(135deg, #0D1B2A, #0d2a1e); padding: 72px 24px; text-align: center; }
        .housing-cta h2 { font-size: clamp(22px, 4vw, 36px); font-weight: 700; color: #fff; margin-bottom: 16px; }
        .housing-cta p { font-size: 16px; color: rgba(255,255,255,0.6); max-width: 500px; margin: 0 auto 32px; line-height: 1.75; }

        @media (max-width: 768px) {
          .eco-grid { grid-template-columns: 1fr; }
          .housing-types { grid-template-columns: 1fr; }
          .alf-stats { grid-template-columns: 1fr 1fr; }
          .housing-hero { padding: 80px 18px 60px; }
          .section { padding: 56px 18px; }
          .btn-outline { margin-left: 0; margin-top: 12px; display: block; text-align: center; }
        }
        @media (max-width: 480px) {
          .alf-stats { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* HERO */}
      <section className="housing-hero">
        <div className="housing-hero-inner">
          <div className="housing-hero-badge">🏠 Planning Phase</div>
          <h1>Workforce Housing</h1>
          <h2>Transitional Housing · Assisted Living Facility Pipeline</h2>
          <p>A career without stable housing doesn't stick. We're building the housing infrastructure that makes our workforce programs work — connecting trained graduates directly to the facilities and homes that need them.</p>
          <Link href="/get-involved" className="btn-green">Stay Updated</Link>
          <Link href="/programs" className="btn-outline">← All Programs</Link>
        </div>
      </section>

      {/* STATUS */}
      <section className="section">
        <div className="section-inner">
          <div className="status-banner">
            <span style={{fontSize: 20, flexShrink: 0, marginTop: 2}}>📋</span>
            <div>
              <h4>Planning Phase</h4>
              <p>Housing operations require our CNA and workforce programs to be running first — we need trained staff before we can operate facilities. We're actively identifying Option A opportunities (existing licensed ALF shells to lease) while we build toward Phase 2 launch. Partners, property owners, and caseworkers: we want to hear from you.</p>
            </div>
          </div>

          <span className="eyebrow">Why Housing Is Part of the Mission</span>
          <h2 style={{fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 700, color: '#0D1B2A', marginBottom: 8}}>A job isn't enough if you don't have a roof.</h2>
          <p style={{fontSize: 15, color: '#6b7280', maxWidth: 620, lineHeight: 1.75}}>Most workforce programs stop at job placement. We don't. We know that a single mom who just got certified as a CNA can lose that job in week three if she loses her housing in week two. So we built housing into the model from the start. Train them. Place them. Stabilize them. That's how real change works.</p>
        </div>
      </section>

      {/* 3-ENTITY ECOSYSTEM */}
      <section className="section section-dark">
        <div className="section-inner">
          <span className="eyebrow" style={{color: '#c9a84c'}}>The Ecosystem</span>
          <h2 style={{fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 700, color: '#fff', marginBottom: 8}}>Three entities. One pipeline.</h2>
          <p style={{fontSize: 15, color: 'rgba(255,255,255,0.6)', maxWidth: 560, lineHeight: 1.7}}>No other nonprofit at our stage operates this way. Rising Promise trains the workforce. Grey Taurus operates the facilities. Waite & Associates sources the properties. It's a closed loop.</p>
          <div className="eco-grid">
            <div className="eco-card" style={{borderTop: '2px solid #c9a84c'}}>
              <div className="eco-label">Rising Promise</div>
              <div className="eco-entity">The Training Engine</div>
              <div className="eco-role">Texas 501(c)(3) Nonprofit</div>
              <p>Trains the CNA and DSP workforce. Places graduates into Grey Taurus-operated facilities. Applies for housing grants and federal workforce funding.</p>
            </div>
            <div className="eco-card" style={{borderTop: '2px solid #2ecc71'}}>
              <div className="eco-label">Grey Taurus LLC</div>
              <div className="eco-entity">The Operations Engine</div>
              <div className="eco-role">Florida LLC · CAGE Secured</div>
              <p>Operates transitional homes and assisted living facilities. Employs trained graduates. Manages staffing, scheduling, and facility administration.</p>
            </div>
            <div className="eco-card" style={{borderTop: '2px solid #1B9CE5'}}>
              <div className="eco-label">Waite & Associates</div>
              <div className="eco-entity">The Property Engine</div>
              <div className="eco-role">NY Licensed Broker · Affiliate</div>
              <p>Sources and sources residential properties and ALF shells. Supports lease negotiation and real estate acquisition for housing program expansion.</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOUSING TYPES */}
      <section className="section">
        <div className="section-inner">
          <span className="eyebrow">Two Housing Tracks</span>
          <h2 style={{fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 700, color: '#0D1B2A', marginBottom: 8}}>Start with transitional. Scale to assisted living.</h2>
          <div className="housing-types">
            <div className="housing-type">
              <div className="housing-type-top">
                <h3>Transitional Workforce Housing</h3>
                <p>Phase 1 · Lowest regulatory barrier · Fastest path to residents</p>
              </div>
              <div className="housing-type-body">
                <p>4–6 bedroom homes leased for workforce trainees and low-maintenance adults. Provides stable housing while graduates complete training and establish themselves in new jobs. Lowest licensing requirements, fastest to open.</p>
                <div className="revenue-note">Target residents: workforce trainees, program graduates, veterans, adults in career transition. HUD Continuum of Care funding alignment.</div>
              </div>
            </div>
            <div className="housing-type">
              <div className="housing-type-top">
                <h3>Assisted Living Pipeline</h3>
                <p>Phase 2 · Option A Takeover Strategy · AHCA Licensed</p>
              </div>
              <div className="housing-type-body">
                <p>Rather than building new facilities (9–14 months, $500K+), we target existing licensed ALF shells via the AHCA Closed Provider database — leasing from retiring or struggling operators via the Change of Ownership (CHOW) process. Operational within 2–4 weeks of lease execution.</p>
                <div className="revenue-note">Revenue model: 6 residents × $1,800 Medicaid = <strong>$10,800/month</strong> per house. Net profit after operations: $2,000–$5,000/house.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ALF STATS */}
      <section className="section section-dark">
        <div className="section-inner">
          <span className="eyebrow" style={{color: '#2ecc71'}}>The Numbers</span>
          <h2 style={{fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 700, color: '#fff', marginBottom: 8}}>Why the math works.</h2>
          <p style={{fontSize: 15, color: 'rgba(255,255,255,0.6)', maxWidth: 560, lineHeight: 1.7}}>Option A takeover vs. building from scratch.</p>
          <div className="alf-stats">
            {[
              {num: '$67K', label: 'Minimum startup cost · Option A takeover'},
              {num: '$500K+', label: 'Cost of building a new ALF from scratch'},
              {num: '2–4 wks', label: 'Time to operational · CHOW process'},
              {num: '$10,800', label: 'Monthly Medicaid revenue · 6-bed house'},
            ].map((s, i) => (
              <div className="alf-stat" key={i}>
                <div className="alf-num">{s.num}</div>
                <div className="alf-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FUNDING */}
      <section className="section section-alt">
        <div className="section-inner">
          <span className="eyebrow">Funding Alignment</span>
          <h2 style={{fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 700, color: '#0D1B2A', marginBottom: 8}}>Multiple funding lanes for housing programs.</h2>
          <div className="funding-list">
            {[
              {title: 'Medicaid Waiver', desc: '$1,400–$2,100/resident/month for qualifying ALF residents. Primary revenue for assisted living operations.'},
              {title: 'HUD Continuum of Care', desc: 'Federal funding for transitional housing serving homeless and workforce-transition populations.'},
              {title: 'CDBG — Community Dev Block Grant', desc: 'Housing rehabilitation and community development funding through HUD.'},
              {title: 'State Housing Grants', desc: 'Florida and Texas state housing funds aligned with workforce and disability housing programs.'},
              {title: 'DOL Workforce Housing', desc: 'Department of Labor funding for housing assistance as a supportive service to workforce trainees.'},
              {title: 'Foundation Grants', desc: 'Hilton Foundation, Kresge Foundation, and housing-focused foundations targeting transitional and ALF programs.'},
            ].map((f, i) => (
              <div className="funding-item" key={i}>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="housing-cta">
        <h2>Interested in partnering with us?</h2>
        <p>We're actively looking for property owners, caseworkers, clinical site partners, and employers ready to work with our trained graduates. Let's build this together.</p>
        <Link href="/get-involved" className="btn-green">Get in Touch</Link>
      </section>
    </main>
  );
}
