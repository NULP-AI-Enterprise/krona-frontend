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
} from '@mui/icons-material';

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
    resetTextCreated
} from '../store/corpusmanager/corpusSlice';

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
        createTextError
    } = useSelector(state => state.corpusManager || {
        corpora: [],
        isCorporaLoading: false,
        metadataOptions: { styles_with_genres: [], authors_genders: [], text_origins: [] },
        activeFilters: { targetCorpusId: '', newSubcorpusName: '', style: '', genre: '', years_of_publication: ['', ''], year_of_creation: '', author: '', authors_gender: '', text_origin: '' },
        textMetadataOptions: { corpuses: [], styles_with_genres: [], authors_genders: [], text_origins: [] },
        isCreatingText: false,
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
    const [activeMenuContext, setActiveMenuContext] = useState({ id: null, type: null });

    // State for the "Create custom subcorpus" modal
    const [isAddUserSubcorpusOpen, setIsAddUserSubcorpusOpen] = useState(false);
    const [newUserSubcorpusName, setNewUserSubcorpusName] = useState('');

    // --- DATA LOADING ---
    useEffect(() => {
        if (corpora.length === 0) {
            dispatch(fetchCorporaListStart());
            dispatch(fetchMetadataOptionsStart());
            dispatch(fetchTextMetadataOptionsStart());
        }
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
        const value = event.target.value;
        dispatch(setFilterValue({ field, value }));

        if (field === 'targetCorpusId' && value) {
            dispatch(fetchMetadataOptionsStart(value));
        }
    };

    const handleYearChange = (index) => (event) => {
        const newYears = [...activeFilters.years_of_publication];
        newYears[index] = event.target.value;
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
            .map(Number);
        
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
    const handleOpenMenu = (event, id, type, subType = null) => {
        event.stopPropagation();
        setMenuAnchorEl(event.currentTarget);
        setActiveMenuContext({ id, type, subType });
    };

    const handleCloseMenu = (event) => {
        if (event && event.stopPropagation) event.stopPropagation();
        setMenuAnchorEl(null);
    };

    const handleMenuAction = (actionType) => {
        if (actionType === 'view_texts') {
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
            const parentCorpus = corpora.find(c =>
                c.subcorpora?.some(sub => sub.id === activeMenuContext.id && sub.type === activeMenuContext.subType)
            );

            setUserSubcorpusTextData({
                file: null, fileName: '', name: '', description: '',
                corpus: parentCorpus ? parentCorpus.id : '',
                user_subcorpus: activeMenuContext.id
            });

            setIsAddUserSubcorpusTextOpen(true);

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
        setNewTextData({ ...newTextData, [field]: event.target.value });
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

        const metadata = {
            author: newTextData.author,
            authors_gender: newTextData.authors_gender,
            style: newTextData.style,
            genres: newTextData.genre ? [newTextData.genre] : [],
            year_of_creation: parseInt(newTextData.year_of_creation) || null,
            years_of_publication: newTextData.years_of_publication.split(',').map(y => parseInt(y.trim())).filter(y => !isNaN(y)),
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
    const filteredCorpora = corpora.map(corpus => {
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
                    label="Рік видання"
                    variant="standard"
                    fullWidth
                    value={activeFilters?.year_of_creation || ''}
                    onChange={handleFilterChange('year_of_creation')}
                    InputLabelProps={{ sx: { color: colors.bgCorpusRow, fontWeight: 'bold' } }}
                />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                <Typography sx={{ color: colors.bgCorpusRow, fontWeight: 'bold', mb: 1, fontSize: '0.95rem' }}>
                    Рік написання
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
    const hasUserSubcorpus = activeCorpusForMenu?.subcorpora?.some(sub => sub.type === 'user');

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
            </Box>

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
                                    onClick={(e) => handleOpenMenu(e, corpus.id, 'corpus')}
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
                                                            secondary={sub.type === 'user' ? 'Користувацький підкорпус' : 'Фільтраційний підкорпус'}
                                                            primaryTypographyProps={{ color: colors.textBrown, fontWeight: 'bold' }}
                                                            secondaryTypographyProps={{ color: '#884343', fontSize: '0.8rem' }}
                                                        />
                                                        <IconButton
                                                            edge="end"
                                                            disableRipple
                                                            onClick={(e) => handleOpenMenu(e, sub.id, 'subcorpus', sub.type)}
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
                                <TextField label="Рік створення" size="small" fullWidth placeholder="Напр. 1932" value={newTextData.year_of_creation} onChange={handleTextDataChange('year_of_creation')} />
                                <TextField label="Роки публікації" size="small" fullWidth placeholder="2012, 2017" value={newTextData.years_of_publication} onChange={handleTextDataChange('years_of_publication')} />
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
                {activeMenuContext.type === 'corpus' && !hasUserSubcorpus && (
                    <MenuItem onClick={() => handleMenuAction('create_user_subcorpus')}>
                        <ListItemIcon><CreateNewFolder fontSize="small" sx={{ color: colors.textBrown }} /></ListItemIcon>
                        <ListItemText>Створити кор. підкорпус</ListItemText>
                    </MenuItem>
                )}

                {activeMenuContext.type === 'corpus' && (
                    <MenuItem onClick={() => handleMenuAction('add_text_to_corpus')}>
                        <ListItemIcon><PostAdd fontSize="small" /></ListItemIcon>
                        <ListItemText>Додати текст</ListItemText>
                    </MenuItem>
                )}

                {activeMenuContext.type === 'subcorpus' && activeMenuContext.subType === 'user' && (
                    <MenuItem onClick={() => handleMenuAction('add_text_to_subcorpus')}>
                        <ListItemIcon><PostAdd fontSize="small" sx={{ color: colors.textBrown }} /></ListItemIcon>
                        <ListItemText>Додати текст</ListItemText>
                    </MenuItem>
                )}

                {((activeMenuContext.type === 'corpus' && !hasUserSubcorpus) ||
                  (activeMenuContext.type === 'subcorpus' && activeMenuContext.subType === 'user')) && (
                    <Divider />
                )}
                <MenuItem onClick={() => handleMenuAction('view_texts')}>
                    <ListItemIcon><MenuBook fontSize="small" sx={{ color: colors.textBrown }} /></ListItemIcon>
                    <ListItemText>Переглянути тексти</ListItemText>
                </MenuItem>

                <MenuItem onClick={() => handleMenuAction('delete')} sx={{ color: 'error.main' }}>
                    <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>
                    <ListItemText>Видалити</ListItemText>
                </MenuItem>
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
                                                    <TableRow hover key={text.id}>
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
        </Box>
    );
};

export default CorpusManager;