import { all } from 'redux-saga/effects';
import concordanceSaga from './concordance/concordanceSaga';
import corpusSaga from './corpusmanager/corpusSaga';
import adminSaga from './admin/adminSaga';

export default function* rootSaga() {
    yield all([
        concordanceSaga(),
        corpusSaga(),
        adminSaga(),
    ]);
}
