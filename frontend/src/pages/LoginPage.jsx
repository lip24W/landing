import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import { login } from '../api/auth';

export default function LoginPage() {
  if (localStorage.getItem('token')) return <Navigate to="/admin" replace />;

  const nav = useNavigate();
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors]   = useState({});
  const [globalErr, setGlobalErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});
    setGlobalErr('');

    const errs = {};
    if (!email.trim()) errs.email = 'Введите e-mail';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Некорректный e-mail';
    if (!password) errs.password = 'Введите пароль';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const { data } = await login({ email, password });
      localStorage.setItem('token', data.token);
      nav('/admin');
    } catch (err) {
      const msg = err.response?.data?.message;
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
      } else {
        setGlobalErr(msg || 'Неверный e-mail или пароль');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout footerText="Нет аккаунта?" footerLink="/register" footerLinkText="Зарегистрироваться">
      <div className="albl">Вход в систему</div>
      <h1>Добро пожаловать</h1>
      <p className="asub">Введите данные для входа в панель управления</p>

      {globalErr && <div className="auth-global-err">{globalErr}</div>}

      <form onSubmit={submit} noValidate>
        <div className="auth-field">
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={errors.email ? 'err' : ''}
            autoComplete="email"
          />
          {errors.email && <span className="field-err">{errors.email}</span>}
        </div>
        <div className="auth-field">
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className={errors.password ? 'err' : ''}
            autoComplete="current-password"
          />
          {errors.password && <span className="field-err">{errors.password}</span>}
        </div>
        <button type="submit" className="auth-btn" disabled={loading}>
          {loading ? 'Вход…' : 'Войти'}
        </button>
      </form>
    </AuthLayout>
  );
}
