import { AppState } from 'react-native';
import { BikesActions } from '../actions/BikesActions';

export const BikesMiddleware = store => {

    let currentInterval;
    const startInterval = () => setInterval(() => store.dispatch(BikesActions.getBikes()), 30*1000);

    currentInterval = startInterval();

    AppState.addEventListener('change', newAppState => {
        if (newAppState === 'active') {

            store.dispatch(BikesActions.getBikes());
            currentInterval = startInterval();
            return;
        }

        if(currentInterval) {
            clearInterval(currentInterval);
            currentInterval = undefined;
        }
    });

    return next => action => next(action);
};
