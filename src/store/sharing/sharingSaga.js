import { takeLatest, put, call } from 'redux-saga/effects';
import api from '../../utils/api';
import {
    createShareStart, createShareSuccess, createShareFailure,
    fetchSharesStart, fetchSharesSuccess, fetchSharesFailure,
    revokeShareStart, revokeShareSuccess, revokeShareFailure,
    fetchSharedWithMeStart, fetchSharedWithMeSuccess, fetchSharedWithMeFailure,
    createCorpusShareStart, createCorpusShareSuccess, createCorpusShareFailure,
    fetchCorpusSharesStart, fetchCorpusSharesSuccess, fetchCorpusSharesFailure,
    revokeCorpusShareStart, revokeCorpusShareSuccess, revokeCorpusShareFailure,
    fetchSharedCorporaWithMeStart, fetchSharedCorporaWithMeSuccess, fetchSharedCorporaWithMeFailure,
} from './sharingSlice';

const apiCreateShare = (subcorpusId, payload) =>
    api.post(`subcorpora/${subcorpusId}/share/`, payload);

const apiFetchShares = (subcorpusId) =>
    api.get(`subcorpora/${subcorpusId}/shares/`);

const apiRevokeShare = (shareId) =>
    api.delete(`shares/${shareId}/`);

const apiFetchSharedWithMe = () =>
    api.get('subcorpora/shared-with-me/');

function* workCreateShare(action) {
    try {
        const { subcorpusId, ...payload } = action.payload;
        const response = yield call(apiCreateShare, subcorpusId, payload);
        yield put(createShareSuccess(response.data));
    } catch (error) {
        const msg = error.response?.data?.error || 'Помилка створення посилання.';
        yield put(createShareFailure(msg));
    }
}

function* workFetchShares(action) {
    try {
        const subcorpusId = action.payload;
        const response = yield call(apiFetchShares, subcorpusId);
        yield put(fetchSharesSuccess(response.data));
    } catch (error) {
        const msg = error.response?.data?.error || 'Помилка завантаження.';
        yield put(fetchSharesFailure(msg));
    }
}

function* workRevokeShare(action) {
    try {
        const shareId = action.payload;
        yield call(apiRevokeShare, shareId);
        yield put(revokeShareSuccess(shareId));
    } catch (error) {
        const msg = error.response?.data?.error || 'Помилка відкликання.';
        yield put(revokeShareFailure(msg));
    }
}

function* workFetchSharedWithMe() {
    try {
        const response = yield call(apiFetchSharedWithMe);
        yield put(fetchSharedWithMeSuccess(response.data));
    } catch (error) {
        const msg = error.response?.data?.error || 'Помилка завантаження.';
        yield put(fetchSharedWithMeFailure(msg));
    }
}

// Corpus sharing API calls
const apiCreateCorpusShare = (corpusId, payload) =>
    api.post(`corpus/${corpusId}/share/`, payload);

const apiFetchCorpusShares = (corpusId) =>
    api.get(`corpus/${corpusId}/shares/`);

const apiRevokeCorpusShare = (shareId) =>
    api.delete(`corpus-shares/${shareId}/`);

const apiFetchSharedCorporaWithMe = () =>
    api.get('corpus/shared-with-me/');

function* workCreateCorpusShare(action) {
    try {
        const { corpusId, ...payload } = action.payload;
        const response = yield call(apiCreateCorpusShare, corpusId, payload);
        yield put(createCorpusShareSuccess(response.data));
    } catch (error) {
        const msg = error.response?.data?.error || 'Помилка створення посилання.';
        yield put(createCorpusShareFailure(msg));
    }
}

function* workFetchCorpusShares(action) {
    try {
        const corpusId = action.payload;
        const response = yield call(apiFetchCorpusShares, corpusId);
        yield put(fetchCorpusSharesSuccess(response.data));
    } catch (error) {
        const msg = error.response?.data?.error || 'Помилка завантаження.';
        yield put(fetchCorpusSharesFailure(msg));
    }
}

function* workRevokeCorpusShare(action) {
    try {
        const shareId = action.payload;
        yield call(apiRevokeCorpusShare, shareId);
        yield put(revokeCorpusShareSuccess(shareId));
    } catch (error) {
        const msg = error.response?.data?.error || 'Помилка відкликання.';
        yield put(revokeCorpusShareFailure(msg));
    }
}

function* workFetchSharedCorporaWithMe() {
    try {
        const response = yield call(apiFetchSharedCorporaWithMe);
        yield put(fetchSharedCorporaWithMeSuccess(response.data));
    } catch (error) {
        const msg = error.response?.data?.error || 'Помилка завантаження.';
        yield put(fetchSharedCorporaWithMeFailure(msg));
    }
}

export default function* sharingSaga() {
    yield takeLatest(createShareStart.type, workCreateShare);
    yield takeLatest(fetchSharesStart.type, workFetchShares);
    yield takeLatest(revokeShareStart.type, workRevokeShare);
    yield takeLatest(fetchSharedWithMeStart.type, workFetchSharedWithMe);
    yield takeLatest(createCorpusShareStart.type, workCreateCorpusShare);
    yield takeLatest(fetchCorpusSharesStart.type, workFetchCorpusShares);
    yield takeLatest(revokeCorpusShareStart.type, workRevokeCorpusShare);
    yield takeLatest(fetchSharedCorporaWithMeStart.type, workFetchSharedCorporaWithMe);
}
