import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box, Typography, List, ListItem, ListItemText, ListItemIcon,
    Chip, CircularProgress, Radio, IconButton,
} from '@mui/material';
import { MenuBook } from '@mui/icons-material';
import { fetchSharedWithMeStart } from '../../store/sharing/sharingSlice';

const SharedWithMePanel = ({ onSelectSubcorpus, onViewTexts, selectedNode }) => {
    const dispatch = useDispatch();
    const { sharedWithMe, isSharedWithMeLoading } = useSelector(state => state.sharing);

    useEffect(() => {
        dispatch(fetchSharedWithMeStart());
    }, [dispatch]);

    const colors = {
        textBrown: '#5A3E29',
        btnOutline: '#677424',
    };

    if (isSharedWithMeLoading) {
        return (
            <Box sx={{ p: 2, textAlign: 'center' }}>
                <CircularProgress size={24} />
            </Box>
        );
    }

    if (sharedWithMe.length === 0) {
        return null;
    }

    return (
        <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" sx={{ color: colors.textBrown, fontWeight: 'bold', mb: 1 }}>
                Поділилися з вами
            </Typography>
            <List sx={{ p: 0 }}>
                {sharedWithMe.map((grant) => (
                    <ListItem key={grant.id} sx={{ pl: 2, pr: 1, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                            <Radio
                                edge="start"
                                checked={
                                    selectedNode?.type === 'subcorpus' &&
                                    selectedNode?.id === grant.subcorpus_id &&
                                    selectedNode?.subType === 'user'
                                }
                                onChange={() => onSelectSubcorpus(grant)}
                                sx={{ color: colors.btnOutline, '&.Mui-checked': { color: colors.btnOutline } }}
                            />
                        </ListItemIcon>
                        <ListItemText
                            primary={grant.subcorpus_name}
                            secondary={`${grant.corpus_name} · ${grant.owner_name}`}
                            primaryTypographyProps={{ color: colors.textBrown, fontWeight: 'bold', fontSize: '0.9rem' }}
                            secondaryTypographyProps={{ fontSize: '0.75rem' }}
                        />
                        <Chip
                            label={grant.permission_level === 'EDIT' ? 'Ред.' : 'Перегляд'}
                            size="small"
                            color={grant.permission_level === 'EDIT' ? 'warning' : 'default'}
                            sx={{ mr: 1 }}
                        />
                        <IconButton
                            size="small"
                            onClick={() => onViewTexts(grant)}
                            sx={{ color: colors.textBrown }}
                            title="Переглянути тексти"
                        >
                            <MenuBook fontSize="small" />
                        </IconButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default SharedWithMePanel;
