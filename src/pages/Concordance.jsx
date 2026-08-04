import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './Concordance.css';

import {
    setQuery, setSearchType, setLeftContextSize, setRightContextSize,
    searchStart, fetchCorporaStart, exportStart, exportFailure
} from '../store/concordance/concordanceSlice';

import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Card, CardContent, Typography, Box , Select, MenuItem,
  TextField, FormControl, Button,
  ToggleButton, ToggleButtonGroup, Stack, CircularProgress, Snackbar, Alert
} from '@mui/material';

import DownloadIcon from '@mui/icons-material/Download';
import leftAllSkip from '../assets/images/left_all_skip.png';
import left1Skip from '../assets/images/left_1_skip.png';
import right1Skip from '../assets/images/right_1_skip.png';
import rightAllSkip from '../assets/images/right_all_skip.png';
import MorphologicalSearchModal from '../components/MorphologicalSearchModal';

const Concordance = () => {
    const dispatch = useDispatch();

    const {
        query, searchType, results, error, loading,
        leftContextSize, rightContextSize, stats,
        selected, corpora, pagination,
        exporting, exportError
    } = useSelector((state) => state.concordance);

    const [morphModalOpen, setMorphModalOpen] = useState(false);

    const colors = {
        bgMain: 'var(--color-bg-light, #F0ECE1)',
        btnOutline: 'var(--color-accent-green, #677424)',
        textBrown: 'var(--color-text-main, #5A3E29)',
        bgDrawerBtn: 'var(--color-btn-hover, #40342B)',
        addText: 'var(--color-addittional-text, #8A5D3C)'
    };

    useEffect(() => {
        if (corpora.length === 0) {
            dispatch(fetchCorporaStart());
        }
    }, [dispatch, corpora.length]);

    useEffect(() => {
        localStorage.setItem('concordance_selected_collection', JSON.stringify(selected));
    }, [selected]);


    const handleSearch = (e, targetPage = 1) => {
        if (e) e.preventDefault();

        if (!selected?.id) {
            alert('Оберіть колекцію на сторінці "Пошук у корпусі"');
            return;
        }

        dispatch(searchStart({
            query,
            searchType,
            leftContextSize,
            rightContextSize,
            collectionId: selected.id,
            collectionType: selected.type,
            page: targetPage,
            pageSize: pagination.pageSize
        }));
    };

    const handleDownload = () => {
        if (results.length === 0 || exporting) return;

        dispatch(exportStart({
            query,
            searchType,
            leftContextSize,
            rightContextSize,
            collectionId: selected.id,
            collectionType: selected.type
        }));
    };

    const handleInsertTag = (tag) => {
        dispatch(setQuery(query + tag));
    };

    const handleFirstPage = () => handleSearch(null, 1);
    const handlePrevPage = () => handleSearch(null, Math.max(1, pagination.page - 1));
    const handleNextPage = () => handleSearch(null, Math.min(pagination.totalPages, pagination.page + 1));
    const handleLastPage = () => handleSearch(null, pagination.totalPages);

    return (
        <Box style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
            <Typography component='span' variant="h5" sx={{ display: 'block', mb: 2 }}>
                {!selected?.id || !selected?.name ? (
                    <Box component='span' sx={{ color: colors.textBrown }}>
                        Оберіть колекцію на сторінці <b>"Пошук у корпусі"</b>
                    </Box>
                ) : (
                    <>
                        <Box component='span' sx={{ color: colors.textBrown }}>Пошук у {selected.type === 'corpus' ? 'корпусі' : 'підкорпусі'} </Box>
                        <Box component='span' sx={{ color: colors.addText }}>«<b>{selected.name}</b>»</Box>
                    </>
                )}
            </Typography>

            <Box className="concordance-container" style={{ width: '100%', margin: '8px 0px 0px 0px'}}>
                        <FormControl
                            onSubmit={handleSearch}
                            className="search-header"
                            component="form"
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'flex-start',
                                gap: 2,
                                width: '100%'
                            }}
                        >
                            <Select
                                value={searchType}
                                onChange={(e) => dispatch(setSearchType(e.target.value))}
                                className="type-select-styled"
                                size='small'
                                sx = {{
                                    backgroundColor: colors.bgMain,
                                    borderRadius: '5px',
                                    minWidth: '163px',
                                    fontFamily: 'inherit',
                                    fontSize: '1.2rem',

                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: colors.textBrown,
                                        borderWidth: '2px',
                                        borderRadius: '5px',
                                    },

                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: colors.textBrown,
                                    },

                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: colors.textBrown,
                                    },

                                    '& .MuiSelect-icon': {
                                        color: colors.textBrown,
                                    },

                                    '& .MuiSelect-select': { padding: '0px 4px' }

                                }}
                            >
                                <MenuItem value="form_match">Словоформа</MenuItem>
                                <MenuItem value="lemma_match">Лема</MenuItem>
                                <MenuItem value="phrase_match">Словосполучення</MenuItem>
                                <MenuItem value="cql_match">CQL</MenuItem>
                            </Select>

                            <Box className="search-controls" sx={{ minWidth: 0, flexGrow: 1 }}
                            >
                                <Box className="input-group" sx={{width: '100%', minWidth: 0 }}>
                                    <TextField
                                        value={query}
                                        onChange={(e) => dispatch(setQuery(e.target.value))}
                                        placeholder={searchType === 'cql' ? "Приклад: {мама} [дієслово]" : "Введіть слово..."}
                                        fullWidth
                                        variant='outlined'
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                              backgroundColor: colors.bgMain,
                                              borderRadius: '5px',
                                              fontSize: '1.2rem',
                                              fontFamily: 'inherit',

                                              "& .MuiOutlinedInput-notchedOutline": {
                                                borderColor: colors.textBrown,
                                                borderWidth: '2px',
                                              },
                                              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                                borderColor: colors.textBrown,
                                              },
                                              "&:hover .MuiOutlinedInput-notchedOutline": {
                                                borderColor: colors.textBrown,
                                              },
                                            },
                                            "& .MuiInputBase-input": {
                                              padding: '8px 15px',
                                            }
                                        }}
                                    />
                                    <Box>
                                        <IconButton
                                            title="Завантажити всі результати"
                                            onClick={handleDownload}
                                            disabled={results.length === 0 || exporting}
                                            style={{ paddingTop: '4px', opacity: (results.length === 0 || exporting) ? 0.5 : 1, cursor: (results.length === 0 || exporting) ? 'default' : 'pointer' }}
                                        >
                                            {exporting ? <CircularProgress size={24} sx={{color: colors.textBrown}} /> : <DownloadIcon sx={{color: colors.textBrown, fontSize: 35}}/>}
                                        </IconButton>
                                    </Box>
                                </Box>

                                {searchType === 'cql_match' && (
                                    <Box className="cql-toolbar">
                                        <Button
                                            variant="contained"
                                            size='small'
                                            onClick={() => handleInsertTag('{}')}
                                            sx={{
                                                fontFamily: 'inherit',
                                                backgroundColor: colors.bgMain,
                                                color : colors.textBrown,
                                                '&:hover': {
                                                    backgroundColor: colors.textBrown,
                                                    color : colors.bgMain,
                                                },
                                            }}
                                        >
                                            {"{Лема}"}
                                        </Button>

                                        <Button
                                            variant="contained"
                                            size='small'
                                            onClick={() => handleInsertTag('""')}
                                            sx={{
                                                fontFamily: 'inherit',
                                                backgroundColor: colors.bgMain,
                                                color : colors.textBrown,
                                                '&:hover': {
                                                    backgroundColor: colors.textBrown,
                                                    color : colors.bgMain,
                                                },
                                            }}
                                        >
                                            {"\"Слово\""}
                                        </Button>

                                        <Button
                                            variant="contained"
                                            size='small'
                                            onClick={() => handleInsertTag('[]')}
                                            sx={{
                                                fontFamily: 'inherit',
                                                backgroundColor: colors.bgMain,
                                                color : colors.textBrown,
                                                '&:hover': {
                                                    backgroundColor: colors.textBrown,
                                                    color : colors.bgMain,
                                                },
                                            }}
                                        >
                                            {"[Частина]"}
                                        </Button>

                                        <Button
                                            variant="contained"
                                            size='small'
                                            onClick={() => handleInsertTag('<1>')}
                                            sx={{
                                                fontFamily: 'inherit',
                                                backgroundColor: colors.bgMain,
                                                color : colors.textBrown,
                                                '&:hover': {
                                                    backgroundColor: colors.textBrown,
                                                    color : colors.bgMain,
                                                },
                                            }}
                                        >
                                            {"<Відст.>"}
                                        </Button>

                                        <Button
                                            variant="contained"
                                            size='small'
                                            onClick={() => setMorphModalOpen(true)}
                                            sx={{
                                                fontFamily: 'inherit',
                                                backgroundColor: colors.btnOutline,
                                                color: '#fff',
                                                '&:hover': {
                                                    backgroundColor: colors.bgDrawerBtn,
                                                    color: '#fff',
                                                },
                                            }}
                                        >
                                            Морфологія
                                        </Button>

                                    </Box>
                                )}
                                <Box sx={{ mt: 3, mb: 0, width: '60%', alignSelf : 'center' }}>
                                    <Stack direction="row" justifyContent="space-between" sx={{ my : '-10px' }}>
                                        <Typography variant="body2" sx={{fontFamily: 'inherit', color: colors.addText, fontWeight: 500,  letterSpacing: 1 }}>
                                            Лівий контекст
                                        </Typography>
                                        <Typography variant="body2" sx={{fontFamily: 'inherit', color: colors.addText, fontWeight: 500, letterSpacing: 1 }}>
                                            Правий контекст
                                        </Typography>
                                    </Stack>

                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 3,
                                        p: 1.5,
                                    }}>

                                        <ToggleButtonGroup
                                            value={leftContextSize}
                                            exclusive
                                            onChange={(e, nextValue) => {
                                                if (nextValue !== null || leftContextSize !== null) {
                                                    dispatch(setLeftContextSize(nextValue));
                                                }
                                            }}
                                            sx={{
                                                '& .MuiToggleButton-root': {
                                                    borderColor: colors.textBrown,
                                                    color: colors.textBrown,
                                                    '&.Mui-selected': {
                                                        backgroundColor: colors.textBrown,
                                                        color: '#fff',
                                                        '&:hover': { backgroundColor: colors.bgDrawerBtn }
                                                    }
                                                }
                                            }}
                                        >
                                            <ToggleButton value={null} aria-label="all left" sx={{px : '15px'}}>Усі</ToggleButton>
                                            {[5, 4, 3, 2, 1].map((num) => (
                                                <ToggleButton sx={{px : '18px'}} key={num} value={num}>{num}</ToggleButton>
                                            ))}
                                        </ToggleButtonGroup>

                                        <Typography
                                            variant="h6"
                                            sx={{
                                                px: 2,
                                                py: 0.8,
                                                color: colors.btnOutline,
                                                borderRadius: '6px',
                                            }}
                                        >
                                            KWIC
                                        </Typography>

                                        <ToggleButtonGroup
                                            value={rightContextSize}
                                            exclusive
                                            onChange={(e, nextValue) => {
                                                if (nextValue !== null || rightContextSize !== null) {
                                                    dispatch(setRightContextSize(nextValue));
                                                }
                                            }}
                                            sx={{
                                                '& .MuiToggleButton-root': {
                                                    borderColor: colors.textBrown,
                                                    color: colors.textBrown,
                                                    '&.Mui-selected': {
                                                        backgroundColor: colors.textBrown,
                                                        color: '#fff',
                                                        '&:hover': { backgroundColor: colors.bgDrawerBtn }
                                                    }
                                                }
                                            }}
                                        >
                                            {[1, 2, 3, 4, 5].map((num) => (
                                                <ToggleButton sx={{px : '18px'}} key={num} value={num}>{num}</ToggleButton>
                                            ))}
                                            <ToggleButton value={null} aria-label="all right" sx={{px : '15px'}}>Усі</ToggleButton>
                                        </ToggleButtonGroup>
                                    </Box>
                                </Box>

                                <Button
                                    variant="contained"
                                    type="submit"
                                    className="search-btn-main"
                                    disabled={loading}
                                    sx={{
                                        fontFamily: 'inherit',
                                        backgroundColor: colors.textBrown,
                                        color : colors.bgMain,
                                        '&:hover': {
                                            backgroundColor: colors.bgDrawerBtn,
                                            color : colors.bgMain,
                                        },
                                    }}
                                >
                                    Пошук
                                </Button>
                            </Box>
                        </FormControl>

                        {stats.absolute_count !== 0 && (
                            <Box className="stats-container" sx={{flexDirection: 'row'}}>
                                <Card className="stats-card-custom">
                                    <CardContent className="stats-card-content">
                                        <Typography variant="h6" component="Box" className="stats-title">
                                            {stats.search_type}
                                            <Box
                                                component="span"
                                                className="stats-lemma-highlight"
                                                sx={{
                                                    maxWidth: '50%',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    display: 'inline-block',
                                                    verticalAlign: 'bottom'
                                                }}
                                            >
                                                {stats.query.toLowerCase()}
                                            </Box>
                                            <Box component="span" className="stats-separator">|</Box>
                                            &nbsp; {stats.absolute_count}
                                        </Typography>

                                        <Typography variant="body2" className="stats-subtitle">
                                            {stats.relative_freq} на млн токенів
                                            &nbsp;&nbsp;
                                            <Box component="span" className="stats-separator">|</Box>
                                            &nbsp;&nbsp;
                                            {stats.percent_str}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Box>
                        )}
                    </Box>

                    <Box className="results-container">
                        {error && <h3 className="error-message">{error}</h3>}

                        {results.length > 0 && (
                            <>
                        <Paper className="mui-paper-container">
                                    <TableContainer>
                                        <Table stickyHeader aria-label="concordance table" className="mui-table-fixed">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell className="mui-table-head-cell col-width-id">
                                                        Текст
                                                    </TableCell>
                                                    <TableCell align="right" className="mui-table-head-cell col-width-ctx">
                                                        Лівий контекст
                                                    </TableCell>
                                                    <TableCell align="center" className="mui-table-head-cell col-width-kwic">
                                                        KWIC
                                                    </TableCell>
                                                    <TableCell align="left" className="mui-table-head-cell no-border-right col-width-ctx">
                                                        Правий контекст
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {results.map((res, index) => (
                                                    <TableRow hover key={index} className="mui-table-row">
                                                        <TableCell component="th" scope="row" className="mui-table-cell">
                                                            {res.document_name || 'N/A'}
                                                        </TableCell>

                                                        <TableCell align="right" className="mui-table-cell cell-content-text">
                                                            <bdi>{res.left_context}</bdi>
                                                        </TableCell>

                                                        <TableCell align="center" className="mui-table-cell">
                                                            <Box className="kwic-badge">
                                                                {res.searched_sentence}
                                                            </Box>
                                                        </TableCell>

                                                        <TableCell align="left" className="mui-table-cell no-border-right cell-content-text">
                                                            {res.right_context}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Paper>

                                <Box className="custom-pagination-bar">
                                    <IconButton onClick={handleFirstPage} disabled={pagination.page <= 1 || loading} size="small">
                                <img
                                    src={leftAllSkip}
                                    alt="First"
                                    className={`pagination-icon ${pagination.page <= 1 ? 'disabled' : ''}`}
                                />
                                    </IconButton>

                                    <IconButton onClick={handlePrevPage} disabled={pagination.page <= 1 || loading} size="small">
                                <img
                                    src={left1Skip}
                                    alt="Prev"
                                    className={`pagination-icon ${pagination.page <= 1 ? 'disabled' : ''}`}
                                />
                                    </IconButton>
                                    <Box className="pagination-text-box">{pagination.page}</Box>
                                    <span className="pagination-total-text">з {pagination.totalPages || 1}</span>

                                    <IconButton onClick={handleNextPage} disabled={pagination.page >= pagination.totalPages || loading} size="small">
                                <img
                                    src={right1Skip}
                                    alt="Next"
                                    className={`pagination-icon ${pagination.page >= pagination.totalPages ? 'disabled' : ''}`}
                                />
                                    </IconButton>

                                    <IconButton onClick={handleLastPage} disabled={pagination.page >= pagination.totalPages || loading} size="small">
                                <img
                                    src={rightAllSkip}
                                    alt="Last"
                                    className={`pagination-icon ${pagination.page >= pagination.totalPages ? 'disabled' : ''}`}
                                />
                                    </IconButton>
                                </Box>
                            </>
                        )}
                    </Box>

            <MorphologicalSearchModal
                open={morphModalOpen}
                onClose={() => setMorphModalOpen(false)}
                onSubmit={(cql) => dispatch(setQuery(query + cql))}
            />

            <Snackbar
                open={!!exportError}
                autoHideDuration={5000}
                onClose={() => dispatch(exportFailure(null))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity="error" onClose={() => dispatch(exportFailure(null))}>
                    {exportError}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Concordance;