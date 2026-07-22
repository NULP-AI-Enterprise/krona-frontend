import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box, Tabs, Tab, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, Select, MenuItem,
    FormControl, InputLabel, Typography, IconButton, Alert,
    CircularProgress, TablePagination,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import {
    fetchUsersStart, createUserStart, updateUserRoleStart,
    deleteUserStart, fetchAdminCorporaStart, deleteCorpusStart,
    clearAdminErrors,
} from '../store/admin/adminSlice';

const ROLES = [
    { value: 'SUPER_ADMIN', label: 'Супер Адмін' },
    { value: 'ADMIN', label: 'Адмін' },
    { value: 'COMPILER', label: 'Укладач' },
    { value: 'USER', label: 'Користувач' },
];

const colors = {
    bgMain: 'var(--color-bg-light, #F0ECE1)',
    accent: 'var(--color-accent-green, #677424)',
    textBrown: 'var(--color-text-main, #5A3E29)',
    btnHover: 'var(--color-btn-hover, #40342B)',
    bgSecondary: 'var(--color-bg-main, #BBC191)',
};

const AdminPanel = () => {
    const dispatch = useDispatch();
    const {
        users, isUsersLoading, usersError,
        isCreatingUser, createUserError,
        updateUserError, deleteUserError,
        corpora, isCorporaLoading, corporaError,
        deleteCorpusError,
    } = useSelector((state) => state.admin);

    const [tab, setTab] = useState(0);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [newUser, setNewUser] = useState({ email: '', full_name: '', phone_number: '', password: '', role: 'USER' });
    const [usersPage, setUsersPage] = useState(0);
    const [usersRowsPerPage, setUsersRowsPerPage] = useState(10);
    const [corporaPage, setCorporaPage] = useState(0);
    const [corporaRowsPerPage, setCorporaRowsPerPage] = useState(10);

    const currentUserRole = localStorage.getItem('user_role');
    const isAuthorized = ['SUPER_ADMIN', 'ADMIN'].includes(currentUserRole);

    useEffect(() => {
        if (isAuthorized) {
            dispatch(fetchUsersStart());
            dispatch(fetchAdminCorporaStart());
        }
    }, [dispatch, isAuthorized]);

    if (!isAuthorized) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <Typography variant="h5" sx={{ color: colors.textBrown }}>
                    Доступ заборонено
                </Typography>
            </Box>
        );
    }

    const canManageUser = (targetRole) => {
        if (currentUserRole === 'SUPER_ADMIN') return targetRole !== 'SUPER_ADMIN';
        if (currentUserRole === 'ADMIN') return !['SUPER_ADMIN', 'ADMIN'].includes(targetRole);
        return false;
    };

    const getAssignableRoles = () => {
        if (currentUserRole === 'SUPER_ADMIN') return ROLES.filter(r => r.value !== 'SUPER_ADMIN');
        return ROLES.filter(r => !['SUPER_ADMIN', 'ADMIN'].includes(r.value));
    };

    const handleCreateUser = () => {
        dispatch(createUserStart(newUser));
        setCreateDialogOpen(false);
        setNewUser({ email: '', full_name: '', phone_number: '', password: '', role: 'USER' });
    };

    const handleRoleChange = (userId, newRole) => {
        dispatch(updateUserRoleStart({ id: userId, role: newRole }));
    };

    const handleDeleteUser = (userId, userName) => {
        if (window.confirm(`Видалити користувача "${userName}"?`)) {
            dispatch(deleteUserStart(userId));
        }
    };

    const handleDeleteCorpus = (corpusId, corpusName) => {
        if (window.confirm(`Видалити корпус "${corpusName}" та всі його тексти?`)) {
            dispatch(deleteCorpusStart(corpusId));
        }
    };

    const errorMsg = usersError || createUserError || updateUserError || deleteUserError || corporaError || deleteCorpusError;

    return (
        <Box sx={{ p: 3, bgcolor: colors.bgMain, minHeight: '80vh' }}>
            <Typography variant="h4" sx={{ color: colors.textBrown, mb: 3, fontWeight: 600 }}>
                Адмін панель
            </Typography>

            {errorMsg && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearAdminErrors())}>
                    {errorMsg}
                </Alert>
            )}

            <Tabs
                value={tab}
                onChange={(_, newVal) => setTab(newVal)}
                sx={{
                    mb: 3,
                    '& .MuiTab-root': { color: colors.textBrown },
                    '& .Mui-selected': { color: colors.accent },
                    '& .MuiTabs-indicator': { backgroundColor: colors.accent },
                }}
            >
                <Tab label="Користувачі" />
                <Tab label="Контент" />
            </Tabs>

            {/* USERS TAB */}
            {tab === 0 && (
                <Box>
                    <Button
                        variant="contained"
                        startIcon={<PersonAddIcon />}
                        onClick={() => setCreateDialogOpen(true)}
                        sx={{ mb: 2, bgcolor: colors.accent, '&:hover': { bgcolor: colors.btnHover } }}
                    >
                        Створити користувача
                    </Button>

                    {isUsersLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress sx={{ color: colors.accent }} />
                        </Box>
                    ) : (
                        <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: colors.bgSecondary }}>
                                        <TableCell sx={{ color: colors.textBrown, fontWeight: 600 }}>Ім'я</TableCell>
                                        <TableCell sx={{ color: colors.textBrown, fontWeight: 600 }}>Email</TableCell>
                                        <TableCell sx={{ color: colors.textBrown, fontWeight: 600 }}>Телефон</TableCell>
                                        <TableCell sx={{ color: colors.textBrown, fontWeight: 600 }}>Роль</TableCell>
                                        <TableCell sx={{ color: colors.textBrown, fontWeight: 600 }}>Дата реєстрації</TableCell>
                                        <TableCell sx={{ color: colors.textBrown, fontWeight: 600 }}>Дії</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {users
                                        .slice(usersPage * usersRowsPerPage, usersPage * usersRowsPerPage + usersRowsPerPage)
                                        .map((user) => (
                                            <TableRow key={user.id} hover>
                                                <TableCell>{user.full_name}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>{user.phone_number}</TableCell>
                                                <TableCell>
                                                    {canManageUser(user.role) ? (
                                                        <Select
                                                            value={user.role}
                                                            size="small"
                                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                            sx={{ minWidth: 140 }}
                                                        >
                                                            {getAssignableRoles().map((r) => (
                                                                <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
                                                            ))}
                                                        </Select>
                                                    ) : (
                                                        <Typography variant="body2" sx={{ color: colors.textBrown }}>
                                                            {ROLES.find(r => r.value === user.role)?.label || user.role}
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(user.date_joined).toLocaleDateString('uk-UA')}
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton
                                                        onClick={() => handleDeleteUser(user.id, user.full_name)}
                                                        disabled={!canManageUser(user.role)}
                                                        sx={{ color: canManageUser(user.role) ? '#d32f2f' : '#ccc' }}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                            <TablePagination
                                component="div"
                                count={users.length}
                                page={usersPage}
                                onPageChange={(_, newPage) => setUsersPage(newPage)}
                                rowsPerPage={usersRowsPerPage}
                                onRowsPerPageChange={(e) => { setUsersRowsPerPage(parseInt(e.target.value, 10)); setUsersPage(0); }}
                                rowsPerPageOptions={[10, 25, 50]}
                                labelRowsPerPage="Рядків на сторінці:"
                            />
                        </TableContainer>
                    )}

                    {/* Create User Dialog */}
                    <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
                        <DialogTitle sx={{ color: colors.textBrown }}>Створити користувача</DialogTitle>
                        <DialogContent>
                            <TextField
                                label="Email"
                                fullWidth
                                margin="normal"
                                value={newUser.email}
                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            />
                            <TextField
                                label="Повне ім'я"
                                fullWidth
                                margin="normal"
                                value={newUser.full_name}
                                onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                            />
                            <TextField
                                label="Номер телефону"
                                fullWidth
                                margin="normal"
                                value={newUser.phone_number}
                                onChange={(e) => setNewUser({ ...newUser, phone_number: e.target.value })}
                            />
                            <TextField
                                label="Пароль"
                                type="password"
                                fullWidth
                                margin="normal"
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            />
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Роль</InputLabel>
                                <Select
                                    value={newUser.role}
                                    label="Роль"
                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                >
                                    {getAssignableRoles().map((r) => (
                                        <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setCreateDialogOpen(false)} sx={{ color: colors.textBrown }}>
                                Скасувати
                            </Button>
                            <Button
                                onClick={handleCreateUser}
                                variant="contained"
                                disabled={isCreatingUser || !newUser.email || !newUser.password || !newUser.full_name || !newUser.phone_number}
                                sx={{ bgcolor: colors.accent, '&:hover': { bgcolor: colors.btnHover } }}
                            >
                                Створити
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Box>
            )}

            {/* CONTENT TAB */}
            {tab === 1 && (
                <Box>
                    {isCorporaLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress sx={{ color: colors.accent }} />
                        </Box>
                    ) : (
                        <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: colors.bgSecondary }}>
                                        <TableCell sx={{ color: colors.textBrown, fontWeight: 600 }}>Назва</TableCell>
                                        <TableCell sx={{ color: colors.textBrown, fontWeight: 600 }}>Тип</TableCell>
                                        <TableCell sx={{ color: colors.textBrown, fontWeight: 600 }}>Мова</TableCell>
                                        <TableCell sx={{ color: colors.textBrown, fontWeight: 600 }}>Автор</TableCell>
                                        <TableCell sx={{ color: colors.textBrown, fontWeight: 600 }}>Текстів</TableCell>
                                        <TableCell sx={{ color: colors.textBrown, fontWeight: 600 }}>Дії</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {corpora
                                        .slice(corporaPage * corporaRowsPerPage, corporaPage * corporaRowsPerPage + corporaRowsPerPage)
                                        .map((corpus) => (
                                            <TableRow key={corpus.id} hover>
                                                <TableCell>{corpus.name}</TableCell>
                                                <TableCell>{corpus.type}</TableCell>
                                                <TableCell>{corpus.language}</TableCell>
                                                <TableCell>{corpus.creator_name || '—'}</TableCell>
                                                <TableCell>{corpus.text_count}</TableCell>
                                                <TableCell>
                                                    <IconButton
                                                        onClick={() => handleDeleteCorpus(corpus.id, corpus.name)}
                                                        sx={{ color: '#d32f2f' }}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                            <TablePagination
                                component="div"
                                count={corpora.length}
                                page={corporaPage}
                                onPageChange={(_, newPage) => setCorporaPage(newPage)}
                                rowsPerPage={corporaRowsPerPage}
                                onRowsPerPageChange={(e) => { setCorporaRowsPerPage(parseInt(e.target.value, 10)); setCorporaPage(0); }}
                                rowsPerPageOptions={[10, 25, 50]}
                                labelRowsPerPage="Рядків на сторінці:"
                            />
                        </TableContainer>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default AdminPanel;
