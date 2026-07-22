import { takeLatest, put, call } from 'redux-saga/effects';
import axios from 'axios';
import {
    fetchCorporaListStart, fetchCorporaListSuccess, fetchCorporaListFailure,
    fetchMetadataOptionsStart, fetchMetadataOptionsSuccess, fetchMetadataOptionsFailure,
    createFilteredSubcorpusStart, createFilteredSubcorpusSuccess, createFilteredSubcorpusFailure,
    createCorpusStart, createCorpusSuccess, createCorpusFailure, createTextStart, createTextSuccess, createTextFailure,
    fetchTextMetadataOptionsStart, fetchTextMetadataOptionsSuccess, fetchTextMetadataOptionsFailure,
    createUserSubcorpusStart, createUserSubcorpusSuccess, createUserSubcorpusFailure,
    deleteNodeStart, deleteNodeSuccess, deleteNodeFailure,
    fetchTextsStart, fetchTextsSuccess, fetchTextsFailure,
} from './corpusSlice';


// Instance AXIOS
const api = axios.create({
    baseURL: 'http://localhost:8000/'
});


// Token interceptor
api.interceptors.request.use((config) => {
    // 'access_token'
    const token = localStorage.getItem('access_token');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));


// Interceptor for responses
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response.status === 401 && !originalRequest._retry) {
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
                console.error("Refresh token expired. Need to login again.");
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

// --- API REQUESTS ---
const apiCreateText = (formData) => api.post('text/', formData);
const apiCreateCorpus = (payload) => api.post('corpus/', payload);
const apiFetchCorpora = () => api.get('corpus/list/?include_subcorpora=true&include_timestamps=true');
const apiFetchMetadataOptions = (corpusId) => api.get(`metadata-options/filtered-subcorpus/${corpusId}/`);
const apiFetchTextMetadataOptions = () => api.get('metadata-options/text/');
const apiCreateUserSubcorpus = (payload) => api.post('user-subcorpus/', payload);
const apiDeleteCorpus = (id) => api.delete(`corpus/${id}/`);
const apiDeleteFilteredSubcorpus = (id) => api.delete(`filtered-subcorpus/${id}/`);
const apiDeleteUserSubcorpus = (id) => api.delete(`user-subcorpus/${id}/`);

const apiCreateFilteredSubcorpus = (payload) => {
    return api.post('filtered-subcorpus/', {
        name: payload.name,
        corpus_id: payload.targetCorpusId,
        filters: payload.filters
    });
};

const apiFetchTexts = (params) => api.get('text/list/', { params });

// --- WORKER SAGAS ---
function* workFetchCorporaList() {
    try {
        const response = yield call(apiFetchCorpora);
        yield put(fetchCorporaListSuccess(response.data));
    } catch (error) {
        yield put(fetchCorporaListFailure(error.response?.data?.message || "Не вдалося завантажити корпуси"));
    }
}

function* workFetchTextMetadataOptions() {
    try {
        const response = yield call(apiFetchTextMetadataOptions);
        yield put(fetchTextMetadataOptionsSuccess(response.data));
    } catch (error) {
        yield put(fetchTextMetadataOptionsFailure(error.message));
    }
}

function* workCreateCorpus(action) {
    try {
        yield call(apiCreateCorpus, action.payload);
        yield put(createCorpusSuccess());
        yield put(fetchCorporaListStart());
        yield put(fetchTextMetadataOptionsStart());
    } catch (error) {
        yield put(createCorpusFailure(error.response?.data?.message || "Не вдалося створити корпус"));
    }
}

function* workCreateText(action) {
    try {
        yield call(apiCreateText, action.payload);
        yield put(createTextSuccess());
        yield put(fetchCorporaListStart());
    } catch (error) {
        yield put(createTextFailure(error.response?.data?.message || "Не вдалося завантажити текст"));
    }
}

function* workFetchMetadataOptions(action) {
    try {
        const response = yield call(apiFetchMetadataOptions, action.payload);
        yield put(fetchMetadataOptionsSuccess(response.data));
    } catch (error) {
        yield put(fetchMetadataOptionsFailure(error.message));
    }
}

function* workCreateFilteredSubcorpus(action) {
    try {
        yield call(apiCreateFilteredSubcorpus, action.payload);
        yield put(createFilteredSubcorpusSuccess());
        yield put(fetchCorporaListStart());
    } catch (error) {
        yield put(createFilteredSubcorpusFailure(error.response?.data?.message || "Не вдалося створити підкорпус"));
    }
}

function* workCreateUserSubcorpus(action) {
    try {
        yield call(apiCreateUserSubcorpus, action.payload);
        yield put(createUserSubcorpusSuccess());
        yield put(fetchCorporaListStart());
    } catch (error) {
        yield put(createUserSubcorpusFailure(error.response?.data?.message || "Не вдалося створити користувацький підкорпус"));
    }
}

function* workDeleteNode(action) {
    const { id, type, subType } = action.payload;
    try {
        if (type === 'corpus') {
            yield call(apiDeleteCorpus, id);
        } else if (type === 'subcorpus') {
            if (subType === 'user') {
                yield call(apiDeleteUserSubcorpus, id);
            } else {
                yield call(apiDeleteFilteredSubcorpus, id);
            }
        }
        yield put(deleteNodeSuccess());
        yield put(fetchCorporaListStart());
    } catch (error) {
        yield put(deleteNodeFailure(error.response?.data?.message || "Не вдалося видалити елемент"));
    }
}

function* workFetchTexts(action) {
    try {
        const response = yield call(apiFetchTexts, action.payload);
        yield put(fetchTextsSuccess(response.data.texts));
    } catch (error) {
        yield put(fetchTextsFailure(error.response?.data?.error || "Не вдалося завантажити тексти"));
    }
}
// --- WATCHER SAGA ---
export default function* corpusSaga() {
    yield takeLatest(fetchCorporaListStart.type, workFetchCorporaList);
    yield takeLatest(fetchMetadataOptionsStart.type, workFetchMetadataOptions);
    yield takeLatest(createFilteredSubcorpusStart.type, workCreateFilteredSubcorpus);
    yield takeLatest(createCorpusStart.type, workCreateCorpus);
    yield takeLatest(createTextStart.type, workCreateText);
    yield takeLatest(fetchTextMetadataOptionsStart.type, workFetchTextMetadataOptions);
    yield takeLatest(createUserSubcorpusStart.type, workCreateUserSubcorpus);
    yield takeLatest(deleteNodeStart.type, workDeleteNode);
    yield takeLatest(fetchTextsStart.type, workFetchTexts);
}