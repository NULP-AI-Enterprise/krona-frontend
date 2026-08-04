import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box, Typography, TextField, MenuItem, Button,
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, LinearProgress,
    FormControl, InputLabel, Select, Grid, IconButton
} from '@mui/material';

import './WordLists.css';
import { API_URL } from '../config';

import {
    fetchCorporaStart,
    setWlFieldToCount,
    setWlPos,
    setWlPatternText,
    setWlPatternMode,
    setWlResults, setWlSearchLoading, setWlHasSearched, setWlPage
} from '../store/concordance/concordanceSlice';

import leftAllSkip from '../assets/images/left_all_skip.png';
import left1Skip from '../assets/images/left_1_skip.png';
import right1Skip from '../assets/images/right_1_skip.png';
import rightAllSkip from '../assets/images/right_all_skip.png';

const WordLists = () => {
    const dispatch = useDispatch();

    const colors = {
        bgMain: 'var(--color-bg-light, #F0ECE1)',
        btnOutline: 'var(--color-accent-green, #677424)',
        textBrown: 'var(--color-text-main, #5A3E29)',
        bgDrawerBtn: 'var(--color-btn-hover, #40342B)',
        addText: 'var(--color-addittional-text, #8A5D3C)'
    };

    const {
        selected,
        wlFieldToCount: fieldToCount,
        wlPos: pos,
        wlPatternText: patternText,
        wlPatternMode: patternMode,
        wlResults: results,
        wlSearchLoading: searchLoading,
        wlHasSearched: hasSearched,
        wlPage: page
    } = useSelector(state => state.concordance);

    const rowsPerPage = 25;

    useEffect(() => {
        dispatch(fetchCorporaStart());
    }, [dispatch]);

    useEffect(() => {
        localStorage.setItem('concordance_selected_collection', JSON.stringify(selected));
    }, [selected]);

    const handleSearch = async (e) => {
        if (e && e.preventDefault) e.preventDefault();

        if (!selected || !selected.id) {
            alert('Оберіть колекцію на сторінці "Пошук у корпусі"');
            return;
        }

        dispatch(setWlSearchLoading(true));
        dispatch(setWlHasSearched(true));
        dispatch(setWlPage(0));

        const payload = {
            collection_id: selected.id,
            collection_type: selected.type,
            field_to_count: fieldToCount,
            pos: pos,
            pattern_text: patternText,
            pattern_mode: patternMode
        }

        try {
            const response = await fetch(`${API_URL}/word-list/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(errorData.error || "Помилка при виконанні запиту");
                dispatch(setWlResults([]));
            } else {
                const data = await response.json();
                dispatch(setWlResults(data));
            }
        } catch (error) {
            console.error("Search error:", error);
            alert("Помилка з'єднання з сервером");
        } finally {
            dispatch(setWlSearchLoading(false));
        }
    };

    const totalPages = Math.ceil(results.length / rowsPerPage);

    const handleFirstPage = () => dispatch(setWlPage(0));
    const handlePrevPage = () => dispatch(setWlPage(Math.max(0, page - 1)));
    const handleNextPage = () => dispatch(setWlPage(Math.min(totalPages - 1, page + 1)));
    const handleLastPage = () => dispatch(setWlPage(totalPages - 1));


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

            <Paper square elevation={0} className="wl-filter-paper">
                <FormControl
                    onSubmit={handleSearch}
                    component="form"
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        gap: 2,
                        width: '100%'
                    }}
                >
                    <Grid container spacing={2} alignItems="flex-end" justifyContent="center">
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <Typography variant="subtitle1" sx={{fontFamily: 'inherit', color: colors.btnOutline, fontWeight: 600,  letterSpacing: 1 }}>
                                    Тип пошуку
                                </Typography>
                                <Select
                                    value={fieldToCount}
                                    size='small'
                                    onChange={(e) => dispatch(setWlFieldToCount(e.target.value))}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                maxHeight: 300, 
                                                backgroundColor: colors.bgMain,
                                                border: `2px solid ${colors.textBrown}`,
                                                borderRadius: '5px',
                                                marginTop: '5px',
                                                
                                                '&::-webkit-scrollbar': {
                                                    width: '8px',
                                                },
                                                '&::-webkit-scrollbar-thumb': {
                                                    backgroundColor: colors.textBrown,
                                                    borderRadius: '10px',
                                                },
                                                '&::-webkit-scrollbar-track': {
                                                    backgroundColor: colors.bgMain,
                                                }
                                            },
                                        },
                                    }}
                                    sx = {{
                                        backgroundColor: colors.bgMain,
                                        borderRadius: '5px',
                                        fontFamily: 'inherit',
                                        fontSize: '1.2rem',
                                        className: "type-select-styled",

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

                                        '& .MuiSelect-select': { padding: '8px 12px' }
                                    }}
                                >
                                    <MenuItem value="tokens.form">Словоформа</MenuItem>
                                    <MenuItem value="tokens.lemma">Лема</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <Typography variant="subtitle1" sx={{fontFamily: 'inherit', color: colors.btnOutline, fontWeight: 600,  letterSpacing: 1 }}>
                                    Частина мови
                                </Typography>
                                <Select
                                    value={pos}
                                    onChange={(e) => dispatch(setWlPos(e.target.value))}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                maxHeight: 300, 
                                                backgroundColor: colors.bgMain,
                                                border: `2px solid ${colors.textBrown}`,
                                                borderRadius: '5px',
                                                marginTop: '5px',
                                                
                                                '&::-webkit-scrollbar': {
                                                    width: '8px',
                                                },
                                                '&::-webkit-scrollbar-thumb': {
                                                    backgroundColor: colors.textBrown,
                                                    borderRadius: '10px',
                                                },
                                                '&::-webkit-scrollbar-track': {
                                                    backgroundColor: colors.bgMain,
                                                }
                                            },
                                        },
                                    }}
                                    sx={{
                                        backgroundColor: colors.bgMain,
                                        borderRadius: '5px',
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

                                        '& .MuiSelect-select': { padding: '8px 12px' }
                                    }}
                                >
                                    <MenuItem value="">Всі</MenuItem>
                                    <MenuItem value="NOUN">Іменник</MenuItem>
                                    <MenuItem value="PROPN">Власна назва</MenuItem>
                                    <MenuItem value="ADJ">Прикметник</MenuItem>
                                    <MenuItem value="VERB">Дієслово / Дієприслівник</MenuItem>
                                    <MenuItem value="AUX">Допоміжне дієслово</MenuItem>
                                    <MenuItem value="ADV">Прислівник</MenuItem>
                                    <MenuItem value="PRON">Займенник</MenuItem>
                                    <MenuItem value="DET">Детермінатив / Займенникове слова</MenuItem>
                                    <MenuItem value="NUM">Числівник</MenuItem>
                                    <MenuItem value="ADP">Прийменник / Адпозиція</MenuItem>
                                    <MenuItem value="CCONJ">Сурядний сполучник</MenuItem>
                                    <MenuItem value="SCONJ">Підрядний сполучник</MenuItem>
                                    <MenuItem value="PART">Частка</MenuItem>
                                    <MenuItem value="INTJ">Вигук</MenuItem>
                                    <MenuItem value="SYM">Символ</MenuItem>
                                    <MenuItem value="X">Інше</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth>
                                <Typography variant="subtitle1" sx={{fontFamily: 'inherit', color: colors.btnOutline, fontWeight: 600,  letterSpacing: 1 }}>
                                    Тип фільтрації
                                </Typography>
                                <Select
                                    value={patternMode}
                                    onChange={(e) => dispatch(setWlPatternMode(e.target.value))}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                maxHeight: 300, 
                                                backgroundColor: colors.bgMain,
                                                border: `2px solid ${colors.textBrown}`,
                                                borderRadius: '5px',
                                                marginTop: '5px',
                                                
                                                '&::-webkit-scrollbar': {
                                                    width: '8px',
                                                },
                                                '&::-webkit-scrollbar-thumb': {
                                                    backgroundColor: colors.textBrown,
                                                    borderRadius: '10px',
                                                },
                                                '&::-webkit-scrollbar-track': {
                                                    backgroundColor: colors.bgMain,
                                                }
                                            },
                                        },
                                    }}
                                    sx = {{
                                        backgroundColor: colors.bgMain,
                                        borderRadius: '5px',
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

                                        '& .MuiSelect-select': { padding: '8px 12px' }
                                    }}
                                >
                                    <MenuItem value="starts_with">Починається з</MenuItem>
                                    <MenuItem value="contains">Містить</MenuItem>
                                    <MenuItem value="ends_with">Закінчується на</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={9}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                value={patternText}
                                onChange={(e) => dispatch(setWlPatternText(e.target.value))}
                                placeholder='Фільтр тексту'
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
                        </Grid>

                        <Grid item xs={12} md={1.7}>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleSearch}
                                className="wl-search-button"
                                disabled={searchLoading}
                                sx={{fontFamily:'inherit'}}
                            >
                                {searchLoading ? 'Завантаження...' : 'Пошук'}
                            </Button>
                        </Grid>
                    </Grid>
                </FormControl>
            </Paper>

            {searchLoading ? <LinearProgress color="inherit" className="wl-loading" /> : (
                <>
                    <TableContainer component={Paper} elevation={0} className="wl-table-container">
                        <Table>
                            <TableHead className="wl-table-head">
                                <TableRow>
                                    <TableCell width="4%" className="wl-head-cell">#</TableCell>
                                    <TableCell width="25%" className="wl-head-cell">Слово / Лема</TableCell>
                                    <TableCell width="17%" align="right" className="wl-head-cell">Абсолютна</TableCell>
                                    <TableCell width="17%" align="right" className="wl-head-cell">Відносна</TableCell>
                                    <TableCell width="17%" align="right" className="wl-head-cell">IPM</TableCell>
                                    <TableCell width="20%" className="wl-head-cell">Візуалізація</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {results
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((row, index) => (
                                    <TableRow key={index} hover className="wl-table-row">
                                        <TableCell className="wl-cell-index">{page * rowsPerPage + index + 1}</TableCell>
                                        <TableCell className="wl-cell-word">{row.word}</TableCell>
                                        <TableCell align="right" className="wl-cell-count">{row.absolute_count.toLocaleString()}</TableCell>
                                        <TableCell align="right" className="wl-cell-count">{row.percent_str}</TableCell>
                                        <TableCell align="right" className="wl-cell-count">{row.relative_freq.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Box className="wl-progress-box">
                                                <Box className="wl-progress-wrapper">
                                                    <LinearProgress
                                                        color="success"
                                                        variant="determinate"
                                                        value={row.percent_val}
                                                        className="wl-progress-bar"
                                                    />
                                                </Box>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {results.length === 0 && !searchLoading && hasSearched && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" className="wl-empty-message">
                                            Нічого не знайдено. Змініть параметри пошуку.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Pagination Bar */}
                    {results.length > 0 && (
                        <div className="custom-pagination-bar">
                            <IconButton onClick={handleFirstPage} disabled={page === 0} size="small">
                                <img
                                    src={leftAllSkip}
                                    alt="First"
                                    className={`pagination-icon ${page === 0 ? 'disabled' : ''}`}
                                />
                            </IconButton>

                            <IconButton onClick={handlePrevPage} disabled={page === 0} size="small">
                                <img
                                    src={left1Skip}
                                    alt="Prev"
                                    className={`pagination-icon ${page === 0 ? 'disabled' : ''}`}
                                />
                            </IconButton>

                            <div className="pagination-text-box">
                                {page + 1}
                            </div>
                            <span className="pagination-total-text">з {totalPages}</span>

                            <IconButton onClick={handleNextPage} disabled={page >= totalPages - 1} size="small">
                                <img
                                    src={right1Skip}
                                    alt="Next"
                                    className={`pagination-icon ${page >= totalPages - 1 ? 'disabled' : ''}`}
                                />
                            </IconButton>

                            <IconButton onClick={handleLastPage} disabled={page >= totalPages - 1} size="small">
                                <img
                                    src={rightAllSkip}
                                    alt="Last"
                                    className={`pagination-icon ${page >= totalPages - 1 ? 'disabled' : ''}`}
                                />
                            </IconButton>
                        </div>
                    )}
                </>
            )}
        </Box>
    );
};

export default WordLists;