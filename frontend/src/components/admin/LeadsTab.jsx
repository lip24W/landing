import { useState, useEffect } from 'react';
import { getLeads } from '../../api/leads';

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function LeadsTab() {
  const [leads, setLeads]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getLeads();
        setLeads(data.data || data);
      } catch {
        setError('Не удалось загрузить заявки');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <div className="tab-header">
        <h2 className="tab-title">Заявки</h2>
        <span className="leads-count">{leads.length} заявок</span>
      </div>

      {error && <div className="admin-err">{error}</div>}

      {loading ? (
        <div className="admin-loading">Загрузка…</div>
      ) : leads.length === 0 ? (
        <div className="admin-empty"><p>Заявок пока нет.</p></div>
      ) : (
        <div className="proj-table-wrap">
          <table className="proj-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Имя</th>
                <th>Телефон</th>
                <th>Проект / тема</th>
                <th>Дата</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l, i) => (
                <tr key={l.id}>
                  <td style={{color:'var(--muted)',fontSize:13}}>{i + 1}</td>
                  <td>{l.name || <span style={{color:'var(--muted)'}}>—</span>}</td>
                  <td>
                    <a href={`tel:${l.phone}`} style={{color:'var(--green-d)',fontWeight:600}}>
                      {l.phone}
                    </a>
                  </td>
                  <td>{l.subject || '—'}</td>
                  <td style={{color:'var(--muted)',fontSize:13,whiteSpace:'nowrap'}}>{formatDate(l.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
