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
    isCorpusCreated: false,

    // --- SUBCORPUS CREATION STATE ---
    isCreatingSubcorpus: false,
    createSubcorpusError: null,
    isSubcorpusCreated: false,

    // --- TEXT CREATION STATE ---
    isCreatingText: false,
    createTextError: null,
    isTextCreated: false,

    // --- USER SUBCORPUS CREATION STATE ---
    isCreatingUserSubcorpus: false,
    createUserSubcorpusError: null,
    isUserSubcorpusCreated: false,

    // --- DELETE STATE ---
    isDeletingNode: false,
    deleteNodeError: null,
    isNodeDeleted: false,

    // --- TEXTS LIST STATE ---
    textsList: [],
    isTextsLoading: false,
    textsError: null,
    collectionInfo: null,

    // --- DELETE TEXT STATE ---
    isDeletingText: false,
    deleteTextError: null,
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
            state.isSubcorpusCreated = false;
        },
        createFilteredSubcorpusSuccess: (state) => {
            state.isCreatingSubcorpus = false;
            state.isSubcorpusCreated = true;
            const currentCorpusId = state.activeFilters.targetCorpusId;
            state.activeFilters = { ...initialState.activeFilters, targetCorpusId: currentCorpusId };
        },
        createFilteredSubcorpusFailure: (state, action) => {
            state.isCreatingSubcorpus = false;
            state.createSubcorpusError = action.payload;
            state.isSubcorpusCreated = false;
        },
        resetSubcorpusCreated: (state) => {
            state.isSubcorpusCreated = false;
        },

        // 5. Create corpus
        createCorpusStart: (state, action) => {
            state.isCreatingCorpus = true;
            state.createCorpusError = null;
            state.isCorpusCreated = false;
        },
        createCorpusSuccess: (state) => {
            state.isCreatingCorpus = false;
            state.isCorpusCreated = true;
        },
        createCorpusFailure: (state, action) => {
            state.isCreatingCorpus = false;
            state.createCorpusError = action.payload;
            state.isCorpusCreated = false;
        },
        resetCorpusCreated: (state) => {
            state.isCorpusCreated = false;
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
            state.isUserSubcorpusCreated = false;
        },
        createUserSubcorpusSuccess: (state) => {
            state.isCreatingUserSubcorpus = false;
            state.isUserSubcorpusCreated = true;
        },
        createUserSubcorpusFailure: (state, action) => {
            state.isCreatingUserSubcorpus = false;
            state.createUserSubcorpusError = action.payload;
            state.isUserSubcorpusCreated = false;
        },
        resetUserSubcorpusCreated: (state) => {
            state.isUserSubcorpusCreated = false;
        },

        // 9. Delete Node (Corpus/Subcorpus)
        deleteNodeStart: (state, action) => {
            state.isDeletingNode = true;
            state.deleteNodeError = null;
            state.isNodeDeleted = false;
        },
        deleteNodeSuccess: (state) => {
            state.isDeletingNode = false;
            state.isNodeDeleted = true;
        },
        deleteNodeFailure: (state, action) => {
            state.isDeletingNode = false;
            state.deleteNodeError = action.payload;
            state.isNodeDeleted = false;
        },
        resetNodeDeleted: (state) => {
            state.isNodeDeleted = false;
        },

        // 10. Fetch Texts
        fetchTextsStart: (state, action) => {
            state.isTextsLoading = true;
            state.textsError = null;
        },
        fetchTextsSuccess: (state, action) => {
            state.isTextsLoading = false;
            state.textsList = action.payload.texts;
            state.collectionInfo = action.payload.collectionInfo;
        },
        fetchTextsFailure: (state, action) => {
            state.isTextsLoading = false;
            state.textsError = action.payload;
        },
        clearTextsList: (state) => {
            state.textsList = [];
            state.collectionInfo = null;
        },

        // Delete Text
        deleteTextStart: (state) => {
            state.isDeletingText = true;
            state.deleteTextError = null;
        },
        deleteTextSuccess: (state, action) => {
            state.isDeletingText = false;
            state.textsList = state.textsList.filter(text => text.id !== action.payload);
        },
        deleteTextFailure: (state, action) => {
            state.isDeletingText = false;
            state.deleteTextError = action.payload;
        },

    }
});

export const {
    fetchCorporaListStart, fetchCorporaListSuccess, fetchCorporaListFailure,
    fetchMetadataOptionsStart, fetchMetadataOptionsSuccess, fetchMetadataOptionsFailure,
    setFilterValue, clearFilters,
    createFilteredSubcorpusStart, createFilteredSubcorpusSuccess, createFilteredSubcorpusFailure, resetSubcorpusCreated,
    createCorpusStart, createCorpusSuccess, createCorpusFailure, resetCorpusCreated,
    createTextStart, createTextSuccess, createTextFailure, resetTextCreated,
    fetchTextMetadataOptionsStart, fetchTextMetadataOptionsSuccess, fetchTextMetadataOptionsFailure,
    createUserSubcorpusStart, createUserSubcorpusSuccess, createUserSubcorpusFailure, resetUserSubcorpusCreated,
    deleteNodeStart, deleteNodeSuccess, deleteNodeFailure, resetNodeDeleted,
    fetchTextsStart, fetchTextsSuccess, fetchTextsFailure, clearTextsList,
    deleteTextStart, deleteTextSuccess, deleteTextFailure,
} = corpusSlice.actions;

export default corpusSlice.reducer;