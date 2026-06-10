import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import { register } from '../api/auth';

export default function RegisterPage() {
  if (localStorage.getItem('token')) return <Navigate to="/admin" replace />;

  const nav = useNavigate();
  const [form, setForm]       = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [errors, setErrors]   = useState({});
  const [globalErr, setGlobalErr] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Введите имя';
    if (!form.email.trim()) errs.email = 'Введите e-mail';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Некорректный e-mail';
    if (!form.password) errs.password = 'Введите пароль';
    else if (form.password.length < 8) errs.password = 'Минимум 8 символов';
    if (form.password !== form.password_confirmation) errs.password_confirmation = 'Пароли не совпадают';
    return errs;
  };

  const submit = async (e) => {
    e.preventDefault();
    setGlobalErr('');
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const { data } = await register(form);
      localStorage.setItem('token', data.token);
      nav('/admin');
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
      } else {
        setGlobalErr(err.response?.data?.message || 'Ошибка при регистрации');
      }
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'name',                  type: 'text',     placeholder: 'Ваше имя',       auto: 'name' },
    { key: 'email',                 type: 'email',    placeholder: 'E-mail',          auto: 'email' },
    { key: 'password',              type: 'password', placeholder: 'Пароль',          auto: 'new-password' },
    { key: 'password_confirmation', type: 'password', placeholder: 'Повторите пароль', auto: 'new-password' },
  ];

  return (
    <AuthLayout footerText="Уже есть аккаунт?" footerLink="/login" footerLinkText="Войти">
      <div className="albl">Регистрация</div>
      <h1>Создать аккаунт</h1>
      <p className="asub">Доступ к панели управления ВУДСОКОЛ</p>

      {globalErr && <div className="auth-global-err">{globalErr}</div>}

      <form onSubmit={submit} noValidate>
        {fields.map(({ key, type, placeholder, auto }) => (
          <div key={key} className="auth-field">
            <input
              type={type}
              placeholder={placeholder}
              value={form[key]}
              onChange={set(key)}
              className={errors[key] ? 'err' : ''}
              autoComplete={auto}
            />
            {errors[key] && <span className="field-err">{Array.isArray(errors[key]) ? errors[key][0] : errors[key]}</span>}
          </div>
        ))}
        <button type="submit" className="auth-btn" disabled={loading}>
          {loading ? 'Создаём аккаунт…' : 'Зарегистрироваться'}
        </button>
      </form>
    </AuthLayout>
  );
}
