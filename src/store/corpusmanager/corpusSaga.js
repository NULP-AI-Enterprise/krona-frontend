import { takeLatest, put, call } from 'redux-saga/effects';
import api from '../../utils/api';
import {
    fetchCorporaListStart, fetchCorporaListSuccess, fetchCorporaListFailure,
    fetchMetadataOptionsStart, fetchMetadataOptionsSuccess, fetchMetadataOptionsFailure,
    createFilteredSubcorpusStart, createFilteredSubcorpusSuccess, createFilteredSubcorpusFailure,
    createCorpusStart, createCorpusSuccess, createCorpusFailure, createTextStart, createTextSuccess, createTextFailure,
    fetchTextMetadataOptionsStart, fetchTextMetadataOptionsSuccess, fetchTextMetadataOptionsFailure,
    createUserSubcorpusStart, createUserSubcorpusSuccess, createUserSubcorpusFailure,
    deleteNodeStart, deleteNodeSuccess, deleteNodeFailure,
    fetchTextsStart, fetchTextsSuccess, fetchTextsFailure,
    deleteTextStart, deleteTextSuccess, deleteTextFailure,
} from './corpusSlice';

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
const apiDeleteText = (id) => api.delete(`text/${id}/`);

const apiCreateFilteredSubcorpus = (payload) => {
    return api.post('filtered-subcorpus/', {
        name: payload.name,
        corpus_id: payload.targetCorpusId,
        filters: payload.filters
    });
};

const apiFetchTexts = (params) => api.get('text/list/', { params });

const extractErrorMessage = (error, fallback) => {
    if (error.response && error.response.data) {
        const data = error.response.data;
        if (typeof data === 'string') return data;
        if (data.error) return data.error;
        if (data.detail) return data.detail;
        if (data.message) return data.message;
        if (typeof data === 'object') {
            const joined = Object.values(data).flat().map(val => (typeof val === 'object' ? JSON.stringify(val) : val)).join(' ');
            if (joined) return joined;
        }
    }
    return error.message || fallback;
};

// --- WORKER SAGAS ---
function* workFetchCorporaList() {
    try {
        const response = yield call(apiFetchCorpora);
        yield put(fetchCorporaListSuccess(response.data));
    } catch (error) {
        yield put(fetchCorporaListFailure(extractErrorMessage(error, "Не вдалося завантажити корпуси")));
    }
}

function* workFetchTextMetadataOptions() {
    try {
        const response = yield call(apiFetchTextMetadataOptions);
        yield put(fetchTextMetadataOptionsSuccess(response.data));
    } catch (error) {
        yield put(fetchTextMetadataOptionsFailure(extractErrorMessage(error, "Помилка завантаження опцій метаданих")));
    }
}

function* workCreateCorpus(action) {
    try {
        yield call(apiCreateCorpus, action.payload);
        yield put(createCorpusSuccess());
        yield put(fetchCorporaListStart());
        yield put(fetchTextMetadataOptionsStart());
    } catch (error) {
        yield put(createCorpusFailure(extractErrorMessage(error, "Не вдалося створити корпус")));
    }
}

function* workCreateText(action) {
    try {
        yield call(apiCreateText, action.payload);
        yield put(createTextSuccess());
        yield put(fetchCorporaListStart());
    } catch (error) {
        yield put(createTextFailure(extractErrorMessage(error, "Не вдалося завантажити текст")));
    }
}

function* workFetchMetadataOptions(action) {
    try {
        const response = yield call(apiFetchMetadataOptions, action.payload);
        yield put(fetchMetadataOptionsSuccess(response.data));
    } catch (error) {
        yield put(fetchMetadataOptionsFailure(extractErrorMessage(error, "Помилка завантаження метаданих")));
    }
}

function* workCreateFilteredSubcorpus(action) {
    try {
        yield call(apiCreateFilteredSubcorpus, action.payload);
        yield put(createFilteredSubcorpusSuccess());
        yield put(fetchCorporaListStart());
    } catch (error) {
        yield put(createFilteredSubcorpusFailure(extractErrorMessage(error, "Не вдалося створити підкорпус")));
    }
}

function* workCreateUserSubcorpus(action) {
    try {
        yield call(apiCreateUserSubcorpus, action.payload);
        yield put(createUserSubcorpusSuccess());
        yield put(fetchCorporaListStart());
    } catch (error) {
        yield put(createUserSubcorpusFailure(extractErrorMessage(error, "Не вдалося створити користувацький підкорпус")));
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
        yield put(deleteNodeFailure(extractErrorMessage(error, "Не вдалося видалити елемент")));
    }
}

function* workFetchTexts(action) {
    try {
        const response = yield call(apiFetchTexts, action.payload);
        yield put(fetchTextsSuccess({
            texts: response.data.texts,
            collectionInfo: response.data.collection_info || null
        }));
    } catch (error) {
        yield put(fetchTextsFailure(extractErrorMessage(error, "Не вдалося завантажити тексти")));
    }
}

function* workDeleteText(action) {
    const id = action.payload;
    try {
        yield call(apiDeleteText, id);
        yield put(deleteTextSuccess(id));
    } catch (error) {
        yield put(deleteTextFailure(error.response?.data?.error || "Не вдалося видалити текст"));
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
    yield takeLatest(deleteTextStart.type, workDeleteText);
}