import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectsTab from '../components/admin/ProjectsTab';
import LeadsTab from '../components/admin/LeadsTab';
import PortfolioTab from '../components/admin/PortfolioTab';
import { logout } from '../api/auth';

const TABS = [
  { id: 'projects',  label: 'Проекты' },
  { id: 'portfolio', label: 'Портфолио' },
  { id: 'leads',     label: 'Заявки' },
];

const adminCss = `
  .admin-wrap{min-height:100svh;display:flex;flex-direction:column;background:var(--bg2)}
  .admin-header{background:var(--ink);position:sticky;top:0;z-index:30;border-bottom:1px solid #2A2E2B}
  .admin-nav{display:flex;align-items:center;justify-content:space-between;height:64px;padding:0 32px;gap:24px}
  @media(max-width:600px){.admin-nav{padding:0 16px}}
  .admin-logo{height:22px}
  .admin-badge{font-size:10px;text-transform:uppercase;letter-spacing:.2em;color:#8C8775;background:#252929;padding:4px 10px;border-radius:999px;border:1px solid #333938}
  .admin-logout{font-size:13px;color:#B6B0A2;cursor:pointer;transition:color .2s;background:none;border:0;font-family:inherit}
  .admin-logout:hover{color:#F6F3EE}
  .admin-tabs-bar{background:var(--ink);border-bottom:1px solid #2A2E2B;display:flex;gap:0;padding:0 32px}
  @media(max-width:600px){.admin-tabs-bar{padding:0 16px}}
  .admin-tab{padding:14px 20px;font-size:14px;font-weight:500;color:#8C8775;cursor:pointer;border-bottom:2px solid transparent;transition:.2s;background:none;border-top:0;border-left:0;border-right:0;font-family:inherit}
  .admin-tab:hover{color:#B6B0A2}
  .admin-tab.active{color:var(--green);border-bottom-color:var(--green)}
  .admin-content{flex:1;padding:40px 32px;max-width:1280px;width:100%;margin:0 auto}
  @media(max-width:768px){.admin-content{padding:24px 16px}}

  /* TAB internals */
  .tab-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;gap:16px;flex-wrap:wrap}
  .tab-title{font-family:'Unbounded',serif;font-size:clamp(18px,2vw,24px);font-weight:300;letter-spacing:-.01em;color:var(--ink)}
  .tab-back{font-size:14px;color:var(--muted);cursor:pointer;display:flex;align-items:center;gap:6px;transition:color .2s;background:none;border:0;font-family:inherit}
  .tab-back:hover{color:var(--ink)}
  .admin-btn-primary{padding:10px 20px;background:var(--ink);color:var(--bg);border-radius:999px;font-size:14px;font-weight:600;cursor:pointer;border:0;font-family:inherit;transition:.25s;white-space:nowrap}
  .admin-btn-primary:hover{background:#000}
  .admin-err{background:rgba(209,75,58,.1);border:1px solid rgba(209,75,58,.3);padding:12px 16px;border-radius:2px;color:var(--red);font-size:14px;margin-bottom:20px;line-height:1.4}
  .admin-loading{padding:48px;text-align:center;color:var(--muted);font-size:15px}
  .admin-empty{padding:48px;text-align:center;color:var(--muted);font-size:15px}
  .leads-count{font-size:13px;color:var(--muted);background:var(--line-s);padding:4px 12px;border-radius:999px;border:1px solid var(--line)}

  /* TABLE */
  .proj-table-wrap{overflow-x:auto;border:1px solid var(--line-s);border-radius:2px;background:#fff}
  .proj-table{width:100%;border-collapse:collapse;font-size:14px}
  .proj-table th{padding:12px 16px;text-align:left;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);font-weight:600;background:var(--bg);border-bottom:1px solid var(--line-s);white-space:nowrap}
  .proj-table td{padding:14px 16px;border-bottom:1px solid var(--line-s);vertical-align:middle;color:var(--ink-s)}
  .proj-table tr:last-child td{border-bottom:0}
  .proj-table tr:hover td{background:var(--bg2)}
  .tbl-btn{font-size:12px;padding:5px 12px;border-radius:999px;border:1px solid var(--line);cursor:pointer;transition:.2s;background:none;font-family:inherit}
  .tbl-btn.edit{color:var(--ink-s)}.tbl-btn.edit:hover{border-color:var(--ink);color:var(--ink)}
  .tbl-btn.del{color:var(--red);border-color:rgba(209,75,58,.3)}.tbl-btn.del:hover{background:rgba(209,75,58,.08)}

  /* PROJECT FORM */
  .pf-section-title{font-family:'Unbounded',serif;font-size:13px;font-weight:400;color:var(--muted);text-transform:uppercase;letter-spacing:.1em;margin-bottom:20px}
  .pf-divider{height:1px;background:var(--line-s);margin:32px 0}
  .pf-field{margin-bottom:16px}
  .pf-label{display:block;font-size:12px;font-weight:600;color:var(--ink-s);margin-bottom:6px;letter-spacing:.01em}
  .pf-req{color:var(--red)}
  .af-inp{width:100%;padding:12px 14px;background:#fff;border:1px solid var(--line);color:var(--ink);font-size:14px;border-radius:2px;transition:.25s;outline:none;font-family:inherit}
  .af-inp:focus{border-color:var(--ink)}
  .af-inp.err{border-color:var(--red)}
  select.af-inp{cursor:pointer}
  .pf-err{font-size:12px;color:var(--red);margin-top:5px;display:block;line-height:1.4}
  .pf-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px;margin-bottom:0}
  .pf-row .pf-field{margin-bottom:0}
  .pf-upload{width:100%;height:200px;border:2px dashed var(--line);border-radius:2px;cursor:pointer;overflow:hidden;transition:border-color .2s;display:flex}
  .pf-upload:hover{border-color:var(--ink)}
  .pf-upload.err{border-color:var(--red)}
  .pf-upload-placeholder{width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:var(--muted);font-size:14px}
  .pf-tags{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px;min-height:16px}
  .pf-tag{display:inline-flex;align-items:center;gap:6px;background:var(--bg2);border:1px solid var(--line);padding:5px 10px;border-radius:999px;font-size:13px;color:var(--ink-s)}
  .pf-tag-del{background:none;border:0;cursor:pointer;font-size:16px;color:var(--muted);line-height:1;padding:0;transition:color .2s}
  .pf-tag-del:hover{color:var(--red)}
  .pf-feature-row{display:flex;gap:8px}
  .pf-feature-row .af-inp{flex:1}
  .pf-add-btn{padding:12px 16px;background:var(--bg2);border:1px solid var(--line);border-radius:2px;font-size:13px;color:var(--ink-s);cursor:pointer;white-space:nowrap;font-family:inherit;transition:.2s}
  .pf-add-btn:hover{border-color:var(--ink);color:var(--ink)}
  .pf-suggestions{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
  .pf-suggestion{padding:4px 10px;background:#fff;border:1px solid var(--line-s);border-radius:999px;font-size:12px;color:var(--muted);cursor:pointer;transition:.2s;font-family:inherit}
  .pf-suggestion:hover{border-color:var(--green-d);color:var(--green-d)}
  .pf-plan-photos{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px}
  .pf-plan-slot{aspect-ratio:3/2;border:2px dashed var(--line);border-radius:2px;cursor:pointer;overflow:hidden;transition:border-color .2s;display:flex}
  .pf-plan-slot:hover{border-color:var(--ink)}
  .pf-plan-ph{width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:var(--muted);font-size:13px}
  .pf-actions{display:flex;gap:12px;justify-content:flex-end;margin-top:32px;padding-top:24px;border-top:1px solid var(--line-s)}
  .pf-save{padding:13px 28px;background:var(--green);color:#0A1208;font-weight:700;font-size:14px;border-radius:2px;cursor:pointer;border:0;font-family:inherit;transition:.25s}
  .pf-save:hover{background:#8FCA51}
  .pf-save:disabled{opacity:.6;cursor:not-allowed}
  .pf-cancel{padding:13px 24px;background:#fff;border:1px solid var(--line);color:var(--ink-s);font-size:14px;border-radius:2px;cursor:pointer;font-family:inherit;transition:.2s}
  .pf-cancel:hover{border-color:var(--ink);color:var(--ink)}

  /* CONFIRM MODAL */
  .confirm-back{position:fixed;inset:0;background:rgba(8,12,8,.5);backdrop-filter:blur(8px);z-index:50;display:flex;align-items:center;justify-content:center;padding:20px}
  .confirm-box{background:var(--bg);border:1px solid var(--line-s);border-radius:4px;padding:32px;max-width:400px;width:100%}
  .confirm-box h3{font-family:'Unbounded',serif;font-size:18px;font-weight:400;margin-bottom:12px}
  .confirm-box p{font-size:14px;color:var(--muted);line-height:1.55;margin-bottom:24px}
  .confirm-actions{display:flex;gap:12px;justify-content:flex-end}
`;

export default function AdminPage() {
  const [tab, setTab] = useState('projects');
  const nav = useNavigate();

  const handleLogout = async () => {
    try { await logout(); } catch {}
    localStorage.removeItem('token');
    nav('/login');
  };

  return (
    <>
      <style>{adminCss}</style>
      <div className="admin-wrap">
        <header className="admin-header">
          <div className="admin-nav">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <img src="/assets/logo.png" alt="ВУДСОКОЛ" className="admin-logo" />
              <span className="admin-badge">Панель управления</span>
            </div>
            <button className="admin-logout" onClick={handleLogout}>Выйти →</button>
          </div>
          <div className="admin-tabs-bar">
            {TABS.map(t => (
              <button
                key={t.id}
                className={`admin-tab${tab === t.id ? ' active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </header>

        <main className="admin-content">
          {tab === 'projects'  && <ProjectsTab />}
          {tab === 'portfolio' && <PortfolioTab />}
          {tab === 'leads'     && <LeadsTab />}
        </main>
      </div>
    </>
  );
}
