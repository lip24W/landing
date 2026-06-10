import { useEffect, useRef, useState } from 'react';
import { createLead } from '../api/leads';
import { getProjects } from '../api/projects';
import { getPortfolio } from '../api/portfolio';

/* ── DATA ── */
const MAT_PHOTOS = ['/assets/matnew-1.jpg', '/assets/matnew-2.jpg', '/assets/matnew-3.jpg', '/assets/matnew-4.jpg'];

/* ── HELPERS ── */
const declineBed = (n) => n === 1 ? '1 спальня' : n >= 2 && n <= 4 ? `${n} спальни` : `${n} спален`;
const declineBath = (n) => n === 1 ? '1 санузел' : n >= 2 && n <= 4 ? `${n} санузла` : `${n} санузлов`;
const declineFloors = (n) => n === 1 ? '1 этаж' : n === 2 ? '2 этажа' : `${n} этажей`;

function maskPhone(value) {
  let d = value.replace(/\D/g, '');
  if (d.startsWith('8')) d = '7' + d.slice(1);
  if (!d.startsWith('7')) d = '7' + d;
  d = d.slice(0, 11);
  let o = '+7';
  if (d.length > 1) o += ' (' + d.slice(1, 4);
  if (d.length >= 5) o += ') ' + d.slice(4, 7);
  if (d.length >= 8) o += '-' + d.slice(7, 9);
  if (d.length >= 10) o += '-' + d.slice(9, 11);
  return o;
}

/* ── FORM COMPONENT ── */
function LeadForm({ dark = false, onSuccess, subject = '' }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneErr, setPhoneErr] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [serverErr, setServerErr] = useState(false);

  const handlePhone = (e) => {
    if (!phone && e.target.value === '') { setPhone('+7 ('); return; }
    setPhone(maskPhone(e.target.value));
    setPhoneErr(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 11) { setPhoneErr(true); return; }
    setSending(true);
    setServerErr(false);
    try {
      await createLead({ name, phone, subject: subject || undefined });
      setDone(true);
      onSuccess?.();
    } catch {
      setServerErr(true);
    } finally {
      setSending(false);
    }
  };

  const tc = dark ? '#F6F3EE' : 'var(--ink)';
  const sc = dark ? '#B6B0A2' : 'var(--muted)';

  if (done) return (
    <div style={{ textAlign: 'center', padding: '36px 0' }}>
      <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--green)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A1208' }}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 11l4 4 8-8"/></svg>
      </div>
      <div style={{ fontFamily: 'Unbounded', fontSize: 20, fontWeight: 300, color: tc, marginBottom: 8 }}>Заявка принята</div>
      <p style={{ color: sc, fontSize: 14, lineHeight: 1.55, maxWidth: '28ch', margin: '0 auto' }}>Перезвоним в течение часа. Спасибо, что выбрали ВУДСОКОЛ.</p>
    </div>
  );

  const inputStyle = (err) => ({
    width: '100%', padding: '16px 18px',
    background: 'transparent',
    border: `1px solid ${err ? '#D14B3A' : dark ? '#333938' : 'var(--line)'}`,
    color: dark ? '#F6F3EE' : 'var(--ink)',
    fontSize: 15, borderRadius: 2, transition: '.25s',
    outline: 'none', marginBottom: 12,
  });

  return (
    <form onSubmit={submit}>
      <input type="text" placeholder="Ваше имя" value={name} onChange={e => setName(e.target.value)} style={inputStyle(false)} />
      <input
        type="tel"
        placeholder="+7 (___) ___-__-__"
        value={phone}
        onFocus={e => { if (!phone) setPhone('+7 ('); }}
        onChange={handlePhone}
        required
        style={inputStyle(phoneErr)}
      />
      <button
        type="submit"
        disabled={sending}
        style={{ width: '100%', padding: 18, background: dark ? 'var(--green)' : 'var(--ink)', color: dark ? '#0A1208' : 'var(--bg)', fontWeight: 700, fontSize: 15, borderRadius: 2, cursor: 'pointer', border: 0, transition: '.25s', opacity: sending ? .7 : 1 }}
      >
        {sending ? 'Отправляем…' : 'Оставить заявку'}
      </button>
      {serverErr && (
        <p style={{ color: 'var(--red)', fontSize: 13, marginTop: 8, lineHeight: 1.4 }}>
          Не удалось отправить. Позвоните нам: <a href="tel:+79215941712" style={{ color: 'inherit' }}>+7 921 594-17-12</a>
        </p>
      )}
      <p style={{ fontSize: 11, color: dark ? '#5A5E55' : 'var(--muted)', lineHeight: 1.55, marginTop: 12 }}>
        Нажимая кнопку, вы соглашаетесь с <a href="#" style={{ color: dark ? '#8C8775' : 'var(--ink-s)', textDecoration: 'underline', textDecorationColor: dark ? '#3A3F3B' : undefined }}>политикой обработки персональных данных</a>
      </p>
    </form>
  );
}

/* ── MAIN COMPONENT ── */
export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [mobOpen, setMobOpen] = useState(false);
  const [plansModal, setPlansModal] = useState(null);
  const [inqModal, setInqModal] = useState(null);
  const [lb, setLb] = useState(null); // { photos: [], idx: 0 }
  const [projects, setProjects] = useState([]);
  const [gallery, setGallery] = useState([]);
  const headerRef = useRef(null);

  useEffect(() => {
    getProjects().then(r => setProjects(r.data)).catch(() => {});
    getPortfolio().then(r => setGallery(r.data)).catch(() => {});
  }, []);

  /* scroll header */
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 6);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  /* lock body when mob nav or lightbox open */
  useEffect(() => {
    document.body.style.overflow = (mobOpen || lb) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobOpen, lb]);

  /* IntersectionObserver for .reveal — re-runs when data loads */
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }),
      { threshold: 0.09 }
    );
    document.querySelectorAll('.reveal:not(.in)').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [projects, gallery]);

  /* ESC closes everything */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') { setMobOpen(false); setPlansModal(null); setInqModal(null); setLb(null); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  /* lightbox nav */
  useEffect(() => {
    if (!lb) return;
    const handler = (e) => {
      if (e.key === 'ArrowLeft') setLb(p => ({ ...p, idx: (p.idx - 1 + p.photos.length) % p.photos.length }));
      if (e.key === 'ArrowRight') setLb(p => ({ ...p, idx: (p.idx + 1) % p.photos.length }));
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [lb]);

  const openInq = (title) => setInqModal(title || 'Обсудить проект');
  const openLB = (photos, idx) => setLb({ photos, idx });
  const lbGo = (d) => setLb(p => ({ ...p, idx: (p.idx + d + p.photos.length) % p.photos.length }));

  /* sorted projects */
  const sortedProjects = [...projects].sort((a, b) => b.area - a.area);

  const css = `
    .container{max-width:1320px;margin:0 auto;padding:0 48px}
    @media(max-width:768px){.container{padding:0 20px}}
    section{padding:96px 0}
    @media(max-width:768px){section{padding:64px 0}}
    h1,h2{font-family:'Unbounded',serif;font-weight:300;letter-spacing:-.02em;line-height:1.05}
    h3{font-family:'Unbounded',serif;font-weight:400;letter-spacing:-.01em;line-height:1.1}
    h1{font-size:clamp(30px,5vw,72px)}
    h2{font-size:clamp(24px,3.2vw,52px)}
    h3{font-size:clamp(16px,1.8vw,22px)}
    p{color:var(--ink-s);line-height:1.62}
    .eyebrow{font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:var(--muted);font-weight:500;display:inline-flex;align-items:center;gap:10px}
    .eyebrow::before{content:"";width:24px;height:1px;background:currentColor}
    .btn{display:inline-flex;align-items:center;gap:10px;padding:16px 28px;border-radius:999px;font-weight:500;font-size:15px;transition:.25s ease;border:1px solid transparent;white-space:nowrap}
    .btn-primary{background:var(--ink);color:var(--bg)}
    .btn-primary:hover{background:#000;transform:translateY(-1px)}
    .btn-ghost{border-color:rgba(255,255,255,.28);color:#F6F3EE}
    .btn-ghost:hover{border-color:rgba(255,255,255,.6)}
    .btn-outline{border-color:var(--line);color:var(--ink)}
    .btn-outline:hover{border-color:var(--ink)}
    .btn-green{background:var(--green);color:#0A1208;font-weight:700}
    .btn-green:hover{background:#8FCA51;transform:translateY(-1px)}
    .btn svg{width:16px;height:16px;flex-shrink:0;transition:transform .3s}
    .btn:hover svg{transform:translateX(3px)}
    .section-head{display:grid;grid-template-columns:1fr 1.2fr;gap:48px;align-items:end;margin-bottom:56px}
    @media(max-width:900px){.section-head{grid-template-columns:1fr;gap:20px;margin-bottom:40px}}
    .section-lead{font-size:18px;color:var(--ink-s);line-height:1.62;max-width:50ch}
    .reveal{opacity:0;transform:translateY(22px);transition:opacity .75s ease,transform .75s cubic-bezier(.2,.7,.2,1)}
    .reveal.in{opacity:1;transform:none}
    /* HEADER */
    header{position:sticky;top:0;z-index:40;background:rgba(246,243,238,.88);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border-bottom:1px solid transparent;transition:.3s}
    header.scrolled{border-color:var(--line-s)}
    .nav{display:flex;align-items:center;justify-content:space-between;height:72px;gap:24px}
    .nav-logo{height:26px;width:auto}
    .nav-links{display:flex;gap:28px;font-size:14px;color:var(--ink-s)}
    .nav-links a{transition:color .2s}.nav-links a:hover{color:var(--ink)}
    .nav-right{display:flex;align-items:center;gap:20px}
    .nav-phone{font-size:15px;font-weight:600;color:var(--ink);letter-spacing:.01em;transition:color .2s}
    .nav-phone:hover{color:var(--green-d)}
    @media(max-width:960px){.nav-links{display:none}}
    @media(max-width:600px){.nav-phone{display:none}.nav-right .btn:not(.burger){display:none}}
    /* BURGER */
    .burger{display:none;flex-direction:column;justify-content:center;gap:5px;width:40px;height:40px;cursor:pointer;flex-shrink:0;background:none;border:0;padding:8px}
    .burger span{width:22px;height:1.5px;background:var(--ink);transition:.3s;display:block;margin:0 auto}
    .burger.open span:nth-child(1){transform:translateY(6.5px) rotate(45deg)}
    .burger.open span:nth-child(2){opacity:0}
    .burger.open span:nth-child(3){transform:translateY(-6.5px) rotate(-45deg)}
    @media(max-width:960px){.burger{display:flex}}
    /* MOB NAV */
    .mob-overlay{position:fixed;inset:0;background:rgba(15,18,15,.5);z-index:38;opacity:0;pointer-events:none;transition:.35s}
    .mob-overlay.open{opacity:1;pointer-events:auto}
    .mob-nav{position:fixed;top:0;right:0;bottom:0;width:min(360px,85vw);background:var(--bg);z-index:39;padding:88px 32px 40px;display:flex;flex-direction:column;transform:translateX(110%);transition:transform .4s cubic-bezier(.2,.7,.2,1);overflow-y:auto;border-left:1px solid var(--line-s)}
    .mob-nav.open{transform:none}
    .mob-nav a{font-size:20px;font-family:'Unbounded',serif;font-weight:300;color:var(--ink);padding:14px 0;border-bottom:1px solid var(--line-s);display:block;transition:color .2s}
    .mob-nav a:hover{color:var(--green-d)}
    .mob-phone{font-size:17px;font-weight:600;margin-top:28px;display:block;color:var(--ink)}
    .mob-cta{margin-top:16px;width:100%;justify-content:center}
    /* HERO */
    .hero{position:relative;height:100svh;min-height:640px;max-height:1080px;display:flex;flex-direction:column;overflow:hidden;padding:0}
    .hero-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 30%}
    .hero-overlay{position:absolute;inset:0;background:linear-gradient(105deg,rgba(12,16,12,.82) 38%,rgba(12,16,12,.12) 100%)}
    .hero-content{position:relative;z-index:1;width:100%;padding-top:96px;padding-bottom:56px;margin-top:auto}
    @media(max-width:768px){.hero-content{margin-top:0;padding-top:16px;padding-bottom:48px}}
    .hero h1{color:#F6F3EE;max-width:18ch;margin:20px 0 22px;line-height:1.08}
    .hero h1 em{font-style:normal;color:var(--green)}
    .hero-sub{font-size:clamp(15px,1.5vw,19px);color:rgba(246,243,238,.75);max-width:50ch;line-height:1.6}
    .hero-actions{display:flex;gap:12px;margin-top:36px;flex-wrap:wrap}
    @media(max-width:640px){.hero-actions{flex-direction:column}.hero-actions .btn{width:100%;justify-content:center;box-sizing:border-box;max-width:100%}}
    .hero-stats{margin-top:56px;padding-top:32px;border-top:1px solid rgba(255,255,255,.1);display:grid;grid-template-columns:repeat(4,1fr);gap:0}
    @media(max-width:580px){.hero-stats{grid-template-columns:repeat(2,1fr);gap:24px 0}}
    .hstat .v{font-family:'Unbounded';font-size:clamp(22px,2.5vw,34px);font-weight:300;color:#F6F3EE;letter-spacing:-.02em}
    .hstat .l{font-size:11px;color:rgba(246,243,238,.45);text-transform:uppercase;letter-spacing:.12em;margin-top:5px}
    /* QUOTE */
    .quote-sec{background:var(--ink);padding:96px 0}
    .quote-inner{max-width:860px;margin:0 auto;text-align:center}
    .quote-text{font-family:'Unbounded';font-size:clamp(20px,3vw,38px);font-weight:300;color:#F6F3EE;line-height:1.28;letter-spacing:-.025em;text-wrap:balance}
    .quote-text::before{content:'“';color:var(--green)}
    .quote-text::after{content:'”';color:var(--green)}
    /* ABOUT FEATURES */
    .about-features{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:#2A2E2B;margin-top:48px;border:1px solid #2A2E2B}
    @media(max-width:780px){.about-features{grid-template-columns:1fr}}
    .af-item{background:var(--ink);padding:32px 28px}
    .af-num{font-family:'Unbounded';font-size:11px;color:var(--green);letter-spacing:.1em;margin-bottom:14px}
    .af-item .af-title{font-family:'Manrope';font-size:18px;font-weight:600;color:#F6F3EE;margin-bottom:10px;letter-spacing:-.005em}
    .af-item .af-desc{font-size:14px;color:#B6B0A2;line-height:1.6;margin:0}
    /* MATERIAL */
    .benefits-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--line-s);margin-top:48px;border:1px solid var(--line-s)}
    @media(max-width:780px){.benefits-grid{grid-template-columns:1fr}}
    .bcard{background:var(--bg);padding:44px 36px}
    .bcard .bnum{font-family:'Unbounded';font-size:11px;color:var(--green-d);letter-spacing:.1em;margin-bottom:20px}
    .bcard h3{font-size:20px;margin-bottom:12px}
    .bcard p{font-size:15px;line-height:1.65}
    .mat-photos{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:56px}
    @media(max-width:900px){.mat-photos{grid-template-columns:repeat(2,1fr)}}
    .mat-photos img{width:100%;aspect-ratio:3/2;object-fit:cover;display:block;cursor:pointer;transition:opacity .2s}
    .mat-photos img:hover{opacity:.88}
    /* SECTIONS */
    .sections-wrap{margin-top:72px;padding-top:64px;border-top:1px solid var(--line-s)}
    .sections-meta{display:grid;grid-template-columns:1fr 1.6fr;gap:48px;align-items:end;margin-bottom:40px}
    @media(max-width:780px){.sections-meta{grid-template-columns:1fr;gap:16px}}
    .sections-strip{display:grid;grid-template-columns:repeat(5,1fr);gap:16px}
    @media(max-width:860px){.sections-strip{grid-template-columns:repeat(3,1fr)}}
    @media(max-width:480px){.sections-strip{grid-template-columns:repeat(2,1fr)}}
    .sitem{background:#fff;border:1px solid var(--line-s);padding:20px 16px 18px;transition:.3s;cursor:default}
    .sitem:hover{border-color:var(--ink)}
    .sitem img{width:100%;height:140px;object-fit:contain;mix-blend-mode:multiply}
    .sitem .sname{font-family:'Unbounded';font-size:15px;font-weight:400;margin-top:14px;color:var(--ink)}
    .sitem .sdesc{font-size:12px;color:var(--muted);margin-top:4px;line-height:1.4}
    /* CERTS */
    .certs-wrap{margin-top:64px;padding-top:56px;border-top:1px solid var(--line-s)}
    .certs-all-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:28px}
    @media(max-width:900px){.certs-all-grid{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:480px){.certs-all-grid{grid-template-columns:1fr}}
    .cert-embed-card{border:1px solid var(--line-s);background:#fff;overflow:hidden}
    .cert-embed-card img{width:100%;height:360px;object-fit:contain;display:block;background:#fff}
    .cert-pdf-card{display:flex;flex-direction:column;justify-content:space-between;padding:28px 24px;height:360px;text-decoration:none;color:var(--ink);transition:.25s;cursor:pointer}
    .cert-pdf-card:hover{border-color:var(--ink);background:var(--bg)}
    .cert-pdf-icon{font-size:40px;line-height:1;color:var(--line)}
    .cert-pdf-card .cn{font-family:'Unbounded',serif;font-size:16px;font-weight:400;color:var(--ink);line-height:1.3;letter-spacing:-.01em}
    .cert-pdf-card .cs{font-size:12px;color:var(--muted);line-height:1.45;flex:1;padding-top:10px}
    .cert-pdf-card .cd{display:inline-block;margin-top:16px;font-size:11px;color:var(--green-d);text-transform:uppercase;letter-spacing:.12em;border:1px solid var(--green-d);padding:7px 14px;border-radius:999px;align-self:flex-start;transition:.2s}
    .cert-pdf-card:hover .cd{background:var(--green-d);color:#fff}
    .cert-pdf-new{display:flex;flex-direction:column;text-decoration:none;transition:.25s;cursor:pointer}
    .cert-pdf-new:hover{border-color:var(--ink)}
    .cert-obj{width:100%;height:300px;display:block;border:none;background:#fff;pointer-events:none}
    .cert-obj-fallback{width:100%;height:300px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:#fff;color:var(--ink)}
    .cert-pdf-footer{padding:14px 16px;border-top:1px solid var(--line-s);display:flex;align-items:center;justify-content:space-between;gap:8px;background:#fff}
    .cert-pdf-name{font-size:12px;font-weight:600;color:var(--ink);line-height:1.3;flex:1}
    .cert-open-btn{font-size:11px;color:var(--green-d);white-space:nowrap;text-transform:uppercase;letter-spacing:.1em;flex-shrink:0}
    /* PROJECTS */
    .projects-sec{background:var(--bg2)}
    .proj-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--line-s);border:1px solid var(--line-s)}
    @media(max-width:1100px){.proj-grid{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:580px){.proj-grid{grid-template-columns:1fr}}
    .pcard{background:#fff;display:flex;flex-direction:column;transition:.3s;cursor:default}
    .pcard:hover{background:var(--bg)}
    .pcard .thumb{position:relative;aspect-ratio:3/2;overflow:hidden;background:var(--bg2)}
    .pcard .thumb img{width:100%;height:100%;object-fit:cover;transition:transform .6s cubic-bezier(.2,.7,.2,1)}
    .pcard:hover .thumb img{transform:scale(1.04)}
    .area-chip{position:absolute;top:14px;right:14px;background:rgba(255,255,255,.92);backdrop-filter:blur(8px);padding:6px 13px;font-family:'Unbounded';font-size:12px;font-weight:400;border-radius:999px}
    .pcard .pbody{padding:24px;flex:1;display:flex;flex-direction:column;gap:12px}
    .pcard .pname{font-family:'Unbounded';font-size:17px;font-weight:400;letter-spacing:-.01em}
    .pcard .pmeta{font-size:13px;color:var(--muted)}
    .ptags{display:flex;flex-wrap:wrap;gap:6px}
    .ptag{font-size:11px;color:var(--muted);background:var(--bg2);border:1px solid var(--line-s);padding:4px 10px;border-radius:999px}
    .pactions{display:flex;gap:8px;margin-top:auto;padding-top:8px;flex-wrap:wrap}
    .pbtn-req{flex:1;min-width:120px;padding:11px 14px;font-size:12px;font-weight:600;background:var(--ink);color:var(--bg);border-radius:999px;text-align:center;transition:.25s;border:0;cursor:pointer}
    .pbtn-req:hover{background:#000}
    .pbtn-plan{padding:11px 14px;font-size:12px;border:1px solid var(--line);color:var(--muted);border-radius:999px;transition:.25s;background:none;cursor:pointer}
    .pbtn-plan:hover{border-color:var(--ink);color:var(--ink)}
    .proj-bottom{display:flex;justify-content:center;margin-top:56px}
    .proj-cta{padding:18px 40px;font-size:16px}
    @media(max-width:540px){.proj-bottom{padding:0 16px}.proj-cta{width:100%;justify-content:center;font-size:13px;padding:14px 20px}}
    /* GALLERY */
    .gallery-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:48px}
    @media(max-width:1000px){.gallery-grid{grid-template-columns:repeat(3,1fr)}}
    @media(max-width:640px){.gallery-grid{grid-template-columns:repeat(2,1fr)}}
    .gitem{position:relative;overflow:hidden;background:var(--bg2);cursor:pointer;aspect-ratio:1/1}
    .gitem img{width:100%;height:100%;object-fit:cover;transition:transform .55s ease}
    .gitem:hover img{transform:scale(1.06)}
    .gitem .ghover{position:absolute;inset:0;background:rgba(15,18,15,0);transition:.3s;display:flex;align-items:center;justify-content:center}
    .gitem:hover .ghover{background:rgba(15,18,15,.18)}
    .gitem .ghover svg{opacity:0;transition:.3s;color:white}
    .gitem:hover .ghover svg{opacity:1}
    /* PRODUCTION */
    .production{background:var(--ink);color:#EFEAE1}
    .production .container{display:grid;grid-template-columns:1fr 1.3fr;gap:80px;align-items:center}
    @media(max-width:900px){.production .container{grid-template-columns:1fr;gap:48px}}
    .production h2{color:#F6F3EE;margin-top:18px}
    .production p{color:#B6B0A2;font-size:clamp(14px,1.3vw,17px);line-height:1.68;margin-top:18px}
    .production .eyebrow{color:#8C8775}
    .production .eyebrow::before{background:#8C8775}
    /* PROCESS */
    .steps-grid{display:grid;grid-template-columns:repeat(4,1fr);margin-top:56px;border-top:2px solid var(--ink)}
    @media(max-width:860px){.steps-grid{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:480px){.steps-grid{grid-template-columns:1fr}}
    .step{padding:30px 28px 30px 24px;border-right:1px solid var(--line-s)}
    .step:last-child{border-right:0}
    @media(max-width:860px){.step{border-right:0;border-bottom:1px solid var(--line-s);padding:24px}.step:last-child{border-bottom:0}}
    .step .sn{font-family:'Unbounded';font-size:11px;color:var(--green-d);letter-spacing:.1em;margin-bottom:12px}
    .step h3{font-family:'Manrope';font-size:17px;font-weight:600;letter-spacing:-.005em;margin-bottom:8px}
    .step p{font-size:14px;line-height:1.58}
    .dur{display:inline-block;margin-top:14px;padding:5px 11px;border:1px solid var(--line);border-radius:999px;font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em}
    /* CTA */
    .cta-sec{background:var(--ink);position:relative;overflow:hidden}
    .cta-sec::before{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(900px 500px at 90% -10%,rgba(124,179,66,.07),transparent 55%),radial-gradient(700px 700px at -5% 110%,rgba(139,111,71,.1),transparent 55%)}
    .cta-grid{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center;position:relative;z-index:1}
    @media(max-width:900px){.cta-grid{grid-template-columns:1fr;gap:48px}}
    .cta-sec h2{color:#F6F3EE;margin-top:16px;font-weight:300}
    .cta-sub{font-size:clamp(15px,1.4vw,18px);color:#B6B0A2;line-height:1.65;margin-top:20px;max-width:44ch}
    .cta-bullets{list-style:none;margin-top:32px;display:grid;gap:12px}
    .cta-bullets li{display:flex;align-items:center;gap:13px;font-size:15px;color:#D8D2C5}
    .cta-bullets li::before{content:"";width:6px;height:6px;border-radius:50%;background:var(--green);flex-shrink:0}
    .fcard{background:#1C2020;border:1px solid #2A2E2B;padding:36px;border-radius:2px}
    .fcard .flbl{font-size:11px;color:#8C8775;letter-spacing:.18em;text-transform:uppercase;margin-bottom:6px}
    .fcard h3{font-family:'Unbounded';font-weight:300;font-size:clamp(20px,2vw,26px);color:#F6F3EE;letter-spacing:-.01em;margin-bottom:6px}
    .fcard .fsub{font-size:14px;color:#B6B0A2;line-height:1.55;margin-bottom:24px}
    /* FOOTER */
    footer{background:var(--bg);border-top:1px solid var(--line-s);padding:64px 0 40px}
    .foot-grid{display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:48px}
    @media(max-width:900px){.foot-grid{grid-template-columns:1fr 1fr;gap:32px}}
    @media(max-width:480px){.foot-grid{grid-template-columns:1fr}}
    .foot-brand p{font-size:14px;color:var(--muted);margin-top:16px;max-width:28ch;line-height:1.58}
    footer h4{font-size:10px;text-transform:uppercase;letter-spacing:.2em;color:var(--muted);margin-bottom:16px;font-weight:600}
    footer ul{list-style:none;display:grid;gap:9px}
    footer ul li,footer ul a{font-size:14px;color:var(--ink-s)}
    footer ul a:hover{color:var(--ink)}
    .foot-bot{border-top:1px solid var(--line-s);margin-top:48px;padding-top:24px;display:flex;justify-content:space-between;font-size:12px;color:var(--muted);flex-wrap:wrap;gap:8px}
    /* MODAL */
    .modal-back{position:fixed;inset:0;background:rgba(8,12,8,.6);backdrop-filter:blur(10px);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px;opacity:0;pointer-events:none;transition:.25s}
    .modal-back.open{opacity:1;pointer-events:auto}
    .modal-box{background:var(--bg);border:1px solid var(--line-s);border-radius:4px;max-height:90vh;overflow-y:auto;width:100%;max-width:860px;transform:translateY(16px);transition:.35s cubic-bezier(.2,.7,.2,1)}
    .modal-back.open .modal-box{transform:none}
    .modal-hd{display:flex;justify-content:space-between;align-items:flex-start;padding:32px 32px 0}
    .modal-hd .mlbl{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.18em;margin-bottom:6px}
    .modal-hd h3{font-family:'Unbounded';font-size:22px;font-weight:400}
    .mclose{width:36px;height:36px;border-radius:50%;border:1px solid var(--line);display:flex;align-items:center;justify-content:center;color:var(--muted);flex-shrink:0;transition:.2s;cursor:pointer;background:none}
    .mclose:hover{border-color:var(--ink);color:var(--ink)}
    .modal-bd{padding:24px 32px 32px}
    .plan-meta{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px}
    @media(max-width:560px){.plan-meta{grid-template-columns:repeat(2,1fr)}}
    .pmv .pv{font-family:'Unbounded';font-size:22px;font-weight:300}
    .pmv .pl{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.12em;margin-top:4px}
    .plans-duo{display:grid;grid-template-columns:1fr 1fr;gap:16px}
    @media(max-width:560px){.plans-duo{grid-template-columns:1fr}}
    .plan-img-wrap{border:1px solid var(--line-s);padding:20px}
    .plan-img-wrap .pilbl{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.16em;margin-bottom:12px}
    .plan-img-wrap img{width:100%;mix-blend-mode:multiply;background:#FBFAF7}
    .inq-modal .modal-box{max-width:480px}
    /* LIGHTBOX */
    .lb{position:fixed;inset:0;background:rgba(8,12,8,.96);z-index:200;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:.25s}
    .lb.open{opacity:1;pointer-events:auto}
    .lb img{max-width:90vw;max-height:86vh;object-fit:contain;border-radius:2px}
    .lb-x{position:absolute;top:20px;right:20px;width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;color:white;transition:.2s;cursor:pointer;background:none}
    .lb-x:hover{border-color:rgba(255,255,255,.5)}
    .lb-nav{position:absolute;top:50%;transform:translateY(-50%);width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;color:white;transition:.2s;cursor:pointer;background:none}
    .lb-nav:hover{border-color:rgba(255,255,255,.5)}
    .lb-p{left:20px}.lb-n{right:20px}
  `;

  return (
    <>
      <style>{css}</style>

      {/* HEADER */}
      <header ref={headerRef} className={scrolled ? 'scrolled' : ''} id="hdr">
        <div className="container nav">
          <a href="#top" aria-label="ВУДСОКОЛ">
            <img src="/assets/logo.png" alt="ВУДСОКОЛ" className="nav-logo" />
          </a>
          <nav className="nav-links">
            <a href="#about">О нас</a>
            <a href="#material">Материал</a>
            <a href="#projects">Проекты</a>
            <a href="#gallery">Портфолио</a>
            <a href="#production">Производство</a>
            <a href="#process">Строительство</a>
          </nav>
          <div className="nav-right">
            <a className="nav-phone" href="tel:+79215941712">+7&nbsp;921&nbsp;594‑17‑12</a>
            <button className="btn btn-primary" onClick={() => openInq('Обсудить проект')}>
              Обсудить проект
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
            </button>
            <button className={`burger${mobOpen ? ' open' : ''}`} onClick={() => setMobOpen(v => !v)} aria-label="Меню" aria-expanded={mobOpen}>
              <span/><span/><span/>
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE NAV */}
      <div className={`mob-overlay${mobOpen ? ' open' : ''}`} onClick={() => setMobOpen(false)} />
      <nav className={`mob-nav${mobOpen ? ' open' : ''}`} aria-hidden={!mobOpen}>
        {['#about:О нас','#material:Материал','#projects:Проекты','#gallery:Портфолио','#production:Производство','#process:Строительство'].map(s => {
          const [href, label] = s.split(':');
          return <a key={href} href={href} onClick={() => setMobOpen(false)}>{label}</a>;
        })}
        <a className="mob-phone" href="tel:+79215941712">+7 921 594‑17‑12</a>
        <button className="btn btn-primary mob-cta" onClick={() => { setMobOpen(false); openInq('Обсудить проект'); }}>
          Обсудить проект
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
        </button>
      </nav>

      {/* HERO */}
      <section className="hero" id="top">
        <img className="hero-bg" src="/assets/hero-sm.png" alt="Дом ВУДСОКОЛ" />
        <div className="hero-overlay" />
        <div className="container hero-content">
          <span className="eyebrow" style={{color:'rgba(246,243,238,.42)'}}>Санкт-Петербург и Ленинградская область</span>
          <h1>Проектирование и строительство домов из клееного бруса <em>Сокольского ДОК</em></h1>
          <p className="hero-sub">Пространство для счастливой жизни Вашей семьи от потомственных плотников из Санкт-Петербурга и Вологодской области</p>
          <div className="hero-actions">
            <button className="btn btn-green" onClick={() => openInq('Обсудить проект')}>
              Обсудить проект
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
            </button>
            <a href="#projects" className="btn btn-ghost">Смотреть проекты</a>
          </div>
          <div className="hero-stats">
            {[['15+','лет опыта'],['150+','реализованных проектов'],['100%','гарантия качества'],['№ 1','по качеству бруса']].map(([v,l]) => (
              <div key={l} className="hstat"><div className="v">{v}</div><div className="l">{l}</div></div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="quote-sec" id="about">
        <div className="container">
          <h2 className="reveal" style={{color:'#F6F3EE',fontFamily:"'Unbounded',serif",fontWeight:300,letterSpacing:'-.02em',fontSize:'clamp(26px,3.2vw,48px)',marginBottom:48,lineHeight:1.08}}>
            Строим премиальные дома<br/>без компромиссов
          </h2>
          <div className="quote-inner reveal">
            <p className="quote-text">Удовольствие от хорошего качества всегда длится дольше, чем радость от низкой цены</p>
          </div>
          <div className="about-features reveal">
            {[
              ['01','Команда профессионалов','Компетентные инженеры, электрики, теплотехники и мастера премиальной отделки.'],
              ['02','Эталонные материалы','Брус Сокольского ДОК различного сечения под любые задачи.'],
              ['03','Передовые технологии','Работаем на премиальном немецком оборудовании для дерева и керамогранита.'],
            ].map(([n,t,d]) => (
              <div key={n} className="af-item">
                <div className="af-num">{n}</div>
                <h3 className="af-title">{t}</h3>
                <p className="af-desc">{d}</p>
              </div>
            ))}
          </div>
          <div className="reveal" style={{marginTop:64}}>
            <video autoPlay muted loop playsInline style={{width:'100%',aspectRatio:'16/7',objectFit:'cover',borderRadius:2,display:'block',background:'#111'}}>
              <source src="/assets/video-about.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      {/* MATERIAL */}
      <section id="material">
        <div className="container">
          <div className="section-head reveal">
            <div>
              <span className="eyebrow">Материал</span>
              <h2 style={{marginTop:16}}>Клееный брус — это природный материал в инженерной форме</h2>
            </div>
            <p className="section-lead">Точная геометрия, стабильность, долговечность без химии.</p>
          </div>
          <div className="mat-photos reveal">
            {MAT_PHOTOS.map((src, i) => (
              <img key={src} src={src} alt={`Производство бруса ${i+1}`} loading="lazy" onClick={() => openLB(MAT_PHOTOS, i)} />
            ))}
          </div>
          <div className="benefits-grid reveal">
            {[
              ['01','Тепло, которое держится','Клееный брус обладает высокой теплоёмкостью: аккумулирует тепло и постепенно отдаёт его.'],
              ['02','Запах натурального дерева','Дерево дышит. Оно реагирует на влажность, температуру — наполняя дом живым ароматом.'],
              ['03','Здоровый микроклимат','Микроклимат регулируется естественно: лишняя влага поглощается, сухость компенсируется.'],
            ].map(([n,t,d]) => (
              <div key={n} className="bcard">
                <div className="bnum">{n}</div>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>

          {/* CERTS */}
          <div className="certs-wrap reveal">
            <span className="eyebrow">Сертификаты</span>
            <p style={{fontFamily:"'Unbounded',serif",fontSize:'clamp(18px,1.8vw,24px)',fontWeight:400,letterSpacing:'-.01em',margin:'14px 0 0',color:'var(--ink)'}}>Наш брус официально сертифицирован</p>
            <div className="certs-all-grid">
              <div className="cert-embed-card"><img src="/assets/cert-add.jpg" alt="АДД Платина" /></div>
              {[
                ['/assets/cert-enplus.pdf','ENplus S-DOK Sokol Timber'],
                ['/assets/cert-mpa.pdf','Сертификат МПА'],
                ['/assets/cert-factory.pdf','Соответствие производственного контроля'],
                ['/assets/cert-jas.pdf','JAS Diploma'],
                ['/assets/cert-sbp.pdf','SBP — Sustainable Biomass Program'],
              ].map(([href, cn]) => (
                <a key={href} href={href} target="_blank" rel="noreferrer" className="cert-embed-card cert-pdf-new">
                  <object data={`${href}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`} type="application/pdf" className="cert-obj">
                    <div className="cert-obj-fallback">
                      <span style={{fontSize:38,lineHeight:1}}>📄</span>
                      <span style={{fontSize:13,fontWeight:600,textAlign:'center',padding:'0 12px',lineHeight:1.35}}>{cn}</span>
                    </div>
                  </object>
                  <div className="cert-pdf-footer">
                    <span className="cert-pdf-name">{cn}</span>
                    <span className="cert-open-btn">Открыть PDF ↓</span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* SECTIONS */}
          <div className="sections-wrap reveal">
            <div className="sections-meta">
              <div>
                <span className="eyebrow">Сечения бруса</span>
                <h2 style={{marginTop:14}}>Выберите<br/>своё сечение</h2>
              </div>
              <p className="section-lead" style={{marginBottom:0}}>Сечение определяет теплоизоляцию, прочность, внешний вид дома и его стоимость.</p>
            </div>
            <div className="sections-strip">
              {[
                ['/assets/section-360.png','360×200','Максимальное утепление'],
                ['/assets/section-320.png','320×200','Премиальный выбор'],
                ['/assets/section-280.jpg','280×200','Оптимальный баланс'],
                ['/assets/section-240.jpg','240×200','Популярный выбор'],
                ['/assets/section-180.jpg','180×200','Для тёплого климата'],
              ].map(([src, name, desc]) => (
                <div key={name} className="sitem">
                  <img src={src} alt={name} />
                  <div className="sname">{name}</div>
                  <div className="sdesc">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section id="projects" className="projects-sec">
        <div className="container">
          <div className="section-head reveal">
            <div>
              <span className="eyebrow">Проекты</span>
              <h2 style={{marginTop:16}}>Готовые проекты и современная архитектура</h2>
            </div>
            <p className="section-lead">Каждый проект адаптируется под участок и семью.</p>
          </div>
          <div className="proj-grid reveal">
            {sortedProjects.map(p => {
              const tags = [];
              if (p.bed) tags.push(declineBed(p.bed));
              if (p.bath) tags.push(declineBath(p.bath));
              if (p.terrace) tags.push(`Терраса ${p.terrace} м²`);
              (p.features || []).forEach(f => tags.push(f));
              return (
                <article key={p.id} className="pcard">
                  <div className="thumb">
                    <img src={p.photo_url} alt={p.name} loading="lazy" />
                    <div className="area-chip">{p.area} м²</div>
                  </div>
                  <div className="pbody">
                    <div className="pname">{p.name}</div>
                    <div className="pmeta">{declineFloors(p.floors)} · Жилая {p.living} м²</div>
                    <div className="ptags">{tags.map(t => <span key={t} className="ptag">{t}</span>)}</div>
                    <div className="pactions">
                      <button className="pbtn-req" onClick={() => openInq(`Стоимость — ${p.name}`)}>Стоимость по запросу</button>
                      <button className="pbtn-plan" onClick={() => setPlansModal(p)}>Планировки</button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          <div className="proj-bottom reveal">
            <button className="btn btn-primary proj-cta" onClick={() => openInq('Индивидуальный проект')}>
              Хочу индивидуальный проект
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
            </button>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section id="gallery">
        <div className="container">
          <div className="section-head reveal">
            <div>
              <span className="eyebrow">Реализованные проекты</span>
              <h2 style={{marginTop:16}}>Дома, в которых уже живут семьи</h2>
            </div>
            <p className="section-lead">У каждого дома своя история.</p>
          </div>
          <div className="gallery-grid reveal">
            {gallery.map((item, i) => (
              <div key={item.id} className="gitem" onClick={() => openLB(gallery.map(g => g.photo_url), i)}>
                <img src={item.photo_url} alt={`Реализованный проект ${i+1}`} loading="lazy" />
                <div className="ghover">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="white" strokeWidth="1.4">
                    <circle cx="14" cy="14" r="9"/><path d="M14 10v8M10 14h8"/>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTION */}
      <section className="production" id="production">
        <div className="container">
          <div className="reveal">
            <span className="eyebrow">Производство</span>
            <h2>Производственный<br/>комплекс</h2>
            <p>Наши дома создаются на базе АО «Сокольский ДОК» — крупнейшего деревообрабатывающего производства в европейской части России.</p>
          </div>
          <div className="reveal">
            <video autoPlay muted loop playsInline style={{width:'100%',maxWidth:400,aspectRatio:'9/16',objectFit:'cover',borderRadius:8,display:'block',background:'#111',margin:'0 auto',boxShadow:'0 20px 60px rgba(0,0,0,.4)'}}>
              <source src="/assets/video-production-new.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section id="process">
        <div className="container">
          <div className="section-head reveal">
            <div>
              <span className="eyebrow">Этапы работы</span>
              <h2 style={{marginTop:16}}>От первого звонка до ключей</h2>
            </div>
            <p className="section-lead">Прозрачный процесс из четырёх этапов.</p>
          </div>
          <div className="steps-grid reveal">
            {[
              ['01','Знакомство','Первичная консультация, выбор проекта или обсуждение пожеланий.','3 дня'],
              ['02','Архитектура','Разработка эскизного проекта и рабочей документации.','3–5 недель'],
              ['03','Производство','Изготовление домокомплекта из премиального клееного бруса.','3–4 недели'],
              ['04','Сборка','Монтаж фундамента, возведение стен и устройство кровли.','10–14 недель'],
            ].map(([n,h,p,d]) => (
              <div key={n} className="step">
                <div className="sn">{n}</div>
                <h3>{h}</h3>
                <p>{p}</p>
                <span className="dur">{d}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / FORM */}
      <section className="cta-sec" id="cta">
        <div className="container">
          <div className="cta-grid">
            <div className="reveal">
              <span className="eyebrow" style={{color:'#5A5E55'}}>заявка</span>
              <h2>Дом начинается<br/>с разговора</h2>
              <p className="cta-sub">Оставьте номер — мы перезвоним в течение часа.</p>
              <ul className="cta-bullets">
                <li>Бесплатный выезд на участок и замеры</li>
                <li>Каталог наших готовых проектов</li>
                <li>Расчёт стоимости «под ключ»</li>
              </ul>
            </div>
            <div className="reveal">
              <div className="fcard">
                <div className="flbl">Заявка на консультацию</div>
                <h3>Мы перезвоним за 1 час</h3>
                <p className="fsub">Без спама и настойчивых менеджеров.</p>
                <LeadForm dark />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="container">
          <div className="foot-grid">
            <div className="foot-brand">
              <img src="/assets/logo.png" alt="ВУДСОКОЛ" style={{height:26}} />
              <p>Премиальные дома из клееного бруса. Производство в Вологодской области.</p>
            </div>
            <div>
              <h4>Навигация</h4>
              <ul>
                {[['#about','О нас'],['#material','Материал'],['#projects','Проекты'],['#gallery','Портфолио'],['#production','Производство'],['#process','Строительство']].map(([h,l]) => (
                  <li key={h}><a href={h}>{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Контакты</h4>
              <ul>
                <li><a href="tel:+79215941712">+7 921 594‑17‑12</a></li>
                <li><a href="mailto:woodsokol-group@yandex.ru">woodsokol-group@yandex.ru</a></li>
                <li>Ежедневно 10:00–19:00</li>
              </ul>
            </div>
            <div>
              <h4>Адреса</h4>
              <ul>
                <li>Санкт-Петербург, ул. Химиков 28,<br/>БЦ H2O, офис 1209</li>
                <li style={{marginTop:4,color:'var(--muted)'}}>Производство: г. Сокол,<br/>Вологодская обл.</li>
              </ul>
            </div>
          </div>
          <div className="foot-bot">
            <span>© 2009–2026 ВУДСОКОЛ. Все права защищены.</span>
            <span>Политика конфиденциальности</span>
          </div>
        </div>
      </footer>

      {/* PLANS MODAL */}
      {plansModal && (
        <div className={`modal-back open`} onClick={e => { if (e.target === e.currentTarget) setPlansModal(null); }}>
          <div className="modal-box">
            <div className="modal-hd">
              <div>
                <div className="mlbl">Планировки</div>
                <h3>{plansModal.name}</h3>
              </div>
              <button className="mclose" onClick={() => setPlansModal(null)} aria-label="Закрыть">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M2 2l10 10M12 2L2 12"/></svg>
              </button>
            </div>
            <div className="modal-bd">
              {plansModal.plans.length ? (
                <>
                  <div className="plan-meta">
                    <div className="pmv"><div className="pv">{plansModal.plan_area || plansModal.area} м²</div><div className="pl">Площадь</div></div>
                    <div className="pmv"><div className="pv">{declineFloors(plansModal.plan_floors || plansModal.floors)}</div></div>
                    <div className="pmv"><div className="pv">{declineBed(plansModal.plan_bed || plansModal.bed)}</div></div>
                    <div className="pmv"><div className="pv">{declineBath(plansModal.plan_bath || plansModal.bath)}</div></div>
                  </div>
                  <div className="plans-duo">
                    {plansModal.plans.map((src, i) => (
                      <div key={src} className="plan-img-wrap">
                        <div className="pilbl">{(plansModal.plan_floors || plansModal.floors) === 2 ? (i === 0 ? '1 этаж' : '2 этаж') : 'Планировка'}</div>
                        <img src={src} alt="Планировка" />
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{textAlign:'center',padding:'40px 20px'}}>
                  <h3 style={{fontSize:18,fontWeight:300,marginBottom:10}}>Планировки по запросу</h3>
                  <p style={{fontSize:14,color:'var(--muted)',marginBottom:28}}>Пришлём полный комплект планировок в течение одного часа</p>
                  <button className="btn btn-primary" onClick={() => { setPlansModal(null); openInq(`Планировки — ${plansModal.name}`); }}>Запросить планировки</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* INQUIRY MODAL */}
      {inqModal && (
        <div className="modal-back inq-modal open" onClick={e => { if (e.target === e.currentTarget) setInqModal(null); }}>
          <div className="modal-box" style={{maxWidth:480}}>
            <div className="modal-hd">
              <div>
                <div className="mlbl">Заявка</div>
                <h3>{inqModal}</h3>
              </div>
              <button className="mclose" onClick={() => setInqModal(null)} aria-label="Закрыть">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M2 2l10 10M12 2L2 12"/></svg>
              </button>
            </div>
            <div className="modal-bd">
              <p style={{fontSize:14,color:'var(--muted)',marginBottom:24,lineHeight:1.6}}>Оставьте номер — мы перезвоним в течение часа.</p>
              <LeadForm subject={inqModal} onSuccess={() => setTimeout(() => setInqModal(null), 2400)} />
            </div>
          </div>
        </div>
      )}

      {/* LIGHTBOX */}
      {lb && (
        <div className="lb open" onClick={e => { if (e.target === e.currentTarget) setLb(null); }}>
          <button className="lb-x" onClick={() => setLb(null)} aria-label="Закрыть">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="1.4"><path d="M2 2l10 10M12 2L2 12"/></svg>
          </button>
          <button className="lb-nav lb-p" onClick={() => lbGo(-1)} aria-label="Назад">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.4"><path d="M10 4L6 8l4 4"/></svg>
          </button>
          <img src={lb.photos[lb.idx]} alt="" />
          <button className="lb-nav lb-n" onClick={() => lbGo(1)} aria-label="Вперёд">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.4"><path d="M6 4l4 4-4 4"/></svg>
          </button>
        </div>
      )}
    </>
  );
}
