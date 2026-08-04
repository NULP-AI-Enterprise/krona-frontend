import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    users: [],
    isUsersLoading: false,
    usersError: null,

    isCreatingUser: false,
    createUserError: null,

    isUpdatingUser: false,
    updateUserError: null,

    isDeletingUser: false,
    deleteUserError: null,

    corpora: [],
    isCorporaLoading: false,
    corporaError: null,

    isDeletingCorpus: false,
    deleteCorpusError: null,

    isDeletingText: false,
    deleteTextError: null,

    subcorpora: [],
    isSubcorporaLoading: false,
    subcorporaError: null,
    selectedCorpusId: null,

    isDeletingSubcorpus: false,
    deleteSubcorpusError: null,
};

const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        fetchUsersStart: (state) => {
            state.isUsersLoading = true;
            state.usersError = null;
        },
        fetchUsersSuccess: (state, action) => {
            state.users = action.payload;
            state.isUsersLoading = false;
        },
        fetchUsersFailure: (state, action) => {
            state.isUsersLoading = false;
            state.usersError = action.payload;
        },

        createUserStart: (state) => {
            state.isCreatingUser = true;
            state.createUserError = null;
        },
        createUserSuccess: (state) => {
            state.isCreatingUser = false;
        },
        createUserFailure: (state, action) => {
            state.isCreatingUser = false;
            state.createUserError = action.payload;
        },

        updateUserRoleStart: (state) => {
            state.isUpdatingUser = true;
            state.updateUserError = null;
        },
        updateUserRoleSuccess: (state) => {
            state.isUpdatingUser = false;
        },
        updateUserRoleFailure: (state, action) => {
            state.isUpdatingUser = false;
            state.updateUserError = action.payload;
        },

        deleteUserStart: (state) => {
            state.isDeletingUser = true;
            state.deleteUserError = null;
        },
        deleteUserSuccess: (state) => {
            state.isDeletingUser = false;
        },
        deleteUserFailure: (state, action) => {
            state.isDeletingUser = false;
            state.deleteUserError = action.payload;
        },

        fetchAdminCorporaStart: (state) => {
            state.isCorporaLoading = true;
            state.corporaError = null;
        },
        fetchAdminCorporaSuccess: (state, action) => {
            state.corpora = action.payload;
            state.isCorporaLoading = false;
        },
        fetchAdminCorporaFailure: (state, action) => {
            state.isCorporaLoading = false;
            state.corporaError = action.payload;
        },

        deleteCorpusStart: (state) => {
            state.isDeletingCorpus = true;
            state.deleteCorpusError = null;
        },
        deleteCorpusSuccess: (state) => {
            state.isDeletingCorpus = false;
        },
        deleteCorpusFailure: (state, action) => {
            state.isDeletingCorpus = false;
            state.deleteCorpusError = action.payload;
        },

        deleteTextStart: (state) => {
            state.isDeletingText = true;
            state.deleteTextError = null;
        },
        deleteTextSuccess: (state) => {
            state.isDeletingText = false;
        },
        deleteTextFailure: (state, action) => {
            state.isDeletingText = false;
            state.deleteTextError = action.payload;
        },

        selectCorpusForSubcorpora: (state, action) => {
            state.selectedCorpusId = action.payload;
            state.subcorpora = [];
        },

        fetchSubcorporaStart: (state) => {
            state.isSubcorporaLoading = true;
            state.subcorporaError = null;
        },
        fetchSubcorporaSuccess: (state, action) => {
            state.subcorpora = action.payload;
            state.isSubcorporaLoading = false;
        },
        fetchSubcorporaFailure: (state, action) => {
            state.isSubcorporaLoading = false;
            state.subcorporaError = action.payload;
        },

        deleteSubcorpusStart: (state) => {
            state.isDeletingSubcorpus = true;
            state.deleteSubcorpusError = null;
        },
        deleteSubcorpusSuccess: (state) => {
            state.isDeletingSubcorpus = false;
        },
        deleteSubcorpusFailure: (state, action) => {
            state.isDeletingSubcorpus = false;
            state.deleteSubcorpusError = action.payload;
        },

        clearAdminErrors: (state) => {
            state.usersError = null;
            state.createUserError = null;
            state.updateUserError = null;
            state.deleteUserError = null;
            state.corporaError = null;
            state.deleteCorpusError = null;
            state.deleteTextError = null;
            state.subcorporaError = null;
            state.deleteSubcorpusError = null;
        },
    }
});

export const {
    fetchUsersStart, fetchUsersSuccess, fetchUsersFailure,
    createUserStart, createUserSuccess, createUserFailure,
    updateUserRoleStart, updateUserRoleSuccess, updateUserRoleFailure,
    deleteUserStart, deleteUserSuccess, deleteUserFailure,
    fetchAdminCorporaStart, fetchAdminCorporaSuccess, fetchAdminCorporaFailure,
    deleteCorpusStart, deleteCorpusSuccess, deleteCorpusFailure,
    deleteTextStart, deleteTextSuccess, deleteTextFailure,
    selectCorpusForSubcorpora,
    fetchSubcorporaStart, fetchSubcorporaSuccess, fetchSubcorporaFailure,
    deleteSubcorpusStart, deleteSubcorpusSuccess, deleteSubcorpusFailure,
    clearAdminErrors,
} = adminSlice.actions;

export default adminSlice.reducer;
