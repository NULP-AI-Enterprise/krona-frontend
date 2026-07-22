import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Register.css';

const Register = () => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone_number: '',
        password: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (formData.password !== formData.confirmPassword) {
            setErrorMsg("Паролі не співпадають!");
            return;
        }

        setIsLoading(true);

        try {
            const { confirmPassword, ...dataToSend } = formData;

            const response = await fetch('http://localhost:8000/api/auth/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend)
            });

            const data = await response.json();

            if (response.ok) {
                // Auto-login: save tokens and user info
                if (data.access && data.refresh) {
                    localStorage.setItem('access_token', data.access);
                    localStorage.setItem('refresh_token', data.refresh);
                    localStorage.setItem('user_full_name', data.user_full_name);
                    localStorage.setItem('user_email', data.user_email);
                    localStorage.setItem('user_role', data.user_role);

                    localStorage.removeItem('concordance_selected_collection');
                }

                setSuccessMsg('Реєстрація успішна! Входимо...');
                setTimeout(() => {

                    window.location.href = '/';
                }, 1000);
            } else {
                let errorText = 'Сталася помилка при реєстрації.';
                if (typeof data === 'object') {
                    errorText = Object.values(data).flat().join(' '); 
                }
                setErrorMsg(errorText);
            }
        } catch (error) {
            console.error('Помилка:', error);
            setErrorMsg('Помилка з\'єднання з сервером. Перевірте підключення.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <div className="auth-header">
                    <h2 className="auth-title">Реєстрація</h2>
                </div>

                {errorMsg && <div style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>{errorMsg}</div>}
                {successMsg && <div style={{ color: 'green', textAlign: 'center', marginBottom: '15px' }}>{successMsg}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Пошта<span className="required-star">*</span></label>
                        <input
                            type="email"
                            name="email"
                            className="form-control"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Ім’я<span className="required-star">*</span></label>
                        <input
                            type="text"
                            name="full_name"  
                            className="form-control"
                            value={formData.full_name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Номер телефону<span className="required-star">*</span></label>
                        <input
                            type="tel"
                            name="phone_number" 
                            className="form-control"
                            value={formData.phone_number}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Пароль<span className="required-star">*</span></label>
                        <div className="password-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                className="form-control"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength="8" 
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

                    <div className="form-group">
                        <label className="form-label">Підтвердити пароль<span className="required-star">*</span></label>
                        <div className="password-wrapper">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                className="form-control"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <button type="submit" className="btn-auth" disabled={isLoading}>
                            {isLoading ? 'Завантаження...' : 'Зареєструватись'}
                        </button>
                    </div>
                </form>

                <div className="auth-footer">
                    Маєте обліковий запис? <Link to="/login" className="auth-link">Увійдіть</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
