import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    // --- CORPORA TREE DATA ---
    corpora: [],
    isCorporaLoading: false,
    corporaError: null,

    // --- FILTER PANEL DATA (DRAWER) ---
    metadataOptions: {
        styles_with_genres: [],
        authors: [],
        authors_genders: [],
        sources: [],
        text_origins: [],
    },
    isMetadataLoading: false,

    // --- TEXT MODAL METADATA ---
    textMetadataOptions: {
        corpuses: [],
        styles_with_genres: [],
        authors_genders: [],
        text_origins: [],
    },
    isTextMetadataLoading: false,

    // Currently selected user filters
    activeFilters: {
        targetCorpusId: '',
        style: '',
        genre: '',
        years_of_publication: [],
        year_of_creation: [],
        author: '',
        authors_gender: '',
        source: '',
        text_origin: '',
        title: ''
    },

    // --- CORPUS CREATION STATE ---
    isCreatingCorpus: false,
    createCorpusError: null,

    // --- SUBCORPUS CREATION STATE ---
    isCreatingSubcorpus: false,
    createSubcorpusError: null,

    // --- TEXT CREATION STATE ---
    isCreatingText: false,
    createTextError: null,
    isTextCreated: false,

    // --- USER SUBCORPUS CREATION STATE ---
    isCreatingUserSubcorpus: false,
    createUserSubcorpusError: null,

    // --- DELETE STATE ---
    isDeletingNode: false,
    deleteNodeError: null,

    // --- TEXTS LIST STATE ---
    textsList: [],
    isTextsLoading: false,
    textsError: null,
};

const corpusSlice = createSlice({
    name: 'corpusManager',
    initialState,
    reducers: {
        // 1. Fetch corpora
        fetchCorporaListStart: (state) => {
            state.isCorporaLoading = true;
            state.corporaError = null;
        },
        fetchCorporaListSuccess: (state, action) => {
            state.isCorporaLoading = false;
            state.corpora = action.payload;
        },
        fetchCorporaListFailure: (state, action) => {
            state.isCorporaLoading = false;
            state.corporaError = action.payload;
        },

        // 2. Fetch metadata for Drawer
        fetchMetadataOptionsStart: (state, action) => {
            state.isMetadataLoading = true;
        },
        fetchMetadataOptionsSuccess: (state, action) => {
            state.isMetadataLoading = false;
            state.metadataOptions = action.payload;
        },
        fetchMetadataOptionsFailure: (state, action) => {
            state.isMetadataLoading = false;
            console.error("Error loading metadata:", action.payload);
        },

        // 3. Filter handling
        setFilterValue: (state, action) => {
            const { field, value } = action.payload;
            state.activeFilters[field] = value;
        },
        clearFilters: (state) => {
            const currentCorpusId = state.activeFilters.targetCorpusId;
            state.activeFilters = { ...initialState.activeFilters, targetCorpusId: currentCorpusId };
        },

        // 4. Create subcorpus
        createFilteredSubcorpusStart: (state, action) => {
            state.isCreatingSubcorpus = true;
            state.createSubcorpusError = null;
        },
        createFilteredSubcorpusSuccess: (state) => {
            state.isCreatingSubcorpus = false;
            const currentCorpusId = state.activeFilters.targetCorpusId;
            state.activeFilters = { ...initialState.activeFilters, targetCorpusId: currentCorpusId };
        },
        createFilteredSubcorpusFailure: (state, action) => {
            state.isCreatingSubcorpus = false;
            state.createSubcorpusError = action.payload;
        },

        // 5. Create corpus
        createCorpusStart: (state, action) => {
            state.isCreatingCorpus = true;
            state.createCorpusError = null;
        },
        createCorpusSuccess: (state) => {
            state.isCreatingCorpus = false;
        },
        createCorpusFailure: (state, action) => {
            state.isCreatingCorpus = false;
            state.createCorpusError = action.payload;
        },

        // 6. Create text
        createTextStart: (state, action) => {
            state.isCreatingText = true;
            state.createTextError = null;
            state.isTextCreated = false;
        },
        createTextSuccess: (state) => {
            state.isCreatingText = false;
            state.isTextCreated = true;
        },
        createTextFailure: (state, action) => {
            state.isCreatingText = false;
            state.createTextError = action.payload;
            state.isTextCreated = false;
        },
        resetTextCreated: (state) => {
            state.isTextCreated = false;
        },

        // 7. Fetch metadata specifically for the "Add Text" modal
        fetchTextMetadataOptionsStart: (state) => {
            state.isTextMetadataLoading = true;
        },
        fetchTextMetadataOptionsSuccess: (state, action) => {
            state.isTextMetadataLoading = false;
            state.textMetadataOptions = action.payload;
        },
        fetchTextMetadataOptionsFailure: (state, action) => {
            state.isTextMetadataLoading = false;
            console.error("Error loading text metadata:", action.payload);
        },

        // 8. Create User Subcorpus
        createUserSubcorpusStart: (state, action) => {
            state.isCreatingUserSubcorpus = true;
            state.createUserSubcorpusError = null;
        },
        createUserSubcorpusSuccess: (state) => {
            state.isCreatingUserSubcorpus = false;
        },
        createUserSubcorpusFailure: (state, action) => {
            state.isCreatingUserSubcorpus = false;
            state.createUserSubcorpusError = action.payload;
        },

        // 9. Delete Node (Corpus/Subcorpus)
        deleteNodeStart: (state, action) => {
            state.isDeletingNode = true;
            state.deleteNodeError = null;
        },
        deleteNodeSuccess: (state) => {
            state.isDeletingNode = false;
        },
        deleteNodeFailure: (state, action) => {
            state.isDeletingNode = false;
            state.deleteNodeError = action.payload;
        },

        // 10. Fetch Texts
        fetchTextsStart: (state, action) => {
            state.isTextsLoading = true;
            state.textsError = null;
        },
        fetchTextsSuccess: (state, action) => {
            state.isTextsLoading = false;
            state.textsList = action.payload;
        },
        fetchTextsFailure: (state, action) => {
            state.isTextsLoading = false;
            state.textsError = action.payload;
        },
        clearTextsList: (state) => {
            state.textsList = [];
        },

    }
});

export const {
    fetchCorporaListStart, fetchCorporaListSuccess, fetchCorporaListFailure,
    fetchMetadataOptionsStart, fetchMetadataOptionsSuccess, fetchMetadataOptionsFailure,
    setFilterValue, clearFilters,
    createFilteredSubcorpusStart, createFilteredSubcorpusSuccess, createFilteredSubcorpusFailure,
    createCorpusStart, createCorpusSuccess, createCorpusFailure, createTextStart, createTextSuccess, createTextFailure,
    fetchTextMetadataOptionsStart, fetchTextMetadataOptionsSuccess, fetchTextMetadataOptionsFailure,
    createUserSubcorpusStart, createUserSubcorpusSuccess, createUserSubcorpusFailure,
    deleteNodeStart, deleteNodeSuccess, deleteNodeFailure,
    fetchTextsStart, fetchTextsSuccess, fetchTextsFailure, clearTextsList, resetTextCreated
} = corpusSlice.actions;

export default corpusSlice.reducer;