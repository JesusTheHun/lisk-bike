import GeolocationReducer from './GeolocationReducer';
import BikeReducer from './BikeReducer';
import AccountReducer from './AccountReducer';

const allReducers = {
    account: AccountReducer,
    geolocation: GeolocationReducer,
    bikes: BikeReducer,
};

export default allReducers;
