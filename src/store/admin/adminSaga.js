import { takeLatest, put, call } from 'redux-saga/effects';
import axios from 'axios';
import {
    fetchUsersStart, fetchUsersSuccess, fetchUsersFailure,
    createUserStart, createUserSuccess, createUserFailure,
    updateUserRoleStart, updateUserRoleSuccess, updateUserRoleFailure,
    deleteUserStart, deleteUserSuccess, deleteUserFailure,
    fetchAdminCorporaStart, fetchAdminCorporaSuccess, fetchAdminCorporaFailure,
    deleteCorpusStart, deleteCorpusSuccess, deleteCorpusFailure,
    deleteTextStart, deleteTextSuccess, deleteTextFailure,
} from './adminSlice';


const api = axios.create({
    baseURL: 'http://localhost:8000/'
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refresh_token');
                const response = await axios.post('http://localhost:8000/api/auth/token/refresh/', {
                    refresh: refreshToken
                });
                localStorage.setItem('access_token', response.data.access);
                originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
                return api(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

// --- API REQUESTS ---
const apiFetchUsers = (search) => api.get('api/auth/admin/users/', { params: search ? { search } : {} });
const apiCreateUser = (payload) => api.post('api/auth/admin/users/create/', payload);
const apiUpdateUserRole = (id, role) => api.patch(`api/auth/admin/users/${id}/`, { role });
const apiDeleteUser = (id) => api.delete(`api/auth/admin/users/${id}/`);
const apiFetchAdminCorpora = () => api.get('api/auth/admin/corpora/');
const apiDeleteCorpus = (id) => api.delete(`api/auth/admin/corpora/${id}/`);
const apiDeleteText = (id) => api.delete(`api/auth/admin/texts/${id}/`);

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

// --- WATCHER SAGA ---
export default function* adminSaga() {
    yield takeLatest(fetchUsersStart.type, workFetchUsers);
    yield takeLatest(createUserStart.type, workCreateUser);
    yield takeLatest(updateUserRoleStart.type, workUpdateUserRole);
    yield takeLatest(deleteUserStart.type, workDeleteUser);
    yield takeLatest(fetchAdminCorporaStart.type, workFetchAdminCorpora);
    yield takeLatest(deleteCorpusStart.type, workDeleteCorpus);
    yield takeLatest(deleteTextStart.type, workDeleteText);
}
