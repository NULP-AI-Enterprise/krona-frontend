import { takeLatest, put, call } from 'redux-saga/effects';
import api from '../../utils/api';
import {
    fetchUsersStart, fetchUsersSuccess, fetchUsersFailure,
    createUserStart, createUserSuccess, createUserFailure,
    updateUserRoleStart, updateUserRoleSuccess, updateUserRoleFailure,
    deleteUserStart, deleteUserSuccess, deleteUserFailure,
    fetchAdminCorporaStart, fetchAdminCorporaSuccess, fetchAdminCorporaFailure,
    deleteCorpusStart, deleteCorpusSuccess, deleteCorpusFailure,
    deleteTextStart, deleteTextSuccess, deleteTextFailure,
    fetchSubcorporaStart, fetchSubcorporaSuccess, fetchSubcorporaFailure,
    deleteSubcorpusStart, deleteSubcorpusSuccess, deleteSubcorpusFailure,
} from './adminSlice';

// --- API REQUESTS ---
const apiFetchUsers = (search) => api.get('api/auth/admin/users/', { params: search ? { search } : {} });
const apiCreateUser = (payload) => api.post('api/auth/admin/users/create/', payload);
const apiUpdateUserRole = (id, role) => api.patch(`api/auth/admin/users/${id}/`, { role });
const apiDeleteUser = (id) => api.delete(`api/auth/admin/users/${id}/`);
const apiFetchAdminCorpora = () => api.get('api/auth/admin/corpora/');
const apiDeleteCorpus = (id) => api.delete(`api/auth/admin/corpora/${id}/`);
const apiDeleteText = (id) => api.delete(`api/auth/admin/texts/${id}/`);
const apiFetchSubcorpora = (corpusId) => api.get(`api/auth/admin/corpora/${corpusId}/subcorpora/`);
const apiDeleteSubcorpus = (id) => api.delete(`api/auth/admin/subcorpora/${id}/`);

// --- WORKER SAGAS ---
function* workFetchUsers(action) {
    try {
        const response = yield call(apiFetchUsers, action.payload);
        yield put(fetchUsersSuccess(response.data));
    } catch (error) {
        yield put(fetchUsersFailure(error.response?.data?.error || 'Помилка завантаження користувачів'));
    }
}

function* workCreateUser(action) {
    try {
        yield call(apiCreateUser, action.payload);
        yield put(createUserSuccess());
        yield put(fetchUsersStart());
    } catch (error) {
        const errData = error.response?.data;
        const msg = errData?.error || errData?.email?.[0] || errData?.phone_number?.[0] || errData?.password?.[0] || 'Помилка створення користувача';
        yield put(createUserFailure(msg));
    }
}

function* workUpdateUserRole(action) {
    try {
        const { id, role } = action.payload;
        yield call(apiUpdateUserRole, id, role);
        const currentUserId = parseInt(localStorage.getItem('user_id'));
        if (id === currentUserId) {
            localStorage.setItem('user_role', role);
        }
        yield put(updateUserRoleSuccess());
        yield put(fetchUsersStart());
    } catch (error) {
        yield put(updateUserRoleFailure(error.response?.data?.error || 'Помилка оновлення ролі'));
    }
}

function* workDeleteUser(action) {
    try {
        yield call(apiDeleteUser, action.payload);
        yield put(deleteUserSuccess());
        yield put(fetchUsersStart());
    } catch (error) {
        yield put(deleteUserFailure(error.response?.data?.error || 'Помилка видалення користувача'));
    }
}

function* workFetchAdminCorpora() {
    try {
        const response = yield call(apiFetchAdminCorpora);
        yield put(fetchAdminCorporaSuccess(response.data));
    } catch (error) {
        yield put(fetchAdminCorporaFailure(error.response?.data?.error || 'Помилка завантаження корпусів'));
    }
}

function* workDeleteCorpus(action) {
    try {
        yield call(apiDeleteCorpus, action.payload);
        yield put(deleteCorpusSuccess());
        yield put(fetchAdminCorporaStart());
    } catch (error) {
        yield put(deleteCorpusFailure(error.response?.data?.error || 'Помилка видалення корпусу'));
    }
}

function* workDeleteText(action) {
    try {
        yield call(apiDeleteText, action.payload);
        yield put(deleteTextSuccess());
        yield put(fetchAdminCorporaStart());
    } catch (error) {
        yield put(deleteTextFailure(error.response?.data?.error || 'Помилка видалення тексту'));
    }
}

function* workFetchSubcorpora(action) {
    try {
        const response = yield call(apiFetchSubcorpora, action.payload);
        yield put(fetchSubcorporaSuccess(response.data));
    } catch (error) {
        yield put(fetchSubcorporaFailure(error.response?.data?.error || 'Помилка завантаження підкорпусів'));
    }
}

function* workDeleteSubcorpus(action) {
    try {
        const { subcorpusId, corpusId } = action.payload;
        yield call(apiDeleteSubcorpus, subcorpusId);
        yield put(deleteSubcorpusSuccess());
        yield put(fetchSubcorporaStart(corpusId));
    } catch (error) {
        yield put(deleteSubcorpusFailure(error.response?.data?.error || 'Помилка видалення підкорпусу'));
    }
}

// --- WATCHER SAGA ---
export default function* adminSaga() {
    yield takeLatest(fetchUsersStart.type, workFetchUsers);
    yield takeLatest(createUserStart.type, workCreateUser);
    yield takeLatest(updateUserRoleStart.type, workUpdateUserRole);
    yield takeLatest(deleteUserStart.type, workDeleteUser);
    yield takeLatest(fetchAdminCorporaStart.type, workFetchAdminCorpora);
    yield takeLatest(deleteCorpusStart.type, workDeleteCorpus);
    yield takeLatest(deleteTextStart.type, workDeleteText);
    yield takeLatest(fetchSubcorporaStart.type, workFetchSubcorpora);
    yield takeLatest(deleteSubcorpusStart.type, workDeleteSubcorpus);
}
