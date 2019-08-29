import {Platform} from 'react-native';

import Constants from 'expo-constants';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions'

import {GeolocationActions} from '../actions/GeolocationActions';
import {BikesActions} from '../actions/BikesActions';

export const GeolocationMiddleware = store => {

    if (Platform.OS === 'android' && !Constants.isDevice) {
        this.setState({
            errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
        });
    }

    const ask = Permissions.askAsync(Permissions.LOCATION).then(response => {
        const {status} = response;

        if (status === 'granted') {
            return Promise.resolve();
        }

        return Promise.reject();
    });

    let geolocationSubcription;

    return next => action => {

        if (action.type === GeolocationActions.refreshGeolocation.type) {

            ask.then(() => {
                Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Highest,
                }).then(location => {
                    store.dispatch(GeolocationActions.setGeolocation(location.coords));
                });
            });
        }

        if (action.type === BikesActions.rentBike.type) {

            ask.then(() => {

                geolocationSubcription = Location.watchPositionAsync({
                    accuracy: Location.Accuracy.Highest,
                    timeInterval: 10*1000,
                    distanceInterval: 0,
                    mayShowUserSettingsDialog: true,
                }, location => {
                    store.dispatch(BikesActions.updateRentedBikeLocation(location.coords))
                });
            });
        }

        if (action.type === BikesActions.returnBike.type) {
            ask.then(() => geolocationSubcription.remove());
        }

        return next(action);
    };
};
