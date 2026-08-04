import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert, CircularProgress, Paper } from '@mui/material';
import api from '../utils/api';

const ShareRedeem = () => {
    const navigate = useNavigate();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!code.trim()) return;

        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const response = await api.post('shares/redeem/', { access_code: code.trim() });
            setSuccess(response.data);
        } catch (err) {
            const msg = err.response?.data?.error || 'Помилка при активації коду доступу.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 500, mx: 'auto', mt: 6 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom>
                    Активувати код доступу
                </Typography>

                {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {success.type === 'corpus'
                            ? <>Доступ надано до корпусу <strong>{success.corpus_name}</strong> ({success.access_level})</>
                            : <>Доступ надано до підкорпусу <strong>{success.subcorpus_name}</strong> ({success.permission_level === 'EDIT' ? 'Редагування' : 'Перегляд'})</>
                        }
                    </Alert>
                )}

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Код доступу"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        fullWidth
                        inputProps={{ maxLength: 8 }}
                        sx={{ mb: 2 }}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={loading || !code.trim()}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Активувати'}
                    </Button>
                </form>

                {success && (
                    <Button
                        variant="outlined"
                        fullWidth
                        sx={{ mt: 2 }}
                        onClick={() => navigate('/corpus-manager')}
                    >
                        Перейти до менеджера корпусів
                    </Button>
                )}
            </Paper>
        </Box>
    );
};

export default ShareRedeem;
