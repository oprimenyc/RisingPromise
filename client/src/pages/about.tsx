import { Link } from "wouter";

// ─── About / Team Page ────────────────────────────────────────────────────
// Route: /about
// Tone: Personal, direct, honest. Not corporate. These are real people.

export default function About() {
  return (
    <main className="about-page">
      <style>{`
        .about-page {
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
        .about-hero {
          background: linear-gradient(135deg, #0D1B2A 0%, #1e2d45 100%);
          padding: 100px 24px 80px;
          position: relative;
          overflow: hidden;
        }
        .about-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 60% 40%, rgba(201,168,76,0.07) 0%, transparent 65%);
        }
        .about-hero-inner { max-width: 760px; position: relative; }
        .about-hero h1 { font-size: clamp(28px, 5vw, 52px); font-weight: 700; color: #fff; line-height: 1.15; margin-bottom: 20px; }
        .about-hero p { font-size: clamp(15px, 2vw, 18px); color: rgba(255,255,255,0.7); line-height: 1.75; max-width: 620px; }

        /* SECTIONS */
        .section { padding: 80px 24px; }
        .section-inner { max-width: 1000px; margin: 0 auto; }
        .section-alt { background: #f8f9fc; }
        .section-dark { background: #0D1B2A; }
        .section-narrow { max-width: 720px; margin: 0 auto; padding: 80px 24px; }

        /* THE WHY */
        .why-text {
          font-size: clamp(17px, 2.5vw, 22px);
          color: #0D1B2A;
          line-height: 1.85;
          font-weight: 300;
        }
        .why-text strong { font-weight: 700; color: #0D1B2A; }
        .why-text em { font-style: italic; color: #c9a84c; font-weight: 500; }

        /* TEAM CARDS */
        .team-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px;
          margin-top: 48px;
        }
        .team-card {
          background: #fff;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .team-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 36px rgba(0,0,0,0.09);
        }
        .team-card-top {
          background: #0D1B2A;
          padding: 28px 28px 24px;
          position: relative;
          border-bottom: 2px solid #c9a84c;
        }
        .team-avatar {
          width: 64px;
          height: 64px;
          border-radius: 12px;
          background: rgba(201,168,76,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 22px;
          font-weight: 700;
          color: #c9a84c;
          margin-bottom: 14px;
        }
        .team-name { font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 4px; }
        .team-title { font-size: 13px; color: #c9a84c; font-weight: 500; margin-bottom: 3px; }
        .team-cred { font-size: 11px; color: rgba(255,255,255,0.4); font-family: 'DM Mono', monospace; letter-spacing: 0.04em; }
        .team-card-body { padding: 24px 28px 28px; }
        .team-bio { font-size: 14px; color: #4a5568; line-height: 1.75; margin-bottom: 20px; }
        .team-quote {
          padding: 16px 18px;
          background: #f8f9fc;
          border-left: 3px solid #c9a84c;
          border-radius: 0 8px 8px 0;
          font-size: 14px;
          font-style: italic;
          color: #0D1B2A;
          line-height: 1.65;
        }

        /* STRUCTURE */
        .structure-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          margin-top: 40px;
        }
        .structure-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 24px;
        }
        .structure-card .s-label { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; color: #c9a84c; margin-bottom: 8px; }
        .structure-card h4 { font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 4px; }
        .structure-card .s-type { font-size: 11px; color: rgba(255,255,255,0.4); margin-bottom: 12px; font-family: 'DM Mono', monospace; }
        .structure-card p { font-size: 13px; color: rgba(255,255,255,0.6); line-height: 1.7; margin: 0; }

        /* VALUES */
        .values-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px;
          margin-top: 40px;
        }
        .value-card {
          padding: 24px;
          background: #fff;
          border: 1px solid rgba(0,0,0,0.07);
          border-radius: 12px;
          border-top: 3px solid #c9a84c;
        }
        .value-card h4 { font-size: 15px; font-weight: 700; color: #0D1B2A; margin-bottom: 8px; }
        .value-card p { font-size: 13px; color: #6b7280; line-height: 1.65; margin: 0; }

        /* CTA */
        .about-cta { background: #0D1B2A; padding: 72px 24px; text-align: center; }
        .about-cta h2 { font-size: clamp(22px, 4vw, 36px); font-weight: 700; color: #fff; margin-bottom: 16px; }
        .about-cta p { font-size: 16px; color: rgba(255,255,255,0.6); max-width: 500px; margin: 0 auto 32px; line-height: 1.75; }
        .btn-gold { padding: 14px 30px; background: #c9a84c; color: #0D1B2A; font-weight: 700; font-size: 14px; border-radius: 8px; text-decoration: none; transition: background 0.2s; display: inline-block; }
        .btn-gold:hover { background: #e8c97a; }
        .btn-ghost { padding: 14px 30px; background: transparent; color: #c9a84c; font-weight: 600; font-size: 14px; border-radius: 8px; text-decoration: none; border: 1px solid rgba(201,168,76,0.35); margin-left: 12px; display: inline-block; transition: all 0.2s; }
        .btn-ghost:hover { background: rgba(201,168,76,0.08); }

        @media (max-width: 768px) {
          .team-grid { grid-template-columns: 1fr; }
          .structure-grid { grid-template-columns: 1fr; }
          .about-hero { padding: 80px 18px 60px; }
          .section { padding: 56px 18px; }
          .section-narrow { padding: 56px 18px; }
          .btn-ghost { margin-left: 0; margin-top: 12px; display: block; text-align: center; }
        }
      `}</style>

      {/* HERO */}
      <section className="about-hero">
        <div className="about-hero-inner">
          <h1>Built by People<br />Who've Been There.</h1>
          <p>This isn't theory. This is personal. Every person on this team knows what it's like to figure things out without a map, without a safety net, without someone in your corner telling you what's possible. That's exactly why we built Rising Promise.</p>
        </div>
      </section>

      {/* THE STORY */}
      <div className="section-narrow">
        <span className="eyebrow">Our Story</span>
        <div className="why-text">
          <p style={{marginBottom: 24}}>Why do some people get endless chances while others get none? Why does where you're born, who raised you, or one bad break determine the rest of your life?</p>
          <p style={{marginBottom: 24}}>We didn't have a good answer. <em>So we built one.</em></p>
          <p style={{marginBottom: 24}}>Rising Promise was founded on a single conviction: <strong>people don't lack potential — they lack access.</strong> Access to training that leads somewhere real. Access to support when life gets hard. Access to a community that believes in second, third, and hundredth chances.</p>
          <p style={{marginBottom: 24}}>We are not a charity. We are not a safety net. We are a workforce and housing organization built by people who know exactly what it costs to build something from nothing — and who refuse to let that cost fall only on the people who can least afford it.</p>
          <p style={{fontStyle: 'italic', color: '#c9a84c', fontWeight: 500}}>We're here to change that.</p>
        </div>
      </div>

      {/* TEAM */}
      <section className="section section-alt">
        <div className="section-inner">
          <span className="eyebrow">The Team</span>
          <h2 style={{fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 700, color: '#0D1B2A', marginBottom: 8}}>We're not saviors. We're partners.</h2>
          <p style={{fontSize: 15, color: '#6b7280', maxWidth: 560, lineHeight: 1.7}}>Four people with the skills this work actually requires — not four people who thought it sounded like a good cause.</p>
          <div className="team-grid">
            <div className="team-card">
              <div className="team-card-top">
                <div className="team-avatar">JP</div>
                <div className="team-name">Jason Pilgrim</div>
                <div className="team-title">Founder & Executive Director</div>
                <div className="team-cred">15+ yrs · operations · construction · logistics · business development</div>
              </div>
              <div className="team-card-body">
                <p className="team-bio">Jason built Rising Promise from a fundamental conviction: that access to opportunity — not circumstance of birth — should define a person's future. With more than 15 years across environmental services, construction, logistics, and entrepreneurial business development, he designed the organization's three-entity federal contracting and grant ecosystem — positioning Rising Promise to capture grants, government contracts, and earned revenue simultaneously from day one.</p>
                <div className="team-quote">"I've spent my life building things — businesses, systems, solutions. But the most important thing I've ever built is opportunity for people who were told they didn't deserve one."</div>
              </div>
            </div>
            <div className="team-card">
              <div className="team-card-top">
                <div className="team-avatar">SW</div>
                <div className="team-name">Shawn J. Wright, FNP</div>
                <div className="team-title">Program Director</div>
                <div className="team-cred">Family Nurse Practitioner · clinical compliance · CNA program oversight</div>
              </div>
              <div className="team-card-body">
                <p className="team-bio">Shawn is a licensed Family Nurse Practitioner who oversees clinical leadership and healthcare compliance for all of Rising Promise's workforce training programs. His FNP credentials exceed Texas HHSC requirements for CNA program directorship — which means our program doesn't just meet the standard, it's run by someone who surpasses it. His presence makes every WIOA application and state program approval stronger.</p>
                <div className="team-quote">"I became a nurse because I wanted to help people heal. Now I help them build futures."</div>
              </div>
            </div>
            <div className="team-card">
              <div className="team-card-top">
                <div className="team-avatar">MM</div>
                <div className="team-name">Melissa Meeham, MPA</div>
                <div className="team-title">Finance & Administration Director</div>
                <div className="team-cred">Master of Public Administration · 20+ yrs accounting & public admin</div>
              </div>
              <div className="team-card-body">
                <p className="team-bio">Melissa brings more than two decades of accounting and public administration experience to an organization that needs every dollar to land right. Her MPA gives her direct fluency in government procurement, nonprofit fund accounting, and the compliance landscape that comes with federal and foundation funding. She is the financial infrastructure that makes everything else credible.</p>
                <div className="team-quote">"Sound financial management isn't just about numbers — it's about making sure every dollar reaches the people who need it most."</div>
              </div>
            </div>
            <div className="team-card">
              <div className="team-card-top">
                <div className="team-avatar">KR</div>
                <div className="team-name">Kenya Roberts, CFRE</div>
                <div className="team-title">Development & Fundraising Director</div>
                <div className="team-cred">Certified Fund Raising Executive · millions raised · workforce & community focus</div>
              </div>
              <div className="team-card-body">
                <p className="team-bio">A CFRE credential means years of proven results, a code of ethics, and demonstrated experience raising millions for causes that matter. Kenya brings that — along with sector relationships, strategic fundraising instincts, and a genuine belief in what Rising Promise is building. Most nonprofits spend five to ten years developing what she brings to this organization at the founding stage.</p>
                <div className="team-quote">"The most powerful grant application is one where the mission speaks so clearly that the funder sees themselves in the work."</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STRUCTURE */}
      <section className="section section-dark">
        <div className="section-inner">
          <span className="eyebrow" style={{color: '#c9a84c'}}>Our Structure</span>
          <h2 style={{fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 700, color: '#fff', marginBottom: 8}}>Three entities. One mission.</h2>
          <p style={{fontSize: 15, color: 'rgba(255,255,255,0.6)', maxWidth: 560, lineHeight: 1.7}}>Most nonprofits operate in a single funding lane. We built three — each positioned for a different stream of resources, all pointed at the same outcome.</p>
          <div className="structure-grid">
            <div className="structure-card" style={{borderTop: '2px solid #c9a84c'}}>
              <div className="s-label">Entity 01</div>
              <h4>Rising Promise</h4>
              <div className="s-type">Texas 501(c)(3) · Grant Engine</div>
              <p>Workforce training, housing programs, education grants. The mission lives here — and so does the funding strategy built around it.</p>
            </div>
            <div className="structure-card" style={{borderTop: '2px solid rgba(255,255,255,0.2)'}}>
              <div className="s-label">Entity 02</div>
              <h4>Grey Taurus LLC</h4>
              <div className="s-type">Florida LLC · Operations Engine · CAGE Secured</div>
              <p>Federal subcontracting, ALF operations, staffing administration. The operational and contractual infrastructure that delivers on what Rising Promise trains for.</p>
            </div>
            <div className="structure-card" style={{borderTop: '2px solid rgba(255,255,255,0.1)'}}>
              <div className="s-label">Entity 03</div>
              <h4>Waite & Associates</h4>
              <div className="s-type">NY Licensed Broker · Housing Affiliate</div>
              <p>Property sourcing and real estate support for transitional housing and ALF expansion. Adds multi-state footprint to the ecosystem.</p>
            </div>
          </div>
        </div>
      </section>

      {/* NONPROFIT VERIFICATION */}
      <section className="section" style={{ background: '#f8f9fc', textAlign: 'center' }}>
        <div className="section-inner" style={{ maxWidth: 640, margin: '0 auto' }}>
          <span className="eyebrow">Organizational Verification</span>
          <p style={{ fontSize: 15, color: '#4a5568', lineHeight: 1.9 }}>
            Rising Promise is a 501(c)(3) nonprofit organization and the owner and operator of risingpromise.org.
            <br />
            EIN: 37-2202493
            <br />
            Official administrative email:{' '}
            <a href="mailto:admin@risingpromise.org" style={{ color: '#c9a84c', fontWeight: 600 }}>
              admin@risingpromise.org
            </a>
          </p>
        </div>
      </section>

      {/* VALUES */}
      <section className="section">
        <div className="section-inner">
          <span className="eyebrow">What We Stand For</span>
          <h2 style={{fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 700, color: '#0D1B2A', marginBottom: 8}}>These aren't values on a wall.</h2>
          <p style={{fontSize: 15, color: '#6b7280', maxWidth: 560, lineHeight: 1.7}}>They're the things we argue about in meetings because we actually care how we do this.</p>
          <div className="values-grid">
            {[
              {title: 'Honesty Over Hype', desc: 'We don\'t announce programs before they\'re ready. We don\'t promise what we can\'t deliver. We tell you where we are.'},
              {title: 'Access, Not Charity', desc: 'We don\'t help the less fortunate. We remove barriers that were never supposed to exist in the first place.'},
              {title: 'Lived Experience Leads', desc: 'The people building this organization understand the problems it\'s solving — not from research, but from life.'},
              {title: 'Sustainability First', desc: 'Programs that run out of money don\'t help anyone. We build to last, with revenue models that don\'t depend on a single grant.'},
              {title: 'Community, Not Clients', desc: 'The people we serve are not beneficiaries. They\'re members. Participants. Partners. The line is intentional.'},
              {title: 'Radical Transparency', desc: 'Our financials are public. Our status is honest. Our team is real. We don\'t hide behind nonprofit polish.'},
            ].map((v, i) => (
              <div className="value-card" key={i}>
                <h4>{v.title}</h4>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <h2>If this resonates — we want to hear from you.</h2>
        <p>Whether you want to support the mission, partner with us, or just follow along — there's a place for you here.</p>
        <Link href="/get-involved" className="btn-gold">Get Involved</Link>
        <Link href="/programs" className="btn-ghost">See Our Programs</Link>
      </section>
    </main>
  );
}
