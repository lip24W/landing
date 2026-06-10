import { Link } from 'react-router-dom';

const css = `
  .auth-wrap{min-height:100svh;background:var(--ink);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;position:relative;overflow:hidden}
  .auth-wrap::before{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(900px 600px at 90% -10%,rgba(124,179,66,.06),transparent 55%),radial-gradient(700px 700px at -5% 110%,rgba(139,111,71,.08),transparent 55%)}
  .auth-logo{height:28px;margin-bottom:48px;position:relative;z-index:1}
  .auth-card{background:#1C2020;border:1px solid #2A2E2B;padding:40px;border-radius:2px;width:100%;max-width:420px;position:relative;z-index:1}
  .auth-card .albl{font-size:11px;color:#8C8775;letter-spacing:.18em;text-transform:uppercase;margin-bottom:8px}
  .auth-card h1{font-family:'Unbounded',serif;font-weight:300;font-size:clamp(22px,2vw,28px);color:#F6F3EE;letter-spacing:-.02em;margin-bottom:6px;line-height:1.1}
  .auth-card .asub{font-size:14px;color:#B6B0A2;line-height:1.55;margin-bottom:28px}
  .auth-field{margin-bottom:12px;position:relative}
  .auth-field input{width:100%;padding:16px 18px;background:transparent;border:1px solid #333938;color:#F6F3EE;font-size:15px;border-radius:2px;transition:.25s;outline:none;font-family:inherit}
  .auth-field input:focus{border-color:var(--green)}
  .auth-field input::placeholder{color:#5A5E55}
  .auth-field input.err{border-color:var(--red)}
  .auth-field .field-err{font-size:12px;color:var(--red);margin-top:5px;display:block;line-height:1.4}
  .auth-btn{width:100%;padding:18px;background:var(--green);color:#0A1208;font-weight:700;font-size:15px;border-radius:2px;cursor:pointer;border:0;transition:.25s;margin-top:4px;font-family:inherit}
  .auth-btn:hover{background:#8FCA51}
  .auth-btn:disabled{opacity:.6;cursor:not-allowed}
  .auth-global-err{background:rgba(209,75,58,.12);border:1px solid rgba(209,75,58,.3);padding:12px 14px;border-radius:2px;color:#E88A80;font-size:13px;margin-bottom:16px;line-height:1.4}
  .auth-footer{margin-top:20px;font-size:13px;color:#8C8775;text-align:center;position:relative;z-index:1}
  .auth-footer a{color:#B6B0A2;text-decoration:underline;text-underline-offset:3px;transition:color .2s}
  .auth-footer a:hover{color:#F6F3EE}
`;

export default function AuthLayout({ children, footerText, footerLink, footerLinkText }) {
  return (
    <>
      <style>{css}</style>
      <div className="auth-wrap">
        <Link to="/">
          <img src="/assets/logo.png" alt="ВУДСОКОЛ" className="auth-logo" />
        </Link>
        <div className="auth-card">{children}</div>
        {footerText && (
          <p className="auth-footer">
            {footerText} <Link to={footerLink}>{footerLinkText}</Link>
          </p>
        )}
      </div>
    </>
  );
}
