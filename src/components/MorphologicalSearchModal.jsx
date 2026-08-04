import { useState, useMemo, useEffect, useCallback } from 'react';
import {
    Dialog, DialogContent, Box, Typography, Button,
    Checkbox, FormControlLabel, FormGroup, Tooltip, Snackbar, Alert
} from '@mui/material';
import './MorphologicalSearchModal.css';

const POS_OPTIONS = [
    { label: 'Іменник', code: 'NOUN' },
    { label: 'Займенник', code: 'PRON' },
    { label: 'Прикметник', code: 'ADJ' },
    { label: 'Дієслово', code: 'VERB' },
    { label: 'Предикатив', code: 'ADV' },
    { label: 'Прийменник', code: 'ADP' },
    { label: 'Прислівник', code: 'ADV' },
    { label: 'Дієприслівник', code: 'VERB', morph: { verbform: 'conv' } },
    { label: 'Числівник', code: 'NUM' },
    { label: 'Частка', code: 'PART' },
    { label: 'Сполучник', code: 'CCONJ' },
    { label: 'Вигук', code: 'INTJ' },
];

const CASE_OPTIONS = [
    { label: 'Називний', code: 'nom' },
    { label: 'Родовий', code: 'gen' },
    { label: 'Давальний', code: 'dat' },
    { label: 'Знахідний', code: 'acc' },
    { label: 'Орудний', code: 'ins' },
    { label: 'Місцевий', code: 'loc' },
    { label: 'Кличний', code: 'voc' },
];

const GENDER_OPTIONS = [
    { label: 'Жіночий', code: 'fem' },
    { label: 'Чоловічий', code: 'masc' },
    { label: 'Середній', code: 'neut' },
];

const NUMBER_OPTIONS = [
    { label: 'Однина', code: 'sing' },
    { label: 'Множина', code: 'plur' },
];

const DEGREE_OPTIONS = [
    { label: 'Вищий', code: 'cmp' },
    { label: 'Найвищий', code: 'sup' },
];

const ANIMACY_OPTIONS = [
    { label: 'Істота', code: 'anim' },
    { label: 'Неістота', code: 'inan' },
];

const CATEGORY_OPTIONS = [
    { label: 'Особовий', code: 'prs' },
    { label: 'Присвійний', code: 'prs', morph: { poss: 'yes' } },
    { label: 'Вказівний', code: 'dem' },
    { label: 'Означальний', code: 'tot' },
    { label: 'Питальний', code: 'int' },
    { label: 'Відносний', code: 'rel' },
    { label: 'Неозначений', code: 'ind' },
    { label: 'Заперечний', code: 'neg' },
    { label: 'Зворотний', code: 'rcp' },
];

const CONJUNCTION_OPTIONS = [
    { label: 'Сурядні', code: 'CCONJ' },
    { label: 'Підрядні', code: 'SCONJ' },
];

const TENSE_OPTIONS = [
    { label: 'Минулий', code: 'past' },
    { label: 'Теперішній', code: 'pres' },
    { label: 'Майбутній', code: 'fut' },
];

const PERSON_OPTIONS = [
    { label: 'Перша', code: '1' },
    { label: 'Друга', code: '2' },
    { label: 'Третя', code: '3' },
];

const POS_APPLICABLE_CATEGORIES = {
    'Іменник': ['case', 'gender', 'number', 'animacy'],
    'Займенник': ['case', 'gender', 'number', 'category', 'person', 'animacy'],
    'Прикметник': ['case', 'gender', 'number', 'comparisonDegree'],
    'Дієслово': ['tense', 'person', 'number', 'gender'],
    'Предикатив': [],
    'Прийменник': [],
    'Прислівник': ['comparisonDegree'],
    'Дієприслівник': [],
    'Числівник': ['case', 'gender', 'number'],
    'Частка': [],
    'Сполучник': ['conjunctionType'],
    'Вигук': [],
};

const ALL_DEPENDENT_GROUPS = [
    'case', 'gender', 'number', 'comparisonDegree',
    'animacy', 'category', 'conjunctionType', 'tense', 'person'
];

const INITIAL_FILTERS = {
    partOfSpeech: [],
    case: [],
    gender: [],
    number: [],
    comparisonDegree: [],
    animacy: [],
    category: [],
    conjunctionType: [],
    tense: [],
    person: [],
};

function buildCqlQuery(filters) {
    const parts = [];

    let posValues = [];
    const extraMorphFromPos = {};

    filters.partOfSpeech.forEach(label => {
        const opt = POS_OPTIONS.find(o => o.label === label);
        if (!opt) return;

        if (label === 'Сполучник' && filters.conjunctionType.length > 0) {
            filters.conjunctionType.forEach(ct => {
                const ctOpt = CONJUNCTION_OPTIONS.find(o => o.label === ct);
                if (ctOpt) posValues.push(ctOpt.code);
            });
        } else if (label === 'Дієприслівник') {
            posValues.push(opt.code);
            extraMorphFromPos['verbform'] = 'conv';
        } else {
            posValues.push(opt.code);
        }
    });

    posValues = [...new Set(posValues)];

    if (posValues.length === 0 && Object.keys(extraMorphFromPos).length === 0) {
        return '';
    }

    if (posValues.length > 0) {
        parts.push(`pos="${posValues.join('|')}"`);
    }

    for (const [key, val] of Object.entries(extraMorphFromPos)) {
        parts.push(`${key}="${val}"`);
    }

    if (filters.case.length > 0) {
        const codes = filters.case.map(l => CASE_OPTIONS.find(o => o.label === l)?.code).filter(Boolean);
        if (codes.length > 0) parts.push(`case="${codes.join('|')}"`);
    }

    if (filters.gender.length > 0) {
        const codes = filters.gender.map(l => GENDER_OPTIONS.find(o => o.label === l)?.code).filter(Boolean);
        if (codes.length > 0) parts.push(`gender="${codes.join('|')}"`);
    }

    if (filters.number.length > 0) {
        const codes = filters.number.map(l => NUMBER_OPTIONS.find(o => o.label === l)?.code).filter(Boolean);
        if (codes.length > 0) parts.push(`number="${codes.join('|')}"`);
    }

    if (filters.comparisonDegree.length > 0) {
        const codes = filters.comparisonDegree.map(l => DEGREE_OPTIONS.find(o => o.label === l)?.code).filter(Boolean);
        if (codes.length > 0) parts.push(`degree="${codes.join('|')}"`);
    }

    if (filters.animacy.length > 0) {
        const codes = filters.animacy.map(l => ANIMACY_OPTIONS.find(o => o.label === l)?.code).filter(Boolean);
        if (codes.length > 0) parts.push(`animacy="${codes.join('|')}"`);
    }

    if (filters.category.length > 0) {
        const codes = filters.category.map(l => CATEGORY_OPTIONS.find(o => o.label === l)?.code).filter(Boolean);
        const uniqueCodes = [...new Set(codes)];
        if (uniqueCodes.length > 0) parts.push(`prontype="${uniqueCodes.join('|')}"`);
    }

    if (filters.tense.length > 0) {
        const codes = filters.tense.map(l => TENSE_OPTIONS.find(o => o.label === l)?.code).filter(Boolean);
        if (codes.length > 0) parts.push(`tense="${codes.join('|')}"`);
    }

    if (filters.person.length > 0) {
        const codes = filters.person.map(l => PERSON_OPTIONS.find(o => o.label === l)?.code).filter(Boolean);
        if (codes.length > 0) parts.push(`person="${codes.join('|')}"`);
    }

    return `[${parts.join(' & ')}]`;
}

export default function MorphologicalSearchModal({ open, onClose, onSubmit }) {
    const [filters, setFilters] = useState(INITIAL_FILTERS);
    const [error, setError] = useState('');

    const enabledCategories = useMemo(() => {
        const set = new Set();
        filters.partOfSpeech.forEach(pos => {
            (POS_APPLICABLE_CATEGORIES[pos] || []).forEach(cat => set.add(cat));
        });
        return set;
    }, [filters.partOfSpeech]);

    useEffect(() => {
        setFilters(prev => {
            const next = { ...prev };
            let changed = false;
            ALL_DEPENDENT_GROUPS.forEach(group => {
                if (!enabledCategories.has(group) && next[group].length > 0) {
                    next[group] = [];
                    changed = true;
                }
            });
            return changed ? next : prev;
        });
    }, [enabledCategories]);

    const toggleFilter = useCallback((group, value) => {
        setFilters(prev => {
            const arr = prev[group];
            const next = arr.includes(value)
                ? arr.filter(v => v !== value)
                : [...arr, value];
            return { ...prev, [group]: next };
        });
    }, []);

    const handleSubmit = () => {
        const hasAny = Object.values(filters).some(arr => arr.length > 0);
        if (!hasAny) {
            setError('Оберіть хоча б один параметр');
            return;
        }
        const cql = buildCqlQuery(filters);
        if (!cql) {
            setError('Не вдалося побудувати запит');
            return;
        }
        onSubmit(cql);
        setFilters(INITIAL_FILTERS);
        onClose();
    };

    const handleClose = () => {
        setFilters(INITIAL_FILTERS);
        onClose();
    };

    const renderGroup = (title, group, options, disabled) => (
        <Box className={`morph-group ${disabled ? 'morph-group--disabled' : ''}`}>
            <Typography className="morph-group__title">{title}:</Typography>
            <Tooltip
                title={disabled ? 'Недоступно для обраної частини мови' : ''}
                placement="top"
                arrow
            >
                <FormGroup className="morph-group__checkboxes">
                    {options.map(opt => (
                        <FormControlLabel
                            key={opt.label}
                            disabled={disabled}
                            control={
                                <Checkbox
                                    checked={filters[group].includes(opt.label)}
                                    onChange={() => toggleFilter(group, opt.label)}
                                    size="small"
                                    className="morph-checkbox"
                                />
                            }
                            label={opt.label}
                            className="morph-checkbox-label"
                        />
                    ))}
                </FormGroup>
            </Tooltip>
        </Box>
    );

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="lg"
                fullWidth
                PaperProps={{ className: 'morph-modal-paper' }}
            >
                <DialogContent className="morph-modal-content">
                    <Box className="morph-modal-header">
                        <Typography className="morph-modal-title">
                            Морфологічний пошук
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            className="morph-submit-btn"
                        >
                            Утворити запит
                        </Button>
                    </Box>

                    <Box className="morph-grid">
                        {renderGroup('Частина мови', 'partOfSpeech', POS_OPTIONS, false)}
                        {renderGroup('Відмінок', 'case', CASE_OPTIONS, !enabledCategories.has('case'))}
                        {renderGroup('Рід', 'gender', GENDER_OPTIONS, !enabledCategories.has('gender'))}
                        {renderGroup('Число', 'number', NUMBER_OPTIONS, !enabledCategories.has('number'))}
                        {renderGroup('Ступінь порівняння', 'comparisonDegree', DEGREE_OPTIONS, !enabledCategories.has('comparisonDegree'))}
                        {renderGroup('Істота / Неістота', 'animacy', ANIMACY_OPTIONS, !enabledCategories.has('animacy'))}
                        {renderGroup('Розряд', 'category', CATEGORY_OPTIONS, !enabledCategories.has('category'))}
                        {renderGroup('Сполучники', 'conjunctionType', CONJUNCTION_OPTIONS, !enabledCategories.has('conjunctionType'))}
                        {renderGroup('Час', 'tense', TENSE_OPTIONS, !enabledCategories.has('tense'))}
                        {renderGroup('Особа', 'person', PERSON_OPTIONS, !enabledCategories.has('person'))}
                    </Box>
                </DialogContent>
            </Dialog>

            <Snackbar
                open={!!error}
                autoHideDuration={4000}
                onClose={() => setError('')}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert severity="warning" variant="filled" onClose={() => setError('')}>
                    {error}
                </Alert>
            </Snackbar>
        </>
    );
}
