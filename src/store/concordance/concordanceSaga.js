import { takeLatest, put, call } from 'redux-saga/effects';
import axios from 'axios';
import { API_URL } from '../../config';
import {
    searchStart, searchSuccess, searchFailure,
    fetchCorporaStart, fetchCorporaSuccess, fetchCorporaFailure,
    exportStart, exportSuccess, exportFailure
} from './concordanceSlice';

const fetchConcordanceApi = (data) => {
    return axios.post(`${API_URL}/concordance/`, {
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
    return axios.get(`${API_URL}/corpus/list/?include_subcorpora=true`);
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

function* workExportConcordance(action) {
    try {
        const response = yield call(axios.post, `${API_URL}/concordance/`, {
            query: action.payload.query,
            searching_type: action.payload.searchType,
            left_context_size: action.payload.leftContextSize,
            right_context_size: action.payload.rightContextSize,
            collection_id: action.payload.collectionId,
            collection_type: action.payload.collectionType,
            export: true
        });

        const allResults = response.data.results;
        if (!allResults || allResults.length === 0) {
            yield put(exportFailure("Немає результатів для завантаження"));
            return;
        }

        const headers = ['Текст', 'Лівий контекст', 'KWIC', 'Правий контекст'];
        const csvRows = allResults.map(res => [
            `"${(res.document_name || 'N/A').replace(/"/g, '""')}"`,
            `"${res.left_context.replace(/"/g, '""')}"`,
            `"${res.searched_sentence.replace(/"/g, '""')}"`,
            `"${res.right_context.replace(/"/g, '""')}"`
        ].join(','));

        const csvContent = "\uFEFF" + [headers.join(","), ...csvRows].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `concordance_results_${action.payload.query}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        yield put(exportSuccess());
    } catch (error) {
        const errorMsg = error.response?.data?.error || error.message || "Помилка при завантаженні результатів";
        yield put(exportFailure(errorMsg));
    }
}

export default function* concordanceSaga() {
    yield takeLatest(searchStart.type, workSearchConcordance);
    yield takeLatest(fetchCorporaStart.type, workFetchCorpora);
    yield takeLatest(exportStart.type, workExportConcordance);
}