import { combineReducers } from '@reduxjs/toolkit';
import concordanceReducer from './concordance/concordanceSlice';
import corpusReducer from './corpusmanager/corpusSlice';
import adminReducer from './admin/adminSlice';

const rootReducer = combineReducers({
    concordance: concordanceReducer,
    corpusManager: corpusReducer,
    admin: adminReducer,
});

export default rootReducer;
