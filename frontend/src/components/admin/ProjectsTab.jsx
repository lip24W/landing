import { useState, useEffect } from 'react';
import { getProjects, createProject, updateProject, deleteProject } from '../../api/projects';
import ProjectForm from './ProjectForm';

export default function ProjectsTab() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState('list'); // 'list' | 'create' | 'edit'
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getProjects();
      setProjects(data.data || data);
    } catch {
      setError('Не удалось загрузить проекты');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (fd) => {
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await updateProject(editing.id, fd);
      } else {
        await createProject(fd);
      }
      await load();
      setView('list');
      setEditing(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при сохранении');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      setDeleteId(null);
    } catch {
      setError('Не удалось удалить проект');
    }
  };

  if (view !== 'list') {
    return (
      <div>
        <div className="tab-header">
          <button className="tab-back" onClick={() => { setView('list'); setEditing(null); }}>
            ← Назад к списку
          </button>
          <h2 className="tab-title">{editing ? 'Редактировать проект' : 'Новый проект'}</h2>
        </div>
        {error && <div className="admin-err">{error}</div>}
        <ProjectForm initial={editing} onSave={handleSave} onCancel={() => { setView('list'); setEditing(null); }} loading={saving} />
      </div>
    );
  }

  return (
    <div>
      <div className="tab-header">
        <h2 className="tab-title">Проекты</h2>
        <button className="admin-btn-primary" onClick={() => { setEditing(null); setView('create'); }}>
          + Новый проект
        </button>
      </div>

      {error && <div className="admin-err">{error}</div>}

      {loading ? (
        <div className="admin-loading">Загрузка…</div>
      ) : projects.length === 0 ? (
        <div className="admin-empty">
          <p>Проектов ещё нет.</p>
          <button className="admin-btn-primary" style={{marginTop:16}} onClick={() => setView('create')}>Создать первый</button>
        </div>
      ) : (
        <div className="proj-table-wrap">
          <table className="proj-table">
            <thead>
              <tr>
                <th style={{width:80}}>Фото</th>
                <th>Название</th>
                <th>Площадь</th>
                <th>Этажи</th>
                <th>Особенности</th>
                <th style={{width:120}}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => (
                <tr key={p.id}>
                  <td>
                    {p.photo_url
                      ? <img src={p.photo_url} alt={p.name} style={{width:64,height:48,objectFit:'cover',borderRadius:2,display:'block'}} />
                      : <div style={{width:64,height:48,background:'var(--line-s)',borderRadius:2}} />
                    }
                  </td>
                  <td><strong>{p.name}</strong></td>
                  <td>{p.area} м²</td>
                  <td>{p.floors}</td>
                  <td>{(p.features || []).join(', ') || '—'}</td>
                  <td>
                    <div style={{display:'flex',gap:8}}>
                      <button className="tbl-btn edit" onClick={() => { setEditing(p); setView('edit'); }}>Ред.</button>
                      <button className="tbl-btn del" onClick={() => setDeleteId(p.id)}>Удалить</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteId && (
        <div className="confirm-back" onClick={() => setDeleteId(null)}>
          <div className="confirm-box" onClick={e => e.stopPropagation()}>
            <h3>Удалить проект?</h3>
            <p>Это действие необратимо. Проект и все его данные будут удалены.</p>
            <div className="confirm-actions">
              <button className="pf-cancel" onClick={() => setDeleteId(null)}>Отмена</button>
              <button className="pf-save" style={{background:'var(--red)'}} onClick={() => handleDelete(deleteId)}>Удалить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
