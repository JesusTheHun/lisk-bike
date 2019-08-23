import { Platform, PermissionsAndroid } from 'react-native';

import { GeolocationActions } from 'actions/GeolocationActions';

export const GeolocationMiddleware = store => {
  const geoArgs = [
    position =>
      store.dispatch(GeolocationActions.setGeolocation(position.coords)),
      positionError => store.dispatch(GeolocationActions.setGeolocation(null)),
    {
      useSignificantChanges: true,
      timeout: 3000,
    },
  ];

  let isAllowed = false;
  if (Platform.OS === 'ios') {
    isAllowed = true;
  }
  if (Platform.OS === 'android' && Platform.Version >= 23) {
    PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    ).then(response => {
      if (response === PermissionsAndroid.RESULTS.GRANTED) {
        isAllowed = true;
        navigator.geolocation.watchPosition(...geoArgs);
      }
    });
  }

  return next => action => {
    if (
      isAllowed &&
      action.type === GeolocationActions.refreshGeolocation.type
    ) {
      navigator.geolocation.getCurrentPosition(...geoArgs.slice(0, -1));
    }

    return next(action);
  };
};
