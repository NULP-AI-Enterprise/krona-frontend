import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isCreatingShare: false,
    createShareError: null,
    lastCreatedShare: null,

    shares: [],
    isSharesLoading: false,
    sharesError: null,

    isRevoking: false,
    revokeError: null,

    sharedWithMe: [],
    isSharedWithMeLoading: false,
    sharedWithMeError: null,

    // Corpus sharing
    isCreatingCorpusShare: false,
    createCorpusShareError: null,
    lastCreatedCorpusShare: null,

    corpusShares: [],
    isCorpusSharesLoading: false,
    corpusSharesError: null,

    isRevokingCorpusShare: false,
    revokeCorpusShareError: null,

    sharedCorporaWithMe: [],
    isSharedCorporaLoading: false,
    sharedCorporaError: null,
};

const sharingSlice = createSlice({
    name: 'sharing',
    initialState,
    reducers: {
        createShareStart: (state) => {
            state.isCreatingShare = true;
            state.createShareError = null;
        },
        createShareSuccess: (state, action) => {
            state.isCreatingShare = false;
            state.lastCreatedShare = action.payload;
            state.shares = [action.payload, ...state.shares];
        },
        createShareFailure: (state, action) => {
            state.isCreatingShare = false;
            state.createShareError = action.payload;
        },
        clearLastCreatedShare: (state) => {
            state.lastCreatedShare = null;
        },

        fetchSharesStart: (state) => {
            state.isSharesLoading = true;
            state.sharesError = null;
        },
        fetchSharesSuccess: (state, action) => {
            state.isSharesLoading = false;
            state.shares = action.payload;
        },
        fetchSharesFailure: (state, action) => {
            state.isSharesLoading = false;
            state.sharesError = action.payload;
        },

        revokeShareStart: (state) => {
            state.isRevoking = true;
            state.revokeError = null;
        },
        revokeShareSuccess: (state, action) => {
            state.isRevoking = false;
            state.shares = state.shares.filter(s => s.id !== action.payload);
        },
        revokeShareFailure: (state, action) => {
            state.isRevoking = false;
            state.revokeError = action.payload;
        },

        fetchSharedWithMeStart: (state) => {
            state.isSharedWithMeLoading = true;
            state.sharedWithMeError = null;
        },
        fetchSharedWithMeSuccess: (state, action) => {
            state.isSharedWithMeLoading = false;
            state.sharedWithMe = action.payload;
        },
        fetchSharedWithMeFailure: (state, action) => {
            state.isSharedWithMeLoading = false;
            state.sharedWithMeError = action.payload;
        },

        // Corpus sharing reducers
        createCorpusShareStart: (state) => {
            state.isCreatingCorpusShare = true;
            state.createCorpusShareError = null;
        },
        createCorpusShareSuccess: (state, action) => {
            state.isCreatingCorpusShare = false;
            state.lastCreatedCorpusShare = action.payload;
            state.corpusShares = [action.payload, ...state.corpusShares];
        },
        createCorpusShareFailure: (state, action) => {
            state.isCreatingCorpusShare = false;
            state.createCorpusShareError = action.payload;
        },
        clearLastCreatedCorpusShare: (state) => {
            state.lastCreatedCorpusShare = null;
        },

        fetchCorpusSharesStart: (state) => {
            state.isCorpusSharesLoading = true;
            state.corpusSharesError = null;
        },
        fetchCorpusSharesSuccess: (state, action) => {
            state.isCorpusSharesLoading = false;
            state.corpusShares = action.payload;
        },
        fetchCorpusSharesFailure: (state, action) => {
            state.isCorpusSharesLoading = false;
            state.corpusSharesError = action.payload;
        },

        revokeCorpusShareStart: (state) => {
            state.isRevokingCorpusShare = true;
            state.revokeCorpusShareError = null;
        },
        revokeCorpusShareSuccess: (state, action) => {
            state.isRevokingCorpusShare = false;
            state.corpusShares = state.corpusShares.filter(s => s.id !== action.payload);
        },
        revokeCorpusShareFailure: (state, action) => {
            state.isRevokingCorpusShare = false;
            state.revokeCorpusShareError = action.payload;
        },

        fetchSharedCorporaWithMeStart: (state) => {
            state.isSharedCorporaLoading = true;
            state.sharedCorporaError = null;
        },
        fetchSharedCorporaWithMeSuccess: (state, action) => {
            state.isSharedCorporaLoading = false;
            state.sharedCorporaWithMe = action.payload;
        },
        fetchSharedCorporaWithMeFailure: (state, action) => {
            state.isSharedCorporaLoading = false;
            state.sharedCorporaError = action.payload;
        },
    },
});

export const {
    createShareStart, createShareSuccess, createShareFailure, clearLastCreatedShare,
    fetchSharesStart, fetchSharesSuccess, fetchSharesFailure,
    revokeShareStart, revokeShareSuccess, revokeShareFailure,
    fetchSharedWithMeStart, fetchSharedWithMeSuccess, fetchSharedWithMeFailure,
    createCorpusShareStart, createCorpusShareSuccess, createCorpusShareFailure, clearLastCreatedCorpusShare,
    fetchCorpusSharesStart, fetchCorpusSharesSuccess, fetchCorpusSharesFailure,
    revokeCorpusShareStart, revokeCorpusShareSuccess, revokeCorpusShareFailure,
    fetchSharedCorporaWithMeStart, fetchSharedCorporaWithMeSuccess, fetchSharedCorporaWithMeFailure,
} = sharingSlice.actions;

export default sharingSlice.reducer;
