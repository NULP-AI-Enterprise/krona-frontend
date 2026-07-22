import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Register.css';

const Login = () => {
    const [formData, setFormData] = useState({
        identifier: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:8000/api/auth/login/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('access_token', data.access);
                localStorage.setItem('refresh_token', data.refresh);
                localStorage.setItem('user_full_name', data.user_full_name);
                localStorage.setItem('user_email', data.user_email);
                localStorage.setItem('user_role', data.user_role);

                localStorage.removeItem('concordance_selected_collection');
                window.location.href = '/';
            } else {
                setErrorMsg(data.detail || 'Помилка авторизації. Перевірте дані.');
            }
        } catch (error) {
            console.error('Помилка:', error);
            setErrorMsg('Помилка з\'єднання з сервером');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <div className="auth-header">
                    <h2 className="auth-title" style={{ textAlign: 'center' }}>Вхід в обліковий запис</h2>
                </div>

                {errorMsg && <div style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>{errorMsg}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Пошта чи номер телефону</label>
                        <input
                            type="text"
                            name="identifier"
                            className="form-control"
                            value={formData.identifier}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Пароль</label>
                        <div className="password-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                className="form-control"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '15px' }}>
                        <button type="submit" className="btn-auth" disabled={isLoading}>
                            {isLoading ? 'Завантаження...' : 'Увійти'}
                        </button>
                    </div>
                </form>

                <div className="auth-footer">
                    Не маєте облікового запису? <Link to="/register" className="auth-link">Зареєструйтесь</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;