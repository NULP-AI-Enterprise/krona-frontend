import { createSlice } from '@reduxjs/toolkit';

const SEARCH_TYPE_LABELS = {
    'form_match': 'Словоформа',
    'lemma_match': 'Лема',
    'phrase_match': 'Словосполучення',
    'cql_match': 'CQL'
};

const initialState = {
    query: '',
    searchType: 'form_match',
    leftContextSize: null,
    rightContextSize: null,

    corpora: [],
    isCorporaLoading: false,

    results: [],
    stats: {
        lemma: '...',
        searchTypeLabel: '...',
        absolute_count: 0,
        total_tokens: 0,
        relative_freq: 0,
        percent_str: '0%'
    },

    pagination: {
        page: 1,
        pageSize: 15,
        totalPages: 0,
        totalItems: 0
    },

    selected: JSON.parse(localStorage.getItem('concordance_selected_collection')) || {
        id: null,
        type: null,
        name: null
    },

    loading: false,
    error: null,

    exporting: false,
    exportError: null,

    wlFieldToCount: 'tokens.form',
    wlPos: '',
    wlPatternText: '',
    wlPatternMode: 'starts_with',

    wlResults: [],
    wlSearchLoading: false,
    wlHasSearched: false,
    wlPage: 0,
};

const concordanceSlice = createSlice({
    name: 'concordance',
    initialState,
    reducers: {
        setQuery: (state, action) => { state.query = action.payload; },
        setSearchType: (state, action) => { state.searchType = action.payload; },
        setLeftContextSize: (state, action) => { state.leftContextSize = action.payload; },
        setRightContextSize: (state, action) => { state.rightContextSize = action.payload; },
        setSelected: (state, action) => { state.selected = action.payload; },

        fetchCorporaStart: (state) => {
            state.isCorporaLoading = true;
            state.error = null;
        },
        fetchCorporaSuccess: (state, action) => {
            state.isCorporaLoading = false;
            state.corpora = action.payload;
        },
        fetchCorporaFailure: (state, action) => {
            state.isCorporaLoading = false;
            state.error = action.payload;
        },

        searchStart: (state) => {
            state.loading = true;
            state.error = null;
            const typeLabel = SEARCH_TYPE_LABELS[state.searchType] || 'Словоформа';

            state.stats = {
                ...state.stats,
                query: state.query,
                search_type: typeLabel,
                absolute_count: '',
                percent_str: '',
                relative_freq: ''
            };
        },
        searchSuccess: (state, action) => {
            state.loading = false;
            state.results = action.payload.results;

            if (action.payload.stats) {
                state.stats = action.payload.stats;
            }
            if (action.payload.pagination) {
                state.pagination.page = action.payload.pagination.current_page;
                state.pagination.pageSize = action.payload.pagination.page_size;
                state.pagination.totalItems = action.payload.pagination.total_items;
                state.pagination.totalPages = action.payload.pagination.total_pages;
            }
        },
        searchFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        exportStart: (state) => {
            state.exporting = true;
            state.exportError = null;
        },
        exportSuccess: (state) => {
            state.exporting = false;
        },
        exportFailure: (state, action) => {
            state.exporting = false;
            state.exportError = action.payload;
        },

        setWlFieldToCount: (state, action) => { state.wlFieldToCount = action.payload; },
        setWlPos: (state, action) => { state.wlPos = action.payload; },
        setWlPatternText: (state, action) => { state.wlPatternText = action.payload; },
        setWlPatternMode: (state, action) => { state.wlPatternMode = action.payload; },

        setWlResults: (state, action) => { state.wlResults = action.payload; },
        setWlSearchLoading: (state, action) => { state.wlSearchLoading = action.payload; },
        setWlHasSearched: (state, action) => { state.wlHasSearched = action.payload; },
        setWlPage: (state, action) => { state.wlPage = action.payload; }
    }
});

export const {
    setQuery, setSearchType, setLeftContextSize, setRightContextSize,
    setSelected, fetchCorporaStart, fetchCorporaSuccess, fetchCorporaFailure,
    searchStart, searchSuccess, searchFailure,
    exportStart, exportSuccess, exportFailure,
    setWlFieldToCount, setWlPos, setWlPatternText, setWlPatternMode,
    setWlResults, setWlSearchLoading, setWlHasSearched, setWlPage
} = concordanceSlice.actions;

export default concordanceSlice.reducer;