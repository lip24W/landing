import { useState, useEffect } from 'react';

const FEATURE_SUGGESTIONS = ['Сауна', 'Кабинет', 'Игровая', 'Гардероб', 'Терраса', 'Гараж', 'Бассейн', 'Библиотека'];

export default function ProjectForm({ initial = null, onSave, onCancel, loading }) {
  const [form, setForm] = useState({
    name: '',
    area: '',
    floors: '1',
    living: '',
    terrace: '',
    features: [],       // key features like "4 спальни", "Сауна" etc.
    bed: '',
    bath: '',
    // plan modal fields
    plan_area: '',
    plan_floors: '1',
    plan_bed: '',
    plan_bath: '',
    photo: null,
    floor_plans: [],    // array of File or existing URL per floor
  });
  const [featureInput, setFeatureInput] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [planPreviews, setPlanPreviews] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initial) {
      const features = initial.features || [];
      setForm({
        name: initial.name || '',
        area: initial.area || '',
        floors: String(initial.floors || 1),
        living: initial.living || '',
        terrace: initial.terrace || '',
        features,
        bed: initial.bed || '',
        bath: initial.bath || '',
        plan_area: initial.plan_area || initial.area || '',
        plan_floors: String(initial.plan_floors || initial.floors || 1),
        plan_bed: initial.plan_bed || initial.bed || '',
        plan_bath: initial.plan_bath || initial.bath || '',
        photo: null,
        floor_plans: [],
      });
      setPhotoPreview(initial.photo_url || null);
      setPlanPreviews((initial.plans || []).map(p => ({ preview: p, file: null })));
    }
  }, [initial]);

  /* sync plan floors count with floor_plans array */
  const planFloorsCount = parseInt(form.plan_floors) || 1;
  useEffect(() => {
    setPlanPreviews(prev => {
      const arr = [...prev];
      while (arr.length < planFloorsCount) arr.push({ preview: null, file: null });
      return arr.slice(0, planFloorsCount);
    });
  }, [planFloorsCount]);

  const set = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const addFeature = (val) => {
    const v = val.trim();
    if (!v || form.features.includes(v)) return;
    setForm(prev => ({ ...prev, features: [...prev.features, v] }));
    setFeatureInput('');
  };

  const removeFeature = (f) => setForm(prev => ({ ...prev, features: prev.features.filter(x => x !== f) }));

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm(prev => ({ ...prev, photo: file }));
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handlePlanPhoto = (idx, e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPlanPreviews(prev => {
      const arr = [...prev];
      arr[idx] = { preview: URL.createObjectURL(file), file };
      return arr;
    });
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Введите название проекта';
    if (!form.area || isNaN(form.area)) errs.area = 'Введите площадь (число)';
    if (!form.living || isNaN(form.living)) errs.living = 'Введите жилую площадь';
    if (!initial && !form.photo) errs.photo = 'Загрузите фотографию проекта';
    return errs;
  };

  const submit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === 'photo' && v) fd.append('photo', v);
      else if (k === 'features') fd.append('features', JSON.stringify(v));
      else if (k !== 'floor_plans' && k !== 'photo') fd.append(k, v);
    });
    planPreviews.forEach((p, i) => {
      if (p.file) fd.append(`floor_plans[${i}]`, p.file);
    });
    onSave(fd);
  };

  const inputCls = (field) => `af-inp${errors[field] ? ' err' : ''}`;

  return (
    <form onSubmit={submit} encType="multipart/form-data">
      <div className="pf-section-title">Основная информация</div>

      {/* PHOTO */}
      <div className="pf-field">
        <label className="pf-label">Фотография проекта {!initial && <span className="pf-req">*</span>}</label>
        <div className={`pf-upload${errors.photo ? ' err' : ''}`} onClick={() => document.getElementById('pf-photo').click()}>
          {photoPreview
            ? <img src={photoPreview} alt="preview" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:2}} />
            : <div className="pf-upload-placeholder">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="var(--muted)" strokeWidth="1.4">
                  <rect x="2" y="6" width="28" height="20" rx="2"/><circle cx="10" cy="13" r="3"/><path d="M2 22l8-6 6 4 5-4 9 6"/>
                </svg>
                <span>Нажмите, чтобы загрузить фото</span>
                <span style={{fontSize:12,color:'var(--muted)'}}>Без ограничений по размеру</span>
              </div>
          }
        </div>
        <input id="pf-photo" type="file" accept="image/*" hidden onChange={handlePhoto} />
        {errors.photo && <span className="pf-err">{errors.photo}</span>}
      </div>

      {/* NAME */}
      <div className="pf-field">
        <label className="pf-label">Название проекта <span className="pf-req">*</span></label>
        <input className={inputCls('name')} type="text" placeholder="ВУДСОКОЛ 251" value={form.name} onChange={set('name')} />
        {errors.name && <span className="pf-err">{errors.name}</span>}
      </div>

      <div className="pf-row">
        <div className="pf-field">
          <label className="pf-label">Кол-во этажей</label>
          <select className="af-inp" value={form.floors} onChange={set('floors')}>
            <option value="1">1 этаж</option>
            <option value="2">2 этажа</option>
            <option value="3">3 этажа</option>
          </select>
        </div>
        <div className="pf-field">
          <label className="pf-label">Общая площадь (м²) <span className="pf-req">*</span></label>
          <input className={inputCls('area')} type="number" min="1" placeholder="251" value={form.area} onChange={set('area')} />
          {errors.area && <span className="pf-err">{errors.area}</span>}
        </div>
        <div className="pf-field">
          <label className="pf-label">Жилая площадь (м²) <span className="pf-req">*</span></label>
          <input className={inputCls('living')} type="number" min="1" placeholder="169" value={form.living} onChange={set('living')} />
          {errors.living && <span className="pf-err">{errors.living}</span>}
        </div>
        <div className="pf-field">
          <label className="pf-label">Терраса (м², 0 если нет)</label>
          <input className="af-inp" type="number" min="0" placeholder="24" value={form.terrace} onChange={set('terrace')} />
        </div>
      </div>

      <div className="pf-row">
        <div className="pf-field">
          <label className="pf-label">Спальни</label>
          <input className="af-inp" type="number" min="0" placeholder="4" value={form.bed} onChange={set('bed')} />
        </div>
        <div className="pf-field">
          <label className="pf-label">Санузлы</label>
          <input className="af-inp" type="number" min="0" placeholder="2" value={form.bath} onChange={set('bath')} />
        </div>
      </div>

      {/* FEATURES */}
      <div className="pf-field">
        <label className="pf-label">Ключевые особенности</label>
        <div className="pf-tags">
          {form.features.map(f => (
            <span key={f} className="pf-tag">
              {f}
              <button type="button" className="pf-tag-del" onClick={() => removeFeature(f)}>×</button>
            </span>
          ))}
        </div>
        <div className="pf-feature-row">
          <input
            className="af-inp"
            type="text"
            placeholder="Например: Гараж"
            value={featureInput}
            onChange={e => setFeatureInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addFeature(featureInput); } }}
          />
          <button type="button" className="pf-add-btn" onClick={() => addFeature(featureInput)}>+ Добавить</button>
        </div>
        <div className="pf-suggestions">
          {FEATURE_SUGGESTIONS.filter(s => !form.features.includes(s)).map(s => (
            <button key={s} type="button" className="pf-suggestion" onClick={() => addFeature(s)}>{s}</button>
          ))}
        </div>
      </div>

      {/* PLANS SECTION */}
      <div className="pf-divider" />
      <div className="pf-section-title">Данные для модального окна «Планировки»</div>

      <div className="pf-row">
        <div className="pf-field">
          <label className="pf-label">Площадь (м²)</label>
          <input className="af-inp" type="number" min="1" placeholder="251" value={form.plan_area} onChange={set('plan_area')} />
        </div>
        <div className="pf-field">
          <label className="pf-label">Кол-во этажей</label>
          <select className="af-inp" value={form.plan_floors} onChange={set('plan_floors')}>
            <option value="1">1 этаж</option>
            <option value="2">2 этажа</option>
            <option value="3">3 этажа</option>
          </select>
        </div>
        <div className="pf-field">
          <label className="pf-label">Спальни</label>
          <input className="af-inp" type="number" min="0" placeholder="4" value={form.plan_bed} onChange={set('plan_bed')} />
        </div>
        <div className="pf-field">
          <label className="pf-label">Санузлы</label>
          <input className="af-inp" type="number" min="0" placeholder="2" value={form.plan_bath} onChange={set('plan_bath')} />
        </div>
      </div>

      {/* FLOOR PLAN PHOTOS */}
      <div className="pf-field">
        <label className="pf-label">Фотографии планировок по этажам</label>
        <div className="pf-plan-photos">
          {Array.from({ length: planFloorsCount }, (_, i) => (
            <div key={i} className="pf-plan-slot" onClick={() => document.getElementById(`pf-plan-${i}`).click()}>
              {planPreviews[i]?.preview
                ? <img src={planPreviews[i].preview} alt={`${i+1} этаж`} style={{width:'100%',height:'100%',objectFit:'contain',background:'#FBFAF7'}} />
                : <div className="pf-plan-ph">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.4"><rect x="3" y="3" width="18" height="18"/><path d="M3 9h18M9 3v18"/></svg>
                    <span>{i + 1} этаж</span>
                  </div>
              }
              <input id={`pf-plan-${i}`} type="file" accept="image/*" hidden onChange={(e) => handlePlanPhoto(i, e)} />
            </div>
          ))}
        </div>
      </div>

      <div className="pf-actions">
        <button type="button" className="pf-cancel" onClick={onCancel}>Отмена</button>
        <button type="submit" className="pf-save" disabled={loading}>
          {loading ? 'Сохранение…' : initial ? 'Сохранить изменения' : 'Создать проект'}
        </button>
      </div>
    </form>
  );
}
