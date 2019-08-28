/* eslint-disable */

import { applyMiddleware, createStore, compose } from 'redux';
import storage from 'redux-persist/es/storage';
import ReduxThunk from 'redux-thunk';
import { persistStore, persistCombineReducers } from 'redux-persist';
import reducers from '../reducers';

import { GeolocationMiddleware } from '../middleware/geolocation';

const config = {
    key: 'primary',
    storage,
    whitelist: 'account',
};

const reducer = persistCombineReducers(config, reducers);

const rootReducer = (state = {}, action) => {
    // if (action.type === AppStateActions.wipe.type) {
    //     return {};
    // }

    return reducer(state, action);
};

function configureStore() {
    const composeEnhancers =
        /* eslint-disable-next-line */
        window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
    const store = createStore(
        rootReducer,
        composeEnhancers(
            applyMiddleware(
                ReduxThunk,
                GeolocationMiddleware,
            )
        )
    );

    const persistor = persistStore(store);

    return { persistor, store };
}

export { configureStore }
export default configureStore
