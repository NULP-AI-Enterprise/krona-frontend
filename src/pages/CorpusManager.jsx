import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelected } from '../store/concordance/concordanceSlice';

import {
    Box, Button,
    Radio,
    Collapse,
    Drawer,
    IconButton,
    InputAdornment,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    MenuItem,
    Select,
    TextField,
    Typography,
    FormControl,
    InputLabel,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Menu,
    Divider, Snackbar, Alert,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Paper
} from '@mui/material';

import {
    ExpandMore,
    KeyboardArrowRight,
    MoreVert,
    Search,
    CloudUpload,
    Edit,
    Delete,
    CreateNewFolder,
    PostAdd,
    MenuBook,
    Info,
    Share,
    VpnKey,
} from '@mui/icons-material';

import ShareModal from '../components/sharing/ShareModal';
import { fetchSharedWithMeStart, fetchSharedCorporaWithMeStart } from '../store/sharing/sharingSlice';
import { getCurrentUser, hasRole } from '../utils/auth';
import api from '../utils/api';

import {
    fetchCorporaListStart,
    fetchMetadataOptionsStart,
    setFilterValue,
    clearFilters,
    createFilteredSubcorpusStart,
    createCorpusStart,
    createTextStart,
    fetchTextMetadataOptionsStart,
    createUserSubcorpusStart,
    deleteNodeStart,
    fetchTextsStart,
    clearTextsList,
    resetTextCreated,
    deleteTextStart,
    resetCorpusCreated,
    resetSubcorpusCreated,
    resetUserSubcorpusCreated,
    resetNodeDeleted,
} from '../store/corpusmanager/corpusSlice';

// --- HELPERS (Metadata display) ---
const formatDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return date.toLocaleString('uk-UA', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

const MetaRow = ({ label, value }) => {
    const isEmpty = value === null || value === undefined || value === '' ||
        (Array.isArray(value) && value.length === 0);
    if (isEmpty) return null;

    return (
        <Box sx={{ display: 'flex', py: 1, borderBottom: '1px solid rgba(90, 62, 41, 0.15)' }}>
            <Typography sx={{ width: '45%', fontWeight: 'bold', flexShrink: 0 }}>{label}</Typography>
            <Typography sx={{ width: '55%', wordBreak: 'break-word' }}>{value}</Typography>
        </Box>
    );
};

// Resolves raw filter-criteria ids/codes (used to build a filtered subcorpus) into readable rows
const FilterCriteriaRows = ({ filters, metadataOptions }) => {
    if (!filters || Object.keys(filters).length === 0) {
        return (
            <Typography sx={{ fontStyle: 'italic', opacity: 0.7 }}>
                Дані про застосовані фільтри відсутні.
            </Typography>
        );
    }

    const allGenres = (metadataOptions?.styles_with_genres || []).flatMap(s => s.genres || []);

    const styleNames = (filters.styles || [])
        .map(id => metadataOptions?.styles_with_genres?.find(s => s.id === id)?.name)
        .filter(Boolean).join(', ');

    const genreNames = (filters.genres || [])
        .map(id => allGenres.find(g => g.id === id)?.name)
        .filter(Boolean).join(', ');

    const genderLabels = (filters.authors_genders || [])
        .map(v => metadataOptions?.authors_genders?.find(g => g.value === v)?.label)
        .filter(Boolean).join(', ');

    const originLabels = (filters.text_origins || [])
        .map(v => metadataOptions?.text_origins?.find(o => o.value === v)?.label)
        .filter(Boolean).join(', ');

    const yearOfCreation = Array.isArray(filters.years_of_creation)
        ? filters.years_of_creation.filter(Boolean).join(' – ')
        : filters.years_of_creation;

    const yearsOfPublication = Array.isArray(filters.years_of_publication)
        ? filters.years_of_publication.filter(Boolean).join(' – ')
        : filters.years_of_publication;

    return (
        <>
            <MetaRow label="Стиль" value={styleNames} />
            <MetaRow label="Жанр(и)" value={genreNames} />
            <MetaRow label="Автор(и)" value={(filters.authors || []).join(', ')} />
            <MetaRow label="Джерело(а)" value={(filters.sources || []).join(', ')} />
            <MetaRow label="Стать автора" value={genderLabels} />
            <MetaRow label="Походження тексту" value={originLabels} />
            <MetaRow label="Рік створення" value={yearOfCreation} />
            <MetaRow label="Роки публікації" value={yearsOfPublication} />
        </>
    );
};

const CorpusManager = () => {
    const dispatch = useDispatch();

    // --- STATES FROM REDUX ---
    const {
        corpora,
        isCorporaLoading,
        metadataOptions,
        textMetadataOptions,
        activeFilters,
        isCreatingText,
        isTextCreated,
        textsList,
        isTextsLoading,
        createTextError,
        isDeletingText,
        deleteTextError,
        isCreatingCorpus,
        isCorpusCreated,
        createCorpusError,
        isCreatingSubcorpus,
        isSubcorpusCreated,
        createSubcorpusError,
        isCreatingUserSubcorpus,
        isUserSubcorpusCreated,
        createUserSubcorpusError,
        isDeletingNode,
        isNodeDeleted,
        deleteNodeError,
    } = useSelector(state => state.corpusManager || {
        corpora: [],
        isCorporaLoading: false,
        metadataOptions: { styles_with_genres: [], authors_genders: [], text_origins: [] },
        activeFilters: { targetCorpusId: '', newSubcorpusName: '', style: '', genre: '', years_of_publication: ['', ''], year_of_creation: '', author: '', authors_gender: '', text_origin: '' },
        textMetadataOptions: { corpuses: [], styles_with_genres: [], authors_genders: [], text_origins: [] },
        isCreatingText: false,
        isCreatingSubcorpus: false,
        createSubcorpusError: null,
    });

    // --- LOCAL STATES ---
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const [expandedCorpora, setExpandedCorpora] = useState(() => {
        const saved = localStorage.getItem('corpus_manager_expanded');
        return saved ? JSON.parse(saved) : {};
    });

    useEffect(() => {
        localStorage.setItem('corpus_manager_expanded', JSON.stringify(expandedCorpora));
    }, [expandedCorpora]);

    // --- NOTIFICATION EFFECTS FOR PROCESS STATUS ---
    // 1. Text Upload Status
    useEffect(() => {
        if (isCreatingText) {
            setNotification({ open: true, message: 'Текст завантажується...', severity: 'info' });
        }
        if (createTextError) {
            setNotification({ open: true, message: `Помилка завантаження тексту: ${createTextError}`, severity: 'error' });
        }
    }, [isCreatingText, createTextError]);

    useEffect(() => {
        if (isTextCreated) {
            setIsAddTextOpen(false);
            setIsAddUserSubcorpusTextOpen(false);

            setNewTextData({ file: null, fileName: '', name: '', description: '', corpus: '', author: '', authors_gender: '', style: '', genre: '', year_of_creation: '', years_of_publication: '', source: '', text_origin: '' });
            setUserSubcorpusTextData({ file: null, fileName: '', name: '', description: '', corpus: '', user_subcorpus: null });

            setNotification({
                open: true,
                message: 'Текст успішно завантажено!',
                severity: 'success'
            });

            dispatch(resetTextCreated());
        }
    }, [isTextCreated, dispatch]);

    // 2. Corpus Creation Status
    useEffect(() => {
        if (isCreatingCorpus) {
            setNotification({ open: true, message: 'Створення корпусу...', severity: 'info' });
        }
        if (createCorpusError) {
            setNotification({ open: true, message: `Помилка створення корпусу: ${createCorpusError}`, severity: 'error' });
        }
        if (isCorpusCreated) {
            setIsAddCorpusOpen(false);
            setNewCorpusData({ name: '', description: '', type: 'G', language: 'UK' });
            setNotification({ open: true, message: 'Корпус успішно створено!', severity: 'success' });
            dispatch(resetCorpusCreated());
        }
    }, [isCreatingCorpus, createCorpusError, isCorpusCreated, dispatch]);

    // 3. Filtered Subcorpus Creation Status
    useEffect(() => {
        if (isCreatingSubcorpus) {
            setNotification({ open: true, message: 'Створення фільтраційного підкорпусу...', severity: 'info' });
        }
        if (createSubcorpusError) {
            setNotification({ open: true, message: `Помилка створення підкорпусу: ${createSubcorpusError}`, severity: 'error' });
        }
        if (isSubcorpusCreated) {
            setIsDrawerOpen(false);
            setNotification({ open: true, message: 'Фільтраційний підкорпус успішно створено!', severity: 'success' });
            dispatch(resetSubcorpusCreated());
        }
    }, [isCreatingSubcorpus, createSubcorpusError, isSubcorpusCreated, dispatch]);

    // 4. User Subcorpus Creation Status
    useEffect(() => {
        if (isCreatingUserSubcorpus) {
            setNotification({ open: true, message: 'Створення користувацького підкорпусу...', severity: 'info' });
        }
        if (createUserSubcorpusError) {
            setNotification({ open: true, message: `Помилка створення підкорпусу: ${createUserSubcorpusError}`, severity: 'error' });
        }
        if (isUserSubcorpusCreated) {
            setIsAddUserSubcorpusOpen(false);
            setNewUserSubcorpusName('');
            setNotification({ open: true, message: 'Користувацький підкорпус успішно створено!', severity: 'success' });
            dispatch(resetUserSubcorpusCreated());
        }
    }, [isCreatingUserSubcorpus, createUserSubcorpusError, isUserSubcorpusCreated, dispatch]);

    // 5. Deletion Process Status
    useEffect(() => {
        if (isDeletingNode) {
            setNotification({ open: true, message: 'Видалення елемента...', severity: 'info' });
        }
        if (deleteNodeError) {
            setNotification({ open: true, message: `Помилка видалення: ${deleteNodeError}`, severity: 'error' });
        }
        if (isNodeDeleted) {
            setNotification({ open: true, message: 'Елемент успішно видалено!', severity: 'success' });
            dispatch(resetNodeDeleted());
        }
    }, [isDeletingNode, deleteNodeError, isNodeDeleted, dispatch]);


    // State for selected items (Radio)
    const [selectedNode, setSelectedNode] = useState(() => {
        const saved = JSON.parse(localStorage.getItem('concordance_selected_collection'));
        if (saved && saved.id) {
            return {
                id: saved.id,
                type: saved.type === 'corpus' ? 'corpus' : 'subcorpus',
                subType: saved.type === 'user_subcorpus' ? 'user' : (saved.type === 'filtered_subcorpus' ? 'filtered' : null),
                name: saved.name
            };
        }
        return { type: null, id: null, subType: null, name: null };
    });

    // State for the "Add Text" modal
    const [isAddTextOpen, setIsAddTextOpen] = useState(false);

    const [isViewTextsOpen, setIsViewTextsOpen] = useState(false);

    const [textsPage, setTextsPage] = useState(0);
    const [textsRowsPerPage, setTextsRowsPerPage] = useState(5); // 5 rows

    // State for the "Collection metadata" modal (corpus/subcorpus)
    const [isMetadataDialogOpen, setIsMetadataDialogOpen] = useState(false);
    const [metadataDialogTarget, setMetadataDialogTarget] = useState(null);
    const [isFilterCriteriaExpanded, setIsFilterCriteriaExpanded] = useState(false);

    // State for the "Text metadata" (detail) modal
    const [isTextDetailOpen, setIsTextDetailOpen] = useState(false);
    const [selectedTextDetail, setSelectedTextDetail] = useState(null);

    // State for the "Delete text" confirmation modal
    const [isDeleteTextConfirmOpen, setIsDeleteTextConfirmOpen] = useState(false);
    const [textToDelete, setTextToDelete] = useState(null);


    // State for form "Add Text"
    const [newTextData, setNewTextData] = useState({
        file: null,
        fileName: '',
        name: '',
        description: '',
        corpus: '',
        author: '',
        authors_gender: '',
        style: '',
        genre: '',
        year_of_creation: '',
        years_of_publication: '',
        source: '',
        text_origin: ''
    });

    // const [open, setOpen] = React.useState(false);
    const [notification, setNotification] = React.useState({
        open: false,
        message: '',
        severity: 'info' // 'success', 'error', 'warning', 'info'
    });

    // State for the "Add Text to User Subcorpus" modal
    const [isAddUserSubcorpusTextOpen, setIsAddUserSubcorpusTextOpen] = useState(false);
    const [userSubcorpusTextData, setUserSubcorpusTextData] = useState({
        file: null,
        fileName: '',
        name: '',
        description: '',
        corpus: '',
        user_subcorpus: null
    });

    // Available genres
    const availableTextGenres = newTextData.style
        ? textMetadataOptions?.styles_with_genres?.find(s => s.id === newTextData.style)?.genres || []
        : [];

    // Search state
    const [searchQuery, setSearchQuery] = useState('');

    // State for year selection mode
    const [yearMode, setYearMode] = useState('single');


    // State for the "Add Corpus" modal
    const [isAddCorpusOpen, setIsAddCorpusOpen] = useState(false);
    const [newCorpusData, setNewCorpusData] = useState({
        name: '',
        description: '',
        type: 'G',
        language: 'UK'
    });

    // State for three dots
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [activeMenuContext, setActiveMenuContext] = useState({ id: null, type: null, subType: null, shared: false, permissionLevel: null });

    // State for the "Create custom subcorpus" modal
    const [isAddUserSubcorpusOpen, setIsAddUserSubcorpusOpen] = useState(false);
    const [newUserSubcorpusName, setNewUserSubcorpusName] = useState('');

    // State for the Share modal
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [shareTarget, setShareTarget] = useState({ id: null, name: '', type: 'subcorpus' });

    // State for redeem code input
    const [redeemCode, setRedeemCode] = useState('');
    const [isRedeeming, setIsRedeeming] = useState(false);
    const [redeemResult, setRedeemResult] = useState(null);

    // --- DATA LOADING ---
    useEffect(() => {
        if (corpora.length === 0) {
            dispatch(fetchCorporaListStart());
            dispatch(fetchMetadataOptionsStart());
            dispatch(fetchTextMetadataOptionsStart());
        }
        dispatch(fetchSharedWithMeStart());
        dispatch(fetchSharedCorporaWithMeStart());
    }, [dispatch, corpora.length]);

    useEffect(() => {
        if (isCreatingText) {
            setNotification({
                open: true,
                message: 'Текст завантажується...',
                severity: 'info'
            });
        }

        if (createTextError) {
            setNotification({
                open: true,
                message: `Помилка завантаження!`,
                severity: 'error'
            });
        }
    }, [isCreatingText, createTextError, dispatch]);

    useEffect(() => {
        if (deleteTextError) {
            setNotification({
                open: true,
                message: deleteTextError,
                severity: 'error'
            });
        }
    }, [deleteTextError]);

    // --- HANDLERS (Tree) ---
    const toggleDrawer = (open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) return;
        setIsDrawerOpen(open);
    };

    // --- HANDLERS (Corpus Creation) ---
    const handleCorpusDataChange = (field) => (event) => {
        setNewCorpusData({ ...newCorpusData, [field]: event.target.value });
    };

    const submitNewCorpus = () => {
        const payload = {
            ...newCorpusData,
        };

        dispatch(createCorpusStart(payload));

        setIsAddCorpusOpen(false);
        setNewCorpusData({ name: '', description: '', type: 'G', language: 'UK' });
    };

    const toggleExpand = (corpusId) => {
        setExpandedCorpora(prev => ({
            ...prev,
            [corpusId]: !prev[corpusId]
        }));
    };

    const handleSelectNode = (id, type, subType = null, name = '') => {
        if (selectedNode.id === id && selectedNode.type === type && selectedNode.subType === subType) {
            setSelectedNode({ type: null, id: null, subType: null, name: null });
            localStorage.removeItem('concordance_selected_collection');
            dispatch(setSelected({ id: null, type: null, name: null }));
        } else {
            setSelectedNode({ type, id, subType, name });

            let backendType = type;
            if (type === 'subcorpus') {
                backendType = subType === 'user' ? 'user_subcorpus' : 'filtered_subcorpus';
            }

            const newSelection = { id, type: backendType, name };
            localStorage.setItem('concordance_selected_collection', JSON.stringify(newSelection));
            dispatch(setSelected(newSelection));
        }
    };

    // --- HANDLERS (Filtering) ---
    const handleFilterChange = (field) => (event) => {
        let value = event.target.value;
        if (field === 'year_of_creation') {
            if (/[^\d]/.test(value)) {
                setNotification({
                    open: true,
                    message: 'Поле "Рік написання" може містити тільки цифри!',
                    severity: 'error'
                });
                value = value.replace(/[^\d]/g, '');
            }
        }
        dispatch(setFilterValue({ field, value }));

        if (field === 'style') {
            dispatch(setFilterValue({ field: 'genre', value: '' }));
        }

        if (field === 'targetCorpusId' && value) {
            dispatch(fetchMetadataOptionsStart(value));
        }
    };

    const handleYearChange = (index) => (event) => {
        let value = event.target.value;
        if (/[^\d]/.test(value)) {
            setNotification({
                open: true,
                message: 'Поле "Роки видання" може містити тільки цифри!',
                severity: 'error'
            });
            value = value.replace(/[^\d]/g, '');
        }
        const newYears = [...activeFilters.years_of_publication];
        newYears[index] = value;
        dispatch(setFilterValue({ field: 'years_of_publication', value: newYears }));
    };


    const handleCreateSubcorpus = () => {
        const filters = {};

        const ensureArray = (val) => {
            if (val === undefined || val === null || val === '') return undefined;
            return Array.isArray(val) ? val : [val];
        };

        if (activeFilters.style) filters.styles = ensureArray(activeFilters.style);
        if (activeFilters.genre) filters.genres = ensureArray(activeFilters.genre);
        if (activeFilters.author) filters.authors = ensureArray(activeFilters.author);
        if (activeFilters.source) filters.sources = ensureArray(activeFilters.source);

        if (activeFilters.authors_gender) filters.authors_genders = ensureArray(activeFilters.authors_gender);
        if (activeFilters.text_origin) filters.text_origins = ensureArray(activeFilters.text_origin);

        if (activeFilters.year_of_creation) {
            const year = parseInt(activeFilters.year_of_creation);
            if (!isNaN(year)) {
                filters.years_of_creation = [year];
            }
        }

        const validYears = (activeFilters.years_of_publication || [])
            .filter(y => y !== '' && y !== null)
            .map(Number)
            .filter(y => !isNaN(y));

        if (validYears.length > 0) {
            filters.years_of_publication = validYears;
        }

        const payload = {
            name: activeFilters.newSubcorpusName || "Новий підкорпус",
            targetCorpusId: activeFilters.targetCorpusId,
            filters: filters
        };

        dispatch(createFilteredSubcorpusStart(payload));
        setIsDrawerOpen(false);
    };


    // --- HANDLERS (Action Menu) ---
    const handleOpenMenu = (event, id, type, subType = null, shared = false, permissionLevel = null) => {
        event.stopPropagation();
        setMenuAnchorEl(event.currentTarget);
        setActiveMenuContext({ id, type, subType, shared, permissionLevel });
    };

    const handleCloseMenu = (event) => {
        if (event && event.stopPropagation) event.stopPropagation();
        setMenuAnchorEl(null);
    };

    const handleMenuAction = (actionType) => {
        if (actionType === 'view_metadata') {
            let target = null;

            if (activeMenuContext.type === 'corpus') {
                const corpus = corpora.find(c => c.id === activeMenuContext.id);
                if (corpus) {
                    target = {
                        ...corpus,
                        _nodeType: 'corpus',
                        _subType: null,
                        _subcorpora_count: corpus.subcorpora?.length ?? 0
                    };
                }
            } else if (activeMenuContext.type === 'subcorpus') {
                const parentCorpus = corpora.find(c =>
                    c.subcorpora?.some(sub => sub.id === activeMenuContext.id && sub.type === activeMenuContext.subType)
                );
                const sub = parentCorpus?.subcorpora?.find(
                    s => s.id === activeMenuContext.id && s.type === activeMenuContext.subType
                );
                if (sub) {
                    target = {
                        ...sub,
                        _nodeType: 'subcorpus',
                        _subType: sub.type,
                        _parentCorpusName: parentCorpus?.name
                    };
                }
            }

            setMetadataDialogTarget(target);
            setIsMetadataDialogOpen(true); setIsFilterCriteriaExpanded(false);
        } else if (actionType === 'view_texts') {
            const params = {};
            if (activeMenuContext.type === 'corpus') params.corpus_id = activeMenuContext.id;
            else if (activeMenuContext.type === 'subcorpus' && activeMenuContext.subType === 'user') params.user_subcorpus_id = activeMenuContext.id;
            else if (activeMenuContext.type === 'subcorpus' && activeMenuContext.subType === 'filtered') params.filtered_subcorpus_id = activeMenuContext.id;

            dispatch(fetchTextsStart(params));
            setIsViewTextsOpen(true);
        } else if (actionType === 'add_text_to_corpus') {
            setNewTextData({
                ...newTextData,
                corpus: activeMenuContext.id
            });
            setIsAddTextOpen(true);

        } else if (actionType === 'create_user_subcorpus') {
            setIsAddUserSubcorpusOpen(true);

        } else if (actionType === 'add_text_to_subcorpus') {
            const parentCorpus = allCorpora.find(c =>
                c.subcorpora?.some(sub => sub.id === activeMenuContext.id && sub.type === activeMenuContext.subType)
            );

            setUserSubcorpusTextData({
                file: null, fileName: '', name: '', description: '',
                corpus: parentCorpus ? parentCorpus.id : '',
                user_subcorpus: activeMenuContext.id
            });

            setIsAddUserSubcorpusTextOpen(true);

        } else if (actionType === 'share_subcorpus') {
            const corpus = corpora.find(c =>
                c.subcorpora?.some(sub => sub.id === activeMenuContext.id && sub.type === 'user')
            );
            const sub = corpus?.subcorpora?.find(s => s.id === activeMenuContext.id && s.type === 'user');
            setShareTarget({ id: activeMenuContext.id, name: sub?.name || '', type: 'subcorpus' });
            setIsShareModalOpen(true);

        } else if (actionType === 'share_corpus') {
            const corpus = corpora.find(c => c.id === activeMenuContext.id);
            setShareTarget({ id: activeMenuContext.id, name: corpus?.name || '', type: 'corpus' });
            setIsShareModalOpen(true);

        } else if (actionType === 'delete') {
            const isConfirmed = window.confirm("Ви впевнені, що хочете видалити цей елемент? Цю дію неможливо скасувати.");
            if (isConfirmed) {
                let shouldClear = false;

                if (activeMenuContext.type === 'corpus') {
                    if (selectedNode.type === 'corpus' && selectedNode.id === activeMenuContext.id) {
                        shouldClear = true;
                    } else if (selectedNode.type === 'subcorpus') {
                        const corpusBeingDeleted = corpora.find(c => c.id === activeMenuContext.id);
                        if (corpusBeingDeleted?.subcorpora?.some(sub => sub.id === selectedNode.id && sub.type === selectedNode.subType)) {
                            shouldClear = true;
                        }
                    }
                } else if (activeMenuContext.type === 'subcorpus') {
                    if (selectedNode.type === 'subcorpus' && selectedNode.id === activeMenuContext.id && selectedNode.subType === activeMenuContext.subType) {
                        shouldClear = true;
                    }
                }

                if (shouldClear) {
                    setSelectedNode({ type: null, id: null, subType: null, name: null });
                    localStorage.removeItem('concordance_selected_collection');
                    dispatch(setSelected({ id: null, type: null, name: null }));
                }

                dispatch(deleteNodeStart({
                    id: activeMenuContext.id,
                    type: activeMenuContext.type,
                    subType: activeMenuContext.subType
                }));
            }
        }
        handleCloseMenu();
    };

    // --- HANDLERS (Text metadata / deletion in "View Texts" modal) ---
    const handleViewTextDetail = (text) => {
        setSelectedTextDetail(text);
        setIsTextDetailOpen(true);
    };

    const handleDeleteText = (text) => {
        setTextToDelete(text);
        setIsDeleteTextConfirmOpen(true);
    };

    const handleConfirmDeleteText = () => {
        if (textToDelete) {
            dispatch(deleteTextStart(textToDelete.id));
        }
        setIsDeleteTextConfirmOpen(false);
        setTextToDelete(null);
    };

    const handleCancelDeleteText = () => {
        setIsDeleteTextConfirmOpen(false);
        setTextToDelete(null);
    };

    // --- HANDLERS (Creating a custom subcorpus) ---
    const submitNewUserSubcorpus = () => {
        dispatch(createUserSubcorpusStart({
            name: newUserSubcorpusName,
            corpus: activeMenuContext.id
        }));

        setIsAddUserSubcorpusOpen(false);
        setNewUserSubcorpusName('');
    };


    // --- HANDLERS (Text creating) ---
    const handleTextDataChange = (field) => (event) => {
        let value = event.target.value;
        if (field === 'year_of_creation') {
            if (/[^\d]/.test(value)) {
                setNotification({
                    open: true,
                    message: 'Поле "Рік написання" може містити тільки цифри!',
                    severity: 'error'
                });
                value = value.replace(/[^\d]/g, '');
            }
        } else if (field === 'years_of_publication') {
            if (/[^0-9,\s]/.test(value)) {
                setNotification({
                    open: true,
                    message: 'Поле "Роки видання" може містити тільки цифри, коми та пробіли!',
                    severity: 'error'
                });
                value = value.replace(/[^0-9,\s]/g, '');
            }
        }
        setNewTextData({ ...newTextData, [field]: value, ...(field === 'style' ? { genre: '' } : {}) });
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setNewTextData({ ...newTextData, file: file, fileName: file.name });
        }
    };

    // --- HANDLERS (User Subcorpus Text creating) ---
    const handleUserSubcorpusTextDataChange = (field) => (event) => {
        setUserSubcorpusTextData({ ...userSubcorpusTextData, [field]: event.target.value });
    };

    const handleUserSubcorpusFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setUserSubcorpusTextData({ ...userSubcorpusTextData, file: file, fileName: file.name });
        }
    };

    const submitUserSubcorpusText = () => {
        const formData = new FormData();

        if (userSubcorpusTextData.file) formData.append('file', userSubcorpusTextData.file);
        formData.append('name', userSubcorpusTextData.name);
        formData.append('description', userSubcorpusTextData.description);
        formData.append('user_subcorpus', userSubcorpusTextData.user_subcorpus);

        const emptyMetadata = {
            author: "",
            authors_gender: "",
            style: "",
            genres: [],
            year_of_creation: null,
            years_of_publication: [],
            source: "",
            text_origin: ""
        };
        formData.append('metadata', JSON.stringify(emptyMetadata));

        dispatch(createTextStart(formData));
    };

    const submitNewText = () => {
        const formData = new FormData();

        if (newTextData.file) formData.append('file', newTextData.file);
        formData.append('name', newTextData.name);
        formData.append('description', newTextData.description);
        formData.append('corpus', newTextData.corpus);

        const yearOfCreationParsed = parseInt(newTextData.year_of_creation);
        if (!newTextData.year_of_creation || isNaN(yearOfCreationParsed)) {
            setNotification({
                open: true,
                message: 'Помилка: "Рік написання" є обов’язковим та має бути числовим значенням!',
                severity: 'error'
            });
            return;
        }

        if (newTextData.years_of_publication && /[^0-9,\s]/.test(newTextData.years_of_publication)) {
            setNotification({
                open: true,
                message: 'Помилка: "Роки видання" може містити тільки цифри, коми та пробіли!',
                severity: 'error'
            });
            return;
        }

        const yearsOfPubCleaned = newTextData.years_of_publication
            ? newTextData.years_of_publication.split(',').map(y => parseInt(y.trim())).filter(y => !isNaN(y))
            : [];

        const metadata = {
            author: newTextData.author,
            authors_gender: newTextData.authors_gender,
            style: newTextData.style,
            genres: newTextData.genre ? [newTextData.genre] : [],
            year_of_creation: yearOfCreationParsed,
            years_of_publication: yearsOfPubCleaned,
            source: newTextData.source,
            text_origin: newTextData.text_origin
        };

        formData.append('metadata', JSON.stringify(metadata));

        dispatch(createTextStart(formData));
    };


    const handleClose = (event, reason) => {
        if (reason === 'clickaway') return;
        setNotification(prev => ({ ...prev, open: false }));
    };

    // --- COMPUTATIONS (Tree) ---
    const { sharedWithMe, sharedCorporaWithMe } = useSelector(state => state.sharing);

    const corporaWithShared = corpora.map(corpus => {
        const sharedInThisCorpus = sharedWithMe
            .filter(grant => grant.corpus_id === corpus.id)
            .map(grant => ({
                id: grant.subcorpus_id,
                name: grant.subcorpus_name,
                type: 'user',
                shared: true,
                permission_level: grant.permission_level,
                owner_name: grant.owner_name,
            }));

        const existingIds = new Set((corpus.subcorpora || []).map(s => s.id));
        const newShared = sharedInThisCorpus.filter(s => !existingIds.has(s.id));

        if (newShared.length === 0) return corpus;
        return {
            ...corpus,
            subcorpora: [...(corpus.subcorpora || []), ...newShared],
        };
    });

    const corporaIds = new Set(corpora.map(c => c.id));

    const orphanByCorpus = sharedWithMe
        .filter(grant => !corporaIds.has(grant.corpus_id))
        .reduce((acc, grant) => {
            if (!acc[grant.corpus_id]) {
                acc[grant.corpus_id] = {
                    id: grant.corpus_id,
                    name: grant.corpus_name,
                    synthetic: true,
                    shared: true,
                    owner_name: grant.owner_name,
                    subcorpora: [],
                };
            }
            acc[grant.corpus_id].subcorpora.push({
                id: grant.subcorpus_id,
                name: grant.subcorpus_name,
                type: 'user',
                shared: true,
                permission_level: grant.permission_level,
                owner_name: grant.owner_name,
            });
            return acc;
        }, {});
    const syntheticCorpora = Object.values(orphanByCorpus);

    const sharedWholeCorpora = (sharedCorporaWithMe || [])
        .filter(grant => !corporaIds.has(grant.corpus_id))
        .map(grant => ({
            id: grant.corpus_id,
            name: grant.corpus_name,
            shared: true,
            permission_level: grant.access_level === 'E' ? 'EDIT' : 'VIEW',
            owner_name: grant.owner_name,
            subcorpora: [],
        }));

    const mergedSharedCorpora = [
        ...sharedWholeCorpora.map(c => {
            const syn = syntheticCorpora.find(s => s.id === c.id);
            return syn ? { ...c, subcorpora: syn.subcorpora } : c;
        }),
        ...syntheticCorpora.filter(s => !sharedWholeCorpora.some(w => w.id === s.id)),
    ];

    const allCorpora = [...corporaWithShared, ...mergedSharedCorpora];

    const filteredCorpora = allCorpora.map(corpus => {
        const query = searchQuery.toLowerCase();
        const corpusMatches = corpus.name.toLowerCase().includes(query);
        const matchedSubcorpora = corpus.subcorpora?.filter(sub => sub.name.toLowerCase().includes(query)) || [];

        if (corpusMatches || matchedSubcorpora.length > 0) {
            return {
                ...corpus,
                subcorpora: corpusMatches ? corpus.subcorpora : matchedSubcorpora
            };
        }
        return null;
    }).filter(Boolean);

    // --- COMPUTATIONS (Metadata) ---
    const availableFilterGenres = activeFilters?.style
        ? metadataOptions?.styles_with_genres?.find(s => s.id === activeFilters.style)?.genres || []
        : metadataOptions?.styles_with_genres?.flatMap(s => s.genres) || [];

    const colors = {
        bgMain: 'var(--color-bg-light, #F0ECE1)',
        bgCorpusRow: 'var(--color-accent-green, #677424)',
        btnOutline: 'var(--color-accent-green, #677424)',
        textBrown: 'var(--color-text-main, #5A3E29)',
        bgDrawerBtn: 'var(--color-btn-hover, #40342B)',
        bgSec: 'var(--color-bg-main, #BBC191)'
    };

    // --- RENDER DRAWER CONTENT (Filtering) ---
    const renderDrawerContent = () => (
        <Box sx={{ width: 400, p: 4, bgcolor: colors.bgMain, height: '100%', color: colors.textBrown }}>
            <Typography variant="h5" align="center" fontWeight="bold" gutterBottom>
                Фільтрація
            </Typography>

            <FormControl fullWidth variant="standard" sx={{ mb: 3 }}>
                <InputLabel sx={{ color: colors.bgCorpusRow, fontWeight: 'bold' }}>Корпус</InputLabel>
                <Select value={activeFilters?.targetCorpusId || ''} onChange={handleFilterChange('targetCorpusId')}>
                    <MenuItem value=""><em>-- Не обрано --</em></MenuItem>
                    {corpora.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <FormControl fullWidth variant="standard">
                    <InputLabel sx={{ color: colors.bgCorpusRow, fontWeight: 'bold' }}>Стиль</InputLabel>
                    <Select value={activeFilters?.style || ''} onChange={handleFilterChange('style')}>
                        <MenuItem value="">Всі</MenuItem>
                        {metadataOptions?.styles_with_genres?.map(style => <MenuItem key={style.id} value={style.id}>{style.name}</MenuItem>)}
                    </Select>
                </FormControl>

                <FormControl fullWidth variant="standard">
                    <InputLabel sx={{ color: colors.bgCorpusRow, fontWeight: 'bold' }}>Жанр</InputLabel>
                    <Select value={activeFilters?.genre || ''} onChange={handleFilterChange('genre')}>
                        <MenuItem value="">Всі</MenuItem>
                        {availableFilterGenres.map(genre => <MenuItem key={genre.id} value={genre.id}>{genre.name}</MenuItem>)}
                    </Select>
                </FormControl>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                    label="Автор"
                    variant="standard"
                    fullWidth
                    value={activeFilters?.author || ''}
                    onChange={handleFilterChange('author')}
                    InputLabelProps={{ sx: { color: colors.bgCorpusRow, fontWeight: 'bold' } }}
                />
                <FormControl fullWidth variant="standard">
                    <InputLabel sx={{ color: colors.bgCorpusRow, fontWeight: 'bold' }}>Стать автора</InputLabel>
                    <Select value={activeFilters?.authors_gender || ''} onChange={handleFilterChange('authors_gender')}>
                        <MenuItem value="">Всі</MenuItem>
                        {metadataOptions?.authors_genders?.map(gender => <MenuItem key={gender.value} value={gender.value}>{gender.label}</MenuItem>)}
                    </Select>
                </FormControl>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <FormControl fullWidth variant="standard">
                    <InputLabel sx={{ color: colors.bgCorpusRow, fontWeight: 'bold' }}>Оригінал/переклад</InputLabel>
                    <Select value={activeFilters?.text_origin || ''} onChange={handleFilterChange('text_origin')}>
                        <MenuItem value="">Всі</MenuItem>
                        {metadataOptions?.text_origins?.map(origin => <MenuItem key={origin.value} value={origin.value}>{origin.label}</MenuItem>)}
                    </Select>
                </FormControl>

                <TextField
                    label="Рік написання"
                    variant="standard"
                    fullWidth
                    value={activeFilters?.year_of_creation || ''}
                    onChange={handleFilterChange('year_of_creation')}
                    InputLabelProps={{ sx: { color: colors.bgCorpusRow, fontWeight: 'bold' } }}
                />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                <Typography sx={{ color: colors.bgCorpusRow, fontWeight: 'bold', mb: 1, fontSize: '0.95rem' }}>
                    Роки видання
                </Typography>

                <Box sx={{ display: 'flex', border: `1px solid ${colors.textBrown}`, borderRadius: '4px', overflow: 'hidden', mb: 2 }}>
                    <Button
                        disableRipple
                        onClick={() => setYearMode('single')}
                        sx={{
                            minWidth: '35px', px: 1, py: 0,
                            bgcolor: yearMode === 'single' ? '#dcb99c' : 'transparent',
                            color: colors.textBrown,
                            borderRadius: 0,
                            fontWeight: 'bold',
                            '&:hover': { bgcolor: '#cfa686' }
                        }}
                    >
                        •
                    </Button>
                    <Box sx={{ width: '1px', bgcolor: colors.textBrown }} />
                    <Button
                        disableRipple
                        onClick={() => setYearMode('range')}
                        sx={{
                            minWidth: '35px', px: 1, py: 0,
                            bgcolor: yearMode === 'range' ? '#dcb99c' : 'transparent',
                            color: colors.textBrown,
                            borderRadius: 0,
                            '&:hover': { bgcolor: '#cfa686' }
                        }}
                    >
                        ↔
                    </Button>
                </Box>

                {yearMode === 'single' ? (
                    <TextField
                        variant="standard"
                        fullWidth
                        placeholder="Напр. 1999"
                        value={activeFilters?.years_of_publication?.[0] || ''}
                        onChange={handleYearChange(0)}
                        sx={{ textAlign: 'center' }}
                        inputProps={{ style: { textAlign: 'center' } }}
                    />
                ) : (
                    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, width: '100%' }}>
                        <TextField
                            variant="standard"
                            fullWidth
                            label="від"
                            value={activeFilters?.years_of_publication?.[0] || ''}
                            onChange={handleYearChange(0)}
                            InputLabelProps={{ shrink: true, sx: { fontSize: '0.85rem', color: '#9d7c60' } }}
                        />
                        <Typography sx={{ mb: 0.5, color: colors.textBrown, fontWeight: 'bold' }}>—</Typography>
                        <TextField
                            variant="standard"
                            fullWidth
                            label="до"
                            value={activeFilters?.years_of_publication?.[1] || ''}
                            onChange={handleYearChange(1)}
                            InputLabelProps={{ shrink: true, sx: { fontSize: '0.85rem', color: '#9d7c60' } }}
                        />
                    </Box>
                )}
            </Box>

            <TextField
                label="Назва нового підкорпусу"
                variant="standard"
                fullWidth
                value={activeFilters?.newSubcorpusName || ''}
                onChange={handleFilterChange('newSubcorpusName')}
                sx={{ mb: 6 }}
                InputLabelProps={{ sx: { color: colors.bgCorpusRow, fontWeight: 'bold' } }}
            />

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                    variant="contained"
                    onClick={() => dispatch(clearFilters())}
                    sx={{ bgcolor: colors.bgDrawerBtn, '&:hover': { bgcolor: '#3d2e24' }, textTransform: 'none' }}
                >
                    Скинути
                </Button>
                <Button
                    variant="contained"
                    onClick={handleCreateSubcorpus}
                    disabled={!activeFilters?.targetCorpusId || !activeFilters?.newSubcorpusName}
                    sx={{ bgcolor: colors.bgDrawerBtn, '&:hover': { bgcolor: '#3d2e24' }, textTransform: 'none' }}
                >
                    Створити підкорпус
                </Button>
            </Box>
        </Box>
    );

    const activeCorpusForMenu = corpora.find(c => c.id === activeMenuContext.id);

    // --- MAIN RENDER ---
    return (

        <Box sx={{ p: 4, bgcolor: colors.bgMain }}>

            {/* TOP BAR: Search & Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mb: 4, alignItems: 'center' }}>
                <TextField
                    placeholder="Пошук корпусів..."
                    variant="outlined"
                    size="small"
                    value={searchQuery}
                    onChange={(e) => {
                        const value = e.target.value;
                        setSearchQuery(value);

                        if (value.trim()) {
                            const query = value.toLowerCase();
                            const matches = corpora.filter(corpus => {
                                const corpusMatches = corpus.name.toLowerCase().includes(query);
                                const subMatches = corpus.subcorpora?.some(sub => sub.name.toLowerCase().includes(query));
                                return corpusMatches || subMatches;
                            });

                            if (matches.length === 1) {
                                setExpandedCorpora(prev => ({
                                    ...prev,
                                    [matches[0].id]: true
                                }));
                            }
                        }
                    }}
                    sx={{
                        flexGrow: 1,
                        bgcolor: 'white',
                        borderRadius: 2,
                        "& .MuiOutlinedInput-root": {
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: colors.textBrown,
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: colors.btnOutline,
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: colors.textBrown,
                          },
                        },
                    }}
                    InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{color : colors.btnOutline}} /></InputAdornment> }}
                />
                <Button variant="outlined" onClick={toggleDrawer(true)}
                    sx={{
                        borderColor: colors.btnOutline,
                        color: colors.textBrown,
                        textTransform: 'none', px: 3,
                        borderWidth : 2,
                        ':hover': {
                            borderColor: colors.textBrown,
                        },
                        ':focus': {
                            borderColor: colors.textBrown,
                        },
                    }}
                >
                    Фільтрація
                </Button>
                <TextField
                    placeholder="Код доступу"
                    variant="outlined"
                    size="small"
                    value={redeemCode}
                    onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                    inputProps={{ maxLength: 8 }}
                    sx={{
                        width: 150,
                        bgcolor: 'white',
                        borderRadius: 2,
                        "& .MuiOutlinedInput-root": {
                            "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: colors.textBrown,
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                borderColor: colors.btnOutline,
                            },
                        },
                    }}
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><VpnKey sx={{ color: colors.btnOutline, fontSize: '1.2rem' }} /></InputAdornment>,
                    }}
                />
                <Button
                    variant="outlined"
                    disabled={redeemCode.trim().length < 8 || isRedeeming}
                    onClick={async () => {
                        setIsRedeeming(true);
                        setRedeemResult(null);
                        try {
                            const response = await api.post('shares/redeem/', { access_code: redeemCode.trim() });
                            if (response.data.type === 'corpus') {
                                setRedeemResult({ severity: 'success', message: `Доступ до корпусу надано: ${response.data.corpus_name} (${response.data.access_level})` });
                            } else {
                                setRedeemResult({ severity: 'success', message: `Доступ надано: ${response.data.subcorpus_name} (${response.data.permission_level === 'EDIT' ? 'Редагування' : 'Перегляд'})` });
                            }
                            setRedeemCode('');
                            dispatch(fetchCorporaListStart());
                            dispatch(fetchSharedWithMeStart());
                            dispatch(fetchSharedCorporaWithMeStart());
                        } catch (err) {
                            const msg = err.response?.data?.error || 'Невірний код.';
                            setRedeemResult({ severity: 'error', message: msg });
                        } finally {
                            setIsRedeeming(false);
                        }
                    }}
                    sx={{
                        borderColor: colors.btnOutline,
                        color: colors.textBrown,
                        textTransform: 'none', px: 2,
                        borderWidth: 2,
                        ':hover': { borderColor: colors.textBrown },
                    }}
                >
                    {isRedeeming ? 'Зачекайте...' : 'Активувати'}
                </Button>
                {hasRole(getCurrentUser().role, ['SUPER_ADMIN', 'ADMIN', 'COMPILER']) && (
                    <Button variant="outlined" onClick={() => setIsAddCorpusOpen(true)}
                     sx={{
                        borderColor: colors.btnOutline,
                        color: colors.textBrown,
                        textTransform: 'none', px: 3,
                        borderWidth : 2,
                        ':hover': {
                            borderColor: colors.textBrown,
                        },
                        ':focus': {
                            borderColor: colors.textBrown,
                        },
                    }}
                    >
                        Додати корпус
                    </Button>
                )}
            </Box>

            {/* REDEEM RESULT NOTIFICATION */}
            {redeemResult && (
                <Alert
                    severity={redeemResult.severity}
                    onClose={() => setRedeemResult(null)}
                    sx={{ mb: 2 }}
                >
                    {redeemResult.message}
                </Alert>
            )}

            {/* TREE LIST */}
            {isCorporaLoading ? (
                <Typography>Завантаження...</Typography>
            ) : (
                <List sx={{ width: '100%', p: 0 }}>
                    {filteredCorpora.map((corpus) => (
                        <React.Fragment key={corpus.id}>
                            {/* CORPUS ROW */}
                            <ListItem
                                disablePadding
                                sx={{
                                    bgcolor: colors.bgCorpusRow,
                                    color: 'white',
                                    mb: expandedCorpora[corpus.id] ? 0 : 1,
                                    borderRadius: 1,
                                    pr: 2
                                }}
                            >
                                <IconButton
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleExpand(corpus.id);
                                    }}
                                    disableRipple
                                    sx={{ color: 'white', '&:focus': { outline: 'none' }, '&:focus-visible': { outline: 'none' } }}
                                >
                                    {expandedCorpora[corpus.id] ? <ExpandMore /> : <KeyboardArrowRight />}
                                </IconButton>
                                <ListItemIcon sx={{ minWidth: 40 }}>
                                    <Radio
                                        edge="start"
                                        checked={selectedNode.type === 'corpus' && selectedNode.id === corpus.id}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={() => handleSelectNode(corpus.id, 'corpus', null, corpus.name)}
                                        sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }}
                                    />
                                </ListItemIcon>
                                <ListItemText primary={corpus.name} primaryTypographyProps={{ fontSize: '1.1rem', fontWeight: 'bold' }} />
                                <IconButton
                                    edge="end"
                                    disableRipple
                                    onClick={(e) => handleOpenMenu(e, corpus.id, 'corpus', null, corpus.shared || false, corpus.permission_level || null)}
                                    sx={{ color: 'white', '&:focus': { outline: 'none' }, '&:focus-visible': { outline: 'none' } }}
                                >
                                    <MoreVert />
                                </IconButton>
                            </ListItem>

                            {/* SUBCORPORA COLLAPSE */}
                            <Collapse
                                in={!!expandedCorpora[corpus.id]}
                                timeout="auto"
                                unmountOnExit
                            >
                                <List component="div" disablePadding sx={{ mb: 2 }}>
                                    {corpus.subcorpora && [...corpus.subcorpora]
                                        .sort((a, b) => (a.type === 'user' ? -1 : (b.type === 'user' ? 1 : 0)))
                                        .map((sub, index, array) => {

                                            const showDivider = sub.type !== 'user' && index > 0 && array[index - 1].type === 'user';

                                            return (
                                                <React.Fragment key={`${sub.type}-${sub.id}`}>

                                                    {showDivider && (
                                                        <Divider sx={{ my: 1, ml: 7, mr: 2, borderColor: colors.textBrown, opacity: 0.5 }} />
                                                    )}

                                                    <ListItem sx={{ pl: 7, pr: 2, py: 0 }}>
                                                        <ListItemIcon sx={{ minWidth: 40 }}>
                                                            <Radio
                                                                edge="start"
                                                                checked={selectedNode.type === 'subcorpus' && selectedNode.id === sub.id && selectedNode.subType === sub.type}
                                                                onChange={() => handleSelectNode(sub.id, 'subcorpus', sub.type, sub.name)}
                                                                sx={{ color: colors.bgCorpusRow, '&.Mui-checked': { color: colors.bgCorpusRow } }}
                                                            />
                                                        </ListItemIcon>
                                                        <ListItemText
                                                            primary={sub.name}
                                                            secondary={
                                                                sub.shared
                                                                    ? `Користувацький підкорпус · ${sub.owner_name} · ${sub.permission_level === 'EDIT' ? 'Редагування' : 'Перегляд'}`
                                                                    : (sub.type === 'user' ? 'Користувацький підкорпус' : 'Фільтраційний підкорпус')
                                                            }
                                                            primaryTypographyProps={{ color: colors.textBrown, fontWeight: 'bold' }}
                                                            secondaryTypographyProps={{ color: sub.shared ? '#1565c0' : '#884343', fontSize: '0.8rem' }}
                                                        />
                                                        <IconButton
                                                            edge="end"
                                                            disableRipple
                                                            onClick={(e) => handleOpenMenu(e, sub.id, 'subcorpus', sub.type, sub.shared || false, sub.permission_level || null)}
                                                            sx={{ color: colors.textBrown, '&:focus': { outline: 'none' }, '&:focus-visible': { outline: 'none' } }}
                                                        >
                                                            <MoreVert />
                                                        </IconButton>
                                                    </ListItem>
                                                </React.Fragment>
                                            );
                                        })}
                                </List>
                            </Collapse>
                        </React.Fragment>
                    ))}
                </List>
            )}


            {/* RIGHT DRAWER */}
            <Drawer anchor="right" open={isDrawerOpen} onClose={toggleDrawer(false)}>
                {renderDrawerContent()}
            </Drawer>

            {/* MODAL: ADD TEXT */}
            <Dialog open={isAddTextOpen} onClose={() => setIsAddTextOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ bgcolor: colors.bgMain, color: colors.textBrown, fontWeight: 'bold' }}>
                    Завантажити новий текст
                </DialogTitle>
                <DialogContent sx={{
                    bgcolor: colors.bgMain,
                    '&::-webkit-scrollbar': { display: 'none' },
                    msOverflowStyle: 'none',
                    scrollbarWidth: 'none'
                }}>
                    <Grid container spacing={4} sx={{ mt: 1 }}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ color: colors.bgCorpusRow, mb: 2 }}>Основна інформація</Typography>
                            <Button variant="outlined" component="label" fullWidth startIcon={<CloudUpload />} sx={{ mb: 3, borderColor: colors.btnOutline, color: colors.textBrown, height: '56px' }}>
                                {newTextData.fileName || "Оберіть файл"}
                                <input type="file" hidden onChange={handleFileChange} />
                            </Button>
                            <TextField label="Назва тексту" fullWidth sx={{ mb: 2 }} value={newTextData.name} onChange={handleTextDataChange('name')} />
                            <TextField label="Опис" fullWidth multiline rows={2} sx={{ mb: 2 }} value={newTextData.description} onChange={handleTextDataChange('description')} />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ color: colors.bgCorpusRow, mb: 2 }}>Метадані</Typography>
                            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                <TextField label="Автор" fullWidth size="small" value={newTextData.author} onChange={handleTextDataChange('author')} />
                                <FormControl fullWidth size="small">
                                    <InputLabel id="modal-gender-label">Стать</InputLabel>
                                    <Select labelId="modal-gender-label" label="Стать" value={newTextData.authors_gender} onChange={handleTextDataChange('authors_gender')}>
                                        {textMetadataOptions?.authors_genders?.map(gender => <MenuItem key={gender.value} value={gender.value}>{gender.label}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel id="modal-style-label">Стиль</InputLabel>
                                    <Select labelId="modal-style-label" label="Стиль" value={newTextData.style} onChange={handleTextDataChange('style')}>
                                        {textMetadataOptions?.styles_with_genres?.map(style => <MenuItem key={style.id} value={style.id}>{style.name}</MenuItem>)}
                                    </Select>
                                </FormControl>
                                <FormControl fullWidth size="small">
                                    <InputLabel id="modal-genre-label">Жанр</InputLabel>
                                    <Select labelId="modal-genre-label" label="Жанр" value={newTextData.genre} onChange={handleTextDataChange('genre')}>
                                        {availableTextGenres.map(genre => <MenuItem key={genre.id} value={genre.id}>{genre.name}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                <TextField label="Рік написання" size="small" fullWidth placeholder="Напр. 1932" value={newTextData.year_of_creation} onChange={handleTextDataChange('year_of_creation')} />
                                <TextField label="Роки видання" size="small" fullWidth placeholder="2012, 2017" value={newTextData.years_of_publication} onChange={handleTextDataChange('years_of_publication')} />
                            </Box>
                            <TextField label="Джерело" size="small" fullWidth sx={{ mb: 2 }} value={newTextData.source} onChange={handleTextDataChange('source')} />
                            <FormControl fullWidth size="small">
                                <InputLabel id="modal-origin-label">Оригінал / Переклад</InputLabel>
                                <Select labelId="modal-origin-label" label="Оригінал / Переклад" value={newTextData.text_origin} onChange={handleTextDataChange('text_origin')}>
                                    {textMetadataOptions?.text_origins?.map(origin => <MenuItem key={origin.value} value={origin.value}>{origin.label}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ bgcolor: colors.bgMain, p: 3 }}>
                    <Button onClick={() => setIsAddTextOpen(false)} sx={{ color: colors.textBrown, fontWeight: 'bold' }}>Скасувати</Button>
                    <Button
                        variant="contained"
                        onClick={submitNewText}
                        disabled={!newTextData.file || !newTextData.name || !newTextData.corpus || !newTextData.author || !newTextData.style || !newTextData.genre || !newTextData.authors_gender || !newTextData.text_origin || !newTextData.year_of_creation || isCreatingText}
                        sx={{ bgcolor: colors.btnOutline, '&:hover': { bgcolor: '#5A632C' }, textTransform: 'none' }}
                    >
                        {isCreatingText ? 'Завантаження...' : 'Завантажити текст'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={notification.open}
                autoHideDuration={notification.severity === 'info' ? null : 6000}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    severity={notification.severity}
                    variant="filled"
                    sx={{
                        width: '100%',
                        bgcolor: colors.bgSec,
                        color: colors.textBrown,
                    }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>

            <Dialog open={isAddCorpusOpen} onClose={() => setIsAddCorpusOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ bgcolor: colors.bgMain, color: colors.textBrown, fontWeight: 'bold' }}>
                    Створити новий корпус
                </DialogTitle>
                <DialogContent sx={{ bgcolor: colors.bgMain }}>
                    <Box sx={{ mt: 1 }}>
                        <TextField
                            label="Назва корпусу *"
                            fullWidth
                            sx={{ mb: 3 }}
                            value={newCorpusData.name}
                            onChange={handleCorpusDataChange('name')}
                        />

                        <TextField
                            label="Опис"
                            fullWidth
                            multiline
                            rows={3}
                            sx={{ mb: 3 }}
                            value={newCorpusData.description}
                            onChange={handleCorpusDataChange('description')}
                        />

                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <FormControl fullWidth>
                                <InputLabel id="modal-corpus-type-label">Тип корпусу *</InputLabel>
                                <Select
                                    labelId="modal-corpus-type-label"
                                    label="Тип корпусу *"
                                    value={newCorpusData.type}
                                    onChange={handleCorpusDataChange('type')}
                                >
                                    <MenuItem value="G">Загальний</MenuItem>
                                    <MenuItem value="E">Навчальний</MenuItem>
                                    <MenuItem value="S">Спеціалізований</MenuItem>
                                </Select>
                            </FormControl>

                            <FormControl fullWidth>
                                <InputLabel id="modal-corpus-lang-label">Мова *</InputLabel>
                                <Select
                                    labelId="modal-corpus-lang-label"
                                    label="Мова *"
                                    value={newCorpusData.language}
                                    onChange={handleCorpusDataChange('language')}
                                >
                                    <MenuItem value="UK">Українська</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ bgcolor: colors.bgMain, p: 3 }}>
                    <Button onClick={() => setIsAddCorpusOpen(false)} sx={{ color: colors.textBrown, fontWeight: 'bold' }}>
                        Скасувати
                    </Button>
                    <Button
                        variant="contained"
                        onClick={submitNewCorpus}
                        disabled={!newCorpusData.name} // Disable if name is missing
                        sx={{ bgcolor: colors.btnOutline, '&:hover': { bgcolor: '#5A632C' }, textTransform: 'none' }}
                    >
                        Створити корпус
                    </Button>
                </DialogActions>
            </Dialog>
            {/* ACTION MENU */}
            <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleCloseMenu}
                PaperProps={{ sx: { width: 280, bgcolor: 'white', color: colors.textBrown } }}
            >
                {activeMenuContext.type === 'corpus' && !activeMenuContext.shared && (
                    <MenuItem onClick={() => handleMenuAction('create_user_subcorpus')}>
                        <ListItemIcon><CreateNewFolder fontSize="small" sx={{ color: colors.textBrown }} /></ListItemIcon>
                        <ListItemText>Створити кор. підкорпус</ListItemText>
                    </MenuItem>
                )}

                {activeMenuContext.type === 'corpus' && (() => {
                    const corpusNode = allCorpora.find(c => c.id === activeMenuContext.id);
                    if (corpusNode?.synthetic) return null;
                    const user = getCurrentUser();
                    if (user.role === 'USER' && activeMenuContext.shared && activeMenuContext.permissionLevel === 'VIEW') return null;
                    return (
                        <MenuItem onClick={() => handleMenuAction('add_text_to_corpus')}>
                            <ListItemIcon><PostAdd fontSize="small" /></ListItemIcon>
                            <ListItemText>Додати текст</ListItemText>
                        </MenuItem>
                    );
                })()}

                {activeMenuContext.type === 'corpus' && !activeMenuContext.shared && (() => {
                    const user = getCurrentUser();
                    const corpus = corpora.find(c => c.id === activeMenuContext.id);
                    const isCreator = corpus?.creator_id === user.id;
                    const isPrivileged = hasRole(user.role, ['SUPER_ADMIN', 'ADMIN', 'COMPILER']);
                    if (!isCreator && !isPrivileged) return null;
                    return (
                        <MenuItem onClick={() => handleMenuAction('share_corpus')}>
                            <ListItemIcon><Share fontSize="small" sx={{ color: colors.textBrown }} /></ListItemIcon>
                            <ListItemText>Поділитися корпусом</ListItemText>
                        </MenuItem>
                    );
                })()}

                {activeMenuContext.type === 'subcorpus' && activeMenuContext.subType === 'user' && (() => {
                    const user = getCurrentUser();
                    if (user.role === 'USER' && activeMenuContext.shared && activeMenuContext.permissionLevel === 'VIEW') return null;
                    return (
                        <MenuItem onClick={() => handleMenuAction('add_text_to_subcorpus')}>
                            <ListItemIcon><PostAdd fontSize="small" sx={{ color: colors.textBrown }} /></ListItemIcon>
                            <ListItemText>Додати текст</ListItemText>
                        </MenuItem>
                    );
                })()}

                {activeMenuContext.type === 'subcorpus' && activeMenuContext.subType === 'user' && !activeMenuContext.shared && (
                    <MenuItem onClick={() => handleMenuAction('share_subcorpus')}>
                        <ListItemIcon><Share fontSize="small" sx={{ color: colors.textBrown }} /></ListItemIcon>
                        <ListItemText>Поділитися</ListItemText>
                    </MenuItem>
                )}

                {(activeMenuContext.type === 'corpus' ||
                  (activeMenuContext.type === 'subcorpus' && activeMenuContext.subType === 'user')) && (
                    <Divider />
                )}
                <MenuItem onClick={() => handleMenuAction('view_metadata')}>
                    <ListItemIcon><Info fontSize="small" sx={{ color: colors.textBrown }} /></ListItemIcon>
                    <ListItemText>Переглянути метадані</ListItemText>
                </MenuItem>

                <MenuItem onClick={() => handleMenuAction('view_texts')}>
                    <ListItemIcon><MenuBook fontSize="small" sx={{ color: colors.textBrown }} /></ListItemIcon>
                    <ListItemText>Переглянути тексти</ListItemText>
                </MenuItem>

                {(() => {
                    const user = getCurrentUser();
                    const isAdmin = hasRole(user.role, ['SUPER_ADMIN', 'ADMIN']);
                    const isCompiler = hasRole(user.role, ['COMPILER']);
                    if (activeMenuContext.type === 'corpus') {
                        if (!isAdmin && !isCompiler) return null;
                    }
                    return (
                        <MenuItem onClick={() => handleMenuAction('delete')} sx={{ color: 'error.main' }}>
                            <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>
                            <ListItemText>Видалити</ListItemText>
                        </MenuItem>
                    );
                })()}
            </Menu>
            {/* MODAL: ADD CUSTOM SUBCORPORATION */}
            <Dialog open={isAddUserSubcorpusOpen} onClose={() => setIsAddUserSubcorpusOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ bgcolor: colors.bgMain, color: colors.textBrown, fontWeight: 'bold' }}>
                    Створити користувацький підкорпус
                </DialogTitle>
                <DialogContent sx={{ bgcolor: colors.bgMain }}>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Назва підкорпусу *"
                        fullWidth
                        variant="outlined"
                        value={newUserSubcorpusName}
                        onChange={(e) => setNewUserSubcorpusName(e.target.value)}
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions sx={{ bgcolor: colors.bgMain, p: 3 }}>
                    <Button onClick={() => setIsAddUserSubcorpusOpen(false)} sx={{ color: colors.textBrown, fontWeight: 'bold' }}>
                        Скасувати
                    </Button>
                    <Button
                        variant="contained"
                        onClick={submitNewUserSubcorpus}
                        disabled={!newUserSubcorpusName.trim()}
                        sx={{ bgcolor: colors.btnOutline, '&:hover': { bgcolor: '#5A632C' }, textTransform: 'none' }}
                    >
                        Створити
                    </Button>
                </DialogActions>
            </Dialog>
            {/* MODAL: ADD TEXT TO USER SUB-CORPUS */}
            <Dialog open={isAddUserSubcorpusTextOpen} onClose={() => setIsAddUserSubcorpusTextOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ bgcolor: colors.bgMain, color: colors.textBrown, fontWeight: 'bold' }}>
                    Додати текст у користувацький підкорпус
                </DialogTitle>
                <DialogContent sx={{ bgcolor: colors.bgMain }}>
                    <Box sx={{ mt: 1 }}>
                        <Button variant="outlined" component="label" fullWidth startIcon={<CloudUpload />} sx={{ mb: 3, borderColor: colors.btnOutline, color: colors.textBrown, height: '56px' }}>
                            {userSubcorpusTextData.fileName || "Оберіть файл"}
                            <input type="file" hidden onChange={handleUserSubcorpusFileChange} />
                        </Button>
                        <TextField
                            label="Назва тексту *"
                            fullWidth
                            sx={{ mb: 3 }}
                            value={userSubcorpusTextData.name}
                            onChange={handleUserSubcorpusTextDataChange('name')}
                        />
                        <TextField
                            label="Опис"
                            fullWidth
                            multiline
                            rows={3}
                            sx={{ mb: 1 }}
                            value={userSubcorpusTextData.description}
                            onChange={handleUserSubcorpusTextDataChange('description')}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ bgcolor: colors.bgMain, p: 3 }}>
                    <Button onClick={() => setIsAddUserSubcorpusTextOpen(false)} sx={{ color: colors.textBrown, fontWeight: 'bold' }}>Скасувати</Button>
                    <Button
                        variant="contained"
                        onClick={submitUserSubcorpusText}
                        disabled={!userSubcorpusTextData.file || !userSubcorpusTextData.name.trim() || isCreatingText}
                        sx={{ bgcolor: colors.btnOutline, '&:hover': { bgcolor: '#5A632C' }, textTransform: 'none' }}
                    >
                        {isCreatingText ? 'Завантаження...' : 'Завантажити текст'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* SHARE MODAL */}
            <ShareModal
                open={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                targetId={shareTarget.id}
                targetName={shareTarget.name}
                shareType={shareTarget.type}
            />

            {/* MODAL: VIEW TEXTS */}
            <Dialog
                open={isViewTextsOpen}
                onClose={() => {
                    setIsViewTextsOpen(false);
                    dispatch(clearTextsList());
                    setTextsPage(0);
                }}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle sx={{ bgcolor: colors.bgMain, color: colors.textBrown, fontWeight: 'bold' }}>
                    Завантажені тексти
                </DialogTitle>
                <DialogContent sx={{ bgcolor: colors.bgMain, minHeight: '300px', p: 3, overflow: 'hidden' }}>
                    {isTextsLoading ? (
                        <Typography sx={{ mt: 2, textAlign: 'center', color: colors.textBrown }}>Завантаження списку текстів...</Typography>
                    ) : textsList && textsList.length > 0 ? (
                        <Paper sx={{ width: '100%', overflow: 'hidden', bgcolor: 'transparent', boxShadow: 'none' }}>
                            <TableContainer sx={{ maxHeight: 'calc(100vh - 280px)' }}>
                                <Table stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ bgcolor: colors.bgMain, color: colors.textBrown, fontWeight: 'bold' }}>Назва</TableCell>
                                            <TableCell sx={{ bgcolor: colors.bgMain, color: colors.textBrown, fontWeight: 'bold' }}>Автор</TableCell>
                                            <TableCell sx={{ bgcolor: colors.bgMain, color: colors.textBrown, fontWeight: 'bold' }}>Стиль</TableCell>
                                            <TableCell sx={{ bgcolor: colors.bgMain, color: colors.textBrown, fontWeight: 'bold' }}>Жанр</TableCell>
                                            <TableCell sx={{ bgcolor: colors.bgMain, color: colors.textBrown, fontWeight: 'bold' }}>Джерело</TableCell>
                                            <TableCell sx={{ bgcolor: colors.bgMain, color: colors.textBrown, fontWeight: 'bold', textAlign: 'right' }}>Рік</TableCell>
                                            <TableCell sx={{ bgcolor: colors.bgMain, color: colors.textBrown, fontWeight: 'bold', textAlign: 'center' }}>Дії</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {textsList
                                            .slice(textsPage * textsRowsPerPage, textsPage * textsRowsPerPage + textsRowsPerPage)
                                            .map((text) => {

                                                const styleObj = textMetadataOptions?.styles_with_genres?.find(s => s.id === text.metadata?.style);
                                                const styleName = styleObj ? styleObj.name : '—';

                                                const genreNames = text.metadata?.genres && text.metadata.genres.length > 0
                                                    ? text.metadata.genres.map(genreId => {
                                                        const genreObj = styleObj?.genres?.find(g => g.id === genreId);
                                                        return genreObj ? genreObj.name : '';
                                                    }).filter(Boolean).join(', ')
                                                    : '—';

                                                return (
                                                    <TableRow
                                                        hover
                                                        key={text.id}
                                                        onClick={() => handleViewTextDetail(text)}
                                                        sx={{ cursor: 'pointer' }}
                                                        title="Переглянути метадані тексту"
                                                    >
                                                        <TableCell sx={{ color: colors.textBrown, borderBottom: '1px solid rgba(90, 62, 41, 0.2)' }}>
                                                            {text.name}
                                                        </TableCell>
                                                        <TableCell sx={{ color: colors.textBrown, borderBottom: '1px solid rgba(90, 62, 41, 0.2)' }}>
                                                            {text.metadata?.author || '—'}
                                                        </TableCell>
                                                        <TableCell sx={{ color: colors.textBrown, borderBottom: '1px solid rgba(90, 62, 41, 0.2)' }}>
                                                            {styleName}
                                                        </TableCell>
                                                        <TableCell sx={{ color: colors.textBrown, borderBottom: '1px solid rgba(90, 62, 41, 0.2)' }}>
                                                            {genreNames}
                                                        </TableCell>
                                                        <TableCell sx={{ color: colors.textBrown, borderBottom: '1px solid rgba(90, 62, 41, 0.2)' }}>
                                                            {text.metadata?.source || '—'}
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ color: colors.textBrown, borderBottom: '1px solid rgba(90, 62, 41, 0.2)' }}>
                                                            {text.metadata?.year_of_creation || '—'}
                                                        </TableCell>
                                                        <TableCell align="center" sx={{ color: colors.textBrown, borderBottom: '1px solid rgba(90, 62, 41, 0.2)' }}>
                                                            <IconButton
                                                                size="small"
                                                                onClick={(event) => { event.stopPropagation(); handleDeleteText(text); }}
                                                                disabled={isDeletingText}
                                                                color="error"
                                                                title="Видалити текст"
                                                            >
                                                                <Delete fontSize="small" />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25]}
                                component="div"
                                count={textsList.length}
                                rowsPerPage={textsRowsPerPage}
                                page={textsPage}
                                onPageChange={(e, newPage) => setTextsPage(newPage)}
                                onRowsPerPageChange={(e) => {
                                    setTextsRowsPerPage(+e.target.value);
                                    setTextsPage(0);
                                }}
                                labelRowsPerPage="Рядків:"
                                sx={{ color: colors.textBrown, borderBottom: 'none' }}
                            />
                        </Paper>
                    ) : (
                        <Typography sx={{ p: 3, textAlign: 'center', color: colors.textBrown }}>
                            У цій колекції ще немає текстів.
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions sx={{ bgcolor: colors.bgMain, p: 2 }}>
                    <Button
                        onClick={() => {
                            setIsViewTextsOpen(false);
                            dispatch(clearTextsList());
                            setTextsPage(0);
                        }}
                        sx={{ color: colors.textBrown, fontWeight: 'bold' }}
                    >
                        Закрити
                    </Button>
                </DialogActions>
            </Dialog>

            {/* MODAL: COLLECTION METADATA (CORPUS/SUBCORPUS) */}
            <Dialog
                open={isMetadataDialogOpen}
                onClose={() => { setIsMetadataDialogOpen(false); setMetadataDialogTarget(null); setIsFilterCriteriaExpanded(false); }}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ bgcolor: colors.bgMain, color: colors.textBrown, fontWeight: 'bold' }}>
                    Метадані {metadataDialogTarget?._nodeType === 'corpus' ? 'корпусу' : 'підкорпусу'}
                </DialogTitle>
                <DialogContent sx={{ bgcolor: colors.bgMain, p: 3 }}>
                    {metadataDialogTarget ? (
                        <Box sx={{ color: colors.textBrown }}>
                            <MetaRow label="Назва" value={metadataDialogTarget.name} />
                            <MetaRow label="Опис" value={metadataDialogTarget.description} />

                            {metadataDialogTarget._nodeType === 'corpus' && (
                                <>
                                    <MetaRow
                                        label="Тип корпусу"
                                        value={
                                            metadataDialogTarget.type === 'G' ? 'Загальний' :
                                            metadataDialogTarget.type === 'E' ? 'Навчальний' :
                                            metadataDialogTarget.type === 'S' ? 'Спеціалізований' :
                                            metadataDialogTarget.type
                                        }
                                    />
                                    <MetaRow label="Мова" value={metadataDialogTarget.language === 'UK' ? 'Українська' : metadataDialogTarget.language} />
                                    <MetaRow label="Кількість підкорпусів" value={metadataDialogTarget._subcorpora_count} />
                                    <MetaRow
                                        label="Створив"
                                        value={metadataDialogTarget.creator_name || (metadataDialogTarget.creator_id ? `Користувач №${metadataDialogTarget.creator_id}` : null)}
                                    />
                                    <MetaRow label="Час оновлення" value={formatDate(metadataDialogTarget.update_time)} />
                                </>
                            )}

                            {metadataDialogTarget._nodeType === 'subcorpus' && (
                                <>
                                    <MetaRow
                                        label="Тип підкорпусу"
                                        value={metadataDialogTarget._subType === 'user' ? 'Користувацький' : 'Фільтраційний'}
                                    />
                                    <MetaRow label="Батьківський корпус" value={metadataDialogTarget._parentCorpusName} />
                                    <MetaRow
                                        label="Створив"
                                        value={metadataDialogTarget.creator_name || (metadataDialogTarget.creator_id ? `Користувач №${metadataDialogTarget.creator_id}` : null)}
                                    />
                                    <MetaRow label="Дата створення" value={formatDate(metadataDialogTarget.creation_time)} />

                                    {metadataDialogTarget._subType === 'filtered' && (
                                        <>

                                            <Box sx={{ mt: 2 }}>
                                                <Button
                                                    onClick={() => setIsFilterCriteriaExpanded(prev => !prev)}
                                                    sx={{ color: colors.textBrown, fontWeight: 'bold', pl: 0, textTransform: 'none' }}
                                                    endIcon={isFilterCriteriaExpanded ? <ExpandMore sx={{ transform: 'rotate(180deg)' }} /> : <ExpandMore />}
                                                >
                                                    Критерії фільтрації
                                                </Button>
                                                <Collapse in={isFilterCriteriaExpanded}>
                                                    <Box sx={{ pl: 1, pt: 1 }}>
                                                        <FilterCriteriaRows filters={metadataDialogTarget.filters} metadataOptions={metadataOptions} />
                                                    </Box>
                                                </Collapse>
                                            </Box>
                                        </>
                                    )}
                                </>
                            )}
                        </Box>
                    ) : (
                        <Typography sx={{ color: colors.textBrown }}>Немає даних для відображення.</Typography>
                    )}
                </DialogContent>
                <DialogActions sx={{ bgcolor: colors.bgMain, p: 2 }}>
                    <Button
                        onClick={() => { setIsMetadataDialogOpen(false); setMetadataDialogTarget(null); setIsFilterCriteriaExpanded(false); }}
                        sx={{ color: colors.textBrown, fontWeight: 'bold' }}
                    >
                        Закрити
                    </Button>
                </DialogActions>
            </Dialog>

            {/* MODAL: TEXT METADATA (DETAIL) */}
            <Dialog
                open={isTextDetailOpen}
                onClose={() => { setIsTextDetailOpen(false); setSelectedTextDetail(null); }}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ bgcolor: colors.bgMain, color: colors.textBrown, fontWeight: 'bold' }}>
                    Метадані тексту
                </DialogTitle>
                <DialogContent sx={{ bgcolor: colors.bgMain, p: 3 }}>
                    {selectedTextDetail ? (
                        <Box sx={{ color: colors.textBrown }}>
                            <MetaRow label="Назва" value={selectedTextDetail.name} />
                            <MetaRow label="Опис" value={selectedTextDetail.description} />
                            <MetaRow label="Автор" value={selectedTextDetail.metadata?.author} />
                            <MetaRow
                                label="Стать автора"
                                value={
                                    textMetadataOptions?.authors_genders?.find(
                                        g => g.value === selectedTextDetail.metadata?.authors_gender
                                    )?.label
                                }
                            />
                            <MetaRow
                                label="Стиль"
                                value={
                                    textMetadataOptions?.styles_with_genres?.find(
                                        s => s.id === selectedTextDetail.metadata?.style
                                    )?.name
                                }
                            />
                            <MetaRow
                                label="Жанр(и)"
                                value={
                                    selectedTextDetail.metadata?.genres && selectedTextDetail.metadata.genres.length > 0
                                        ? (() => {
                                            const styleObj = textMetadataOptions?.styles_with_genres?.find(
                                                s => s.id === selectedTextDetail.metadata?.style
                                            );
                                            return selectedTextDetail.metadata.genres
                                                .map(genreId => styleObj?.genres?.find(g => g.id === genreId)?.name)
                                                .filter(Boolean)
                                                .join(', ');
                                        })()
                                        : null
                                }
                            />
                            <MetaRow label="Джерело" value={selectedTextDetail.metadata?.source} />
                            <MetaRow
                                label="Походження тексту"
                                value={
                                    textMetadataOptions?.text_origins?.find(
                                        o => o.value === selectedTextDetail.metadata?.text_origin
                                    )?.label
                                }
                            />
                            <MetaRow label="Рік створення" value={selectedTextDetail.metadata?.year_of_creation} />
                            <MetaRow
                                label="Роки публікації"
                                value={
                                    Array.isArray(selectedTextDetail.metadata?.years_of_publication)
                                        ? selectedTextDetail.metadata.years_of_publication.filter(Boolean).join(' – ')
                                        : selectedTextDetail.metadata?.years_of_publication
                                }
                            />
                        </Box>
                    ) : (
                        <Typography sx={{ color: colors.textBrown }}>Немає даних для відображення.</Typography>
                    )}
                </DialogContent>
                <DialogActions sx={{ bgcolor: colors.bgMain, p: 2 }}>
                    <Button
                        onClick={() => { setIsTextDetailOpen(false); setSelectedTextDetail(null); }}
                        sx={{ color: colors.textBrown, fontWeight: 'bold' }}
                    >
                        Закрити
                    </Button>
                </DialogActions>
            </Dialog>

            {/* MODAL: CONFIRM TEXT DELETION */}
            <Dialog
                open={isDeleteTextConfirmOpen}
                onClose={handleCancelDeleteText}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ bgcolor: colors.bgMain, color: colors.textBrown, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Delete color="error" />
                    Видалити текст?
                </DialogTitle>
                <DialogContent sx={{ bgcolor: colors.bgMain, pb: 1 }}>
                    <Typography sx={{ color: colors.textBrown }}>
                        Ви впевнені, що хочете видалити текст «{textToDelete?.name}»? Цю дію неможливо скасувати.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ bgcolor: colors.bgMain, p: 2 }}>
                    <Button
                        onClick={handleCancelDeleteText}
                        sx={{ color: colors.textBrown, fontWeight: 'bold' }}
                    >
                        Скасувати
                    </Button>
                    <Button
                        onClick={handleConfirmDeleteText}
                        variant="contained"
                        color="error"
                        disabled={isDeletingText}
                    >
                        Видалити
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CorpusManager;