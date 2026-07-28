import { useEffect } from "react";
import { Link } from "wouter";

// Route: /organization-verification
// Purpose: public, machine- and human-readable confirmation that Rising
// Promise owns and operates risingpromise.org (Google for Nonprofits, etc).

const PAGE_TITLE = "Organization Verification | Rising Promise";
const PAGE_DESCRIPTION =
  "Official organization and domain verification information for Rising Promise, a 501(c)(3) nonprofit operating risingpromise.org.";

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "NGO",
  name: "Rising Promise",
  url: "https://risingpromise.org",
  email: "admin@risingpromise.org",
  telephone: "+1-888-981-4668",
  taxID: "37-2202493",
};

export default function OrganizationVerification() {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = PAGE_TITLE;

    const metaDescription = document.querySelector('meta[name="description"]');
    const prevDescription = metaDescription?.getAttribute("content") ?? null;
    metaDescription?.setAttribute("content", PAGE_DESCRIPTION);

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(JSON_LD);
    script.setAttribute("data-org-verification-jsonld", "true");
    document.head.appendChild(script);

    return () => {
      document.title = prevTitle;
      if (prevDescription !== null) {
        metaDescription?.setAttribute("content", prevDescription);
      }
      script.remove();
    };
  }, []);

  return (
    <main className="org-verification-page">
      <style>{`
        .org-verification-page {
          font-family: 'DM Sans', 'Inter', sans-serif;
          background: #fff;
          color: #1a2035;
          min-height: 60vh;
        }
        .ov-hero {
          background: linear-gradient(135deg, #0D1B2A 0%, #1e2d45 100%);
          padding: 100px 24px 72px;
        }
        .ov-hero-inner { max-width: 720px; margin: 0 auto; }
        .ov-eyebrow {
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #c9a84c;
          font-weight: 600;
          margin-bottom: 12px;
          display: block;
        }
        .ov-hero h1 { font-size: clamp(26px, 4.5vw, 44px); font-weight: 700; color: #fff; line-height: 1.2; margin-bottom: 16px; }
        .ov-hero p { font-size: clamp(15px, 2vw, 17px); color: rgba(255,255,255,0.75); line-height: 1.75; }

        .ov-section { padding: 64px 24px; }
        .ov-section-inner { max-width: 720px; margin: 0 auto; }

        .ov-details {
          display: grid;
          gap: 0;
          margin-top: 8px;
        }
        .ov-detail-row {
          border-bottom: 1px solid rgba(0,0,0,0.08);
          color: #1a2035;
          font-size: 15px;
          line-height: 1.6;
          padding: 16px 12px;
        }
        .ov-detail-row:last-child { border-bottom: none; }
        .ov-detail-row strong { color: #6b7280; font-weight: 600; }
        .ov-detail-row a { color: #c9a84c; font-weight: 600; text-decoration: none; }
        .ov-detail-row a:hover { text-decoration: underline; }

        .ov-confirm {
          margin-top: 40px;
          padding: 24px;
          background: #f8f9fc;
          border-left: 3px solid #c9a84c;
          border-radius: 0 8px 8px 0;
          font-size: 15px;
          color: #4a5568;
          line-height: 1.8;
        }
        .ov-footer {
          background: #0D1B2A;
          color: rgba(255,255,255,0.68);
          padding: 28px 24px;
          text-align: center;
          font-size: 13px;
          line-height: 1.7;
        }
        .ov-footer a { color: #c9a84c; font-weight: 600; text-decoration: none; }
        .ov-footer a:hover { text-decoration: underline; }

        @media (max-width: 640px) {
          .ov-hero { padding: 72px 18px 56px; }
          .ov-section { padding: 48px 18px; }
          .ov-detail-row { padding: 12px 8px; font-size: 14px; }
        }
      `}</style>

      <section className="ov-hero">
        <div className="ov-hero-inner">
          <span className="ov-eyebrow">Organization Verification</span>
          <h1>Organization Verification</h1>
          <p>Rising Promise is a nonprofit organization operating through the official domain risingpromise.org.</p>
        </div>
      </section>

      <section className="ov-section">
        <div className="ov-section-inner">
          <div className="ov-details" aria-label="Official organization details">
            <div className="ov-detail-row">
              <strong>Legal organization name:</strong> Rising Promise
            </div>
            <div className="ov-detail-row">
              <strong>Federal tax-exempt status:</strong> 501(c)(3)
            </div>
            <div className="ov-detail-row">
              <strong>Employer Identification Number:</strong> 37-2202493
            </div>
            <div className="ov-detail-row">
              <strong>Official website:</strong>{" "}
              <a href="https://risingpromise.org">https://risingpromise.org</a>
            </div>
            <div className="ov-detail-row">
              <strong>Official administrative email:</strong>{" "}
              <a href="mailto:admin@risingpromise.org">admin@risingpromise.org</a>
            </div>
            <div className="ov-detail-row">
              <strong>Official phone:</strong>{" "}
              <a href="tel:+18889814668">+1 (888) 981-4668</a>
            </div>
          </div>

          <p style={{ fontSize: 15, color: "#4a5568", lineHeight: 1.8, marginTop: 32 }}>
            Rising Promise provides programs and services focused on sustainable housing, workforce
            training, education, and wraparound support for individuals and communities.
          </p>

          <div className="ov-confirm">
            This page confirms that risingpromise.org is owned, controlled, and officially used by
            Rising Promise.
          </div>

          <p style={{ marginTop: 32 }}>
            <Link href="/about" style={{ color: "#c9a84c", fontWeight: 600, textDecoration: "none" }}>
              Back to About
            </Link>
          </p>
        </div>
      </section>

      <footer className="ov-footer">
        <p>Rising Promise is a 501(c)(3) nonprofit organization.</p>
        <p>EIN: 37-2202493</p>
        <p>
          <Link href="/organization-verification">Organization Verification</Link>
        </p>
      </footer>
    </main>
  );
}
