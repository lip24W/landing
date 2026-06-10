import { useState, useEffect, useRef } from 'react';
import { getPortfolio, addPortfolioItem, deletePortfolioItem } from '../../api/portfolio';

export default function PortfolioTab() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError]     = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const fileRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getPortfolio();
      setItems(data);
    } catch {
      setError('Не удалось загрузить портфолио');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    setError('');
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append('photo', file);
        await addPortfolioItem(fd);
      }
      await load();
    } catch {
      setError('Ошибка при загрузке фото');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePortfolioItem(id);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch {
      setError('Ошибка при удалении');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <>
      <div className="tab-header">
        <h2 className="tab-title">Портфолио</h2>
        <button
          className="admin-btn-primary"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'Загрузка…' : '+ Добавить фото'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={handleUpload} />
      </div>

      {error && <div className="admin-err">{error}</div>}

      {loading ? (
        <div className="admin-loading">Загрузка…</div>
      ) : items.length === 0 ? (
        <div className="admin-empty">Портфолио пусто. Добавьте первое фото.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 12 }}>
          {items.map(item => (
            <div key={item.id} style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', borderRadius: 2, background: 'var(--bg2)', border: '1px solid var(--line-s)' }}>
              <img
                src={item.photo_url}
                alt="Портфолио"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <button
                onClick={() => setDeleteId(item.id)}
                style={{
                  position: 'absolute', top: 8, right: 8,
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'rgba(8,12,8,.7)', border: '1px solid rgba(255,255,255,.2)',
                  color: '#fff', fontSize: 14, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  lineHeight: 1,
                }}
                title="Удалить"
              >×</button>
            </div>
          ))}
        </div>
      )}

      {deleteId && (
        <div className="confirm-back" onClick={e => { if (e.target === e.currentTarget) setDeleteId(null); }}>
          <div className="confirm-box">
            <h3>Удалить фото?</h3>
            <p>Это действие нельзя отменить.</p>
            <div className="confirm-actions">
              <button className="pf-cancel" onClick={() => setDeleteId(null)}>Отмена</button>
              <button className="pf-save" style={{ background: 'var(--red)' }} onClick={() => handleDelete(deleteId)}>Удалить</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
