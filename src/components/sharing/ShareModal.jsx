import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, FormControl, InputLabel, Select, MenuItem,
    Box, Typography, IconButton, Chip, Tooltip, CircularProgress,
    List, ListItem, ListItemText, ListItemSecondaryAction,
} from '@mui/material';
import { ContentCopy, Delete } from '@mui/icons-material';
import {
    createShareStart, clearLastCreatedShare,
    fetchSharesStart, revokeShareStart,
    createCorpusShareStart, clearLastCreatedCorpusShare,
    fetchCorpusSharesStart, revokeCorpusShareStart,
} from '../../store/sharing/sharingSlice';

const ShareModal = ({ open, onClose, targetId, targetName, shareType = 'subcorpus' }) => {
    const dispatch = useDispatch();
    const {
        shares, isSharesLoading, lastCreatedShare, isCreatingShare,
        corpusShares, isCorpusSharesLoading, lastCreatedCorpusShare, isCreatingCorpusShare,
    } = useSelector(state => state.sharing);

    const isCorpus = shareType === 'corpus';
    const activeShares = isCorpus ? corpusShares : shares;
    const activeLoading = isCorpus ? isCorpusSharesLoading : isSharesLoading;
    const activeLastCreated = isCorpus ? lastCreatedCorpusShare : lastCreatedShare;
    const activeCreating = isCorpus ? isCreatingCorpusShare : isCreatingShare;

    const [permissionLevel, setPermissionLevel] = useState('VIEW');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (open && targetId) {
            if (isCorpus) {
                dispatch(fetchCorpusSharesStart(targetId));
                dispatch(clearLastCreatedCorpusShare());
            } else {
                dispatch(fetchSharesStart(targetId));
                dispatch(clearLastCreatedShare());
            }
        }
    }, [open, targetId, isCorpus, dispatch]);

    const handleCreate = () => {
        if (isCorpus) {
            dispatch(createCorpusShareStart({
                corpusId: targetId,
                permission_level: permissionLevel,
            }));
        } else {
            dispatch(createShareStart({
                subcorpusId: targetId,
                permission_level: permissionLevel,
            }));
        }
    };

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRevoke = (shareId) => {
        if (isCorpus) {
            dispatch(revokeCorpusShareStart(shareId));
        } else {
            dispatch(revokeShareStart(shareId));
        }
    };

    const handleClose = () => {
        setPermissionLevel('VIEW');
        if (isCorpus) {
            dispatch(clearLastCreatedCorpusShare());
        } else {
            dispatch(clearLastCreatedShare());
        }
        onClose();
    };

    const colors = {
        bgMain: '#F0ECE1',
        textBrown: '#5A3E29',
        btnOutline: '#677424',
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ bgcolor: colors.bgMain, color: colors.textBrown, fontWeight: 'bold' }}>
                Поділитися{isCorpus ? ' корпусом' : ''}: {targetName}
            </DialogTitle>
            <DialogContent sx={{ bgcolor: colors.bgMain }}>
                <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ color: colors.textBrown, mb: 1, fontWeight: 'bold' }}>
                        Згенерувати код доступу
                    </Typography>

                    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                        <InputLabel>Рівень доступу</InputLabel>
                        <Select
                            value={permissionLevel}
                            onChange={(e) => setPermissionLevel(e.target.value)}
                            label="Рівень доступу"
                        >
                            <MenuItem value="VIEW">Перегляд</MenuItem>
                            <MenuItem value="EDIT">Редагування</MenuItem>
                        </Select>
                    </FormControl>

                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleCreate}
                        disabled={activeCreating}
                        sx={{ bgcolor: colors.btnOutline, '&:hover': { bgcolor: '#5A632C' }, textTransform: 'none', mb: 2 }}
                    >
                        {activeCreating ? <CircularProgress size={20} /> : 'Згенерувати код'}
                    </Button>

                    {activeLastCreated && (
                        <Box sx={{ p: 2, bgcolor: '#e8f5e9', borderRadius: 1, mb: 3 }}>
                            <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                                Код доступу:
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="h6" sx={{ fontFamily: 'monospace', letterSpacing: 2 }}>
                                    {activeLastCreated.access_code}
                                </Typography>
                                <Tooltip title={copied ? 'Скопійовано!' : 'Копіювати код'}>
                                    <IconButton size="small" onClick={() => handleCopyCode(activeLastCreated.access_code)}>
                                        <ContentCopy fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>
                    )}

                    {/* Active shares list */}
                    <Typography variant="subtitle2" sx={{ color: colors.textBrown, mt: 2, mb: 1, fontWeight: 'bold' }}>
                        Активні коди
                    </Typography>

                    {activeLoading ? (
                        <CircularProgress size={24} />
                    ) : activeShares.length === 0 ? (
                        <Typography variant="body2" sx={{ color: '#888' }}>
                            Немає активних кодів.
                        </Typography>
                    ) : (
                        <List dense>
                            {activeShares.filter(s => s.is_active).map((share) => (
                                <ListItem key={share.id} sx={{ px: 0 }}>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                                    {share.access_code}
                                                </Typography>
                                                <Chip
                                                    label={share.permission_level === 'EDIT' ? 'Редагування' : 'Перегляд'}
                                                    size="small"
                                                    color={share.permission_level === 'EDIT' ? 'warning' : 'default'}
                                                />
                                            </Box>
                                        }
                                        secondary={`Використано: ${share.use_count}`}
                                    />
                                    <ListItemSecondaryAction>
                                        <Tooltip title="Копіювати код">
                                            <IconButton size="small" onClick={() => handleCopyCode(share.access_code)}>
                                                <ContentCopy fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Відкликати">
                                            <IconButton size="small" onClick={() => handleRevoke(share.id)} color="error">
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>
            </DialogContent>
            <DialogActions sx={{ bgcolor: colors.bgMain, p: 2 }}>
                <Button onClick={handleClose} sx={{ color: colors.textBrown, fontWeight: 'bold' }}>
                    Закрити
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ShareModal;
