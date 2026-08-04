import { combineReducers } from '@reduxjs/toolkit';
import concordanceReducer from './concordance/concordanceSlice';
import corpusReducer from './corpusmanager/corpusSlice';
import adminReducer from './admin/adminSlice';
import sharingReducer from './sharing/sharingSlice';

const rootReducer = combineReducers({
    concordance: concordanceReducer,
    corpusManager: corpusReducer,
    admin: adminReducer,
    sharing: sharingReducer,
});

export default rootReducer;
