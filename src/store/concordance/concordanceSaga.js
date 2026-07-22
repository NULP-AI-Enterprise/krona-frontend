import { takeLatest, put, call } from 'redux-saga/effects';
import axios from 'axios';
import {
    searchStart, searchSuccess, searchFailure,
    fetchCorporaStart, fetchCorporaSuccess, fetchCorporaFailure
} from './concordanceSlice';

const fetchConcordanceApi = (data) => {
    return axios.post('http://localhost:8000/concordance/', {
        query: data.query,
        searching_type: data.searchType,
        left_context_size: data.leftContextSize,
        right_context_size: data.rightContextSize,
        collection_id: data.collectionId,
        collection_type: data.collectionType,
        page: data.page || 1,
        page_size: data.pageSize || 15
    });
};

const fetchCorporaApi = () => {
    return axios.get('http://localhost:8000/corpus/list/?include_subcorpora=true');
};

function* workSearchConcordance(action) {
    try {
        const { collectionId, collectionType } = action.payload;

        if (!collectionId || !collectionType) {
            throw new Error("Будь ласка, оберіть колекцію для пошуку (корпус або підкорпус).");
        }

        const response = yield call(fetchConcordanceApi, action.payload);

        if (response.data.error) {
            yield put(searchFailure(response.data.error));
        } else {
            yield put(searchSuccess(response.data));
        }

    } catch (error) {
        const errorMsg = error.response?.data?.error || error.message || "Помилка з'єднання з сервером при пошуку";
        yield put(searchFailure(errorMsg));
    }
}

function* workFetchCorpora() {
    try {
        const response = yield call(fetchCorporaApi);
        yield put(fetchCorporaSuccess(response.data));
    } catch (error) {
        yield put(fetchCorporaFailure("Не вдалося завантажити список корпусів"));
    }
}

export default function* concordanceSaga() {
    yield takeLatest(searchStart.type, workSearchConcordance);
    yield takeLatest(fetchCorporaStart.type, workFetchCorpora);
}