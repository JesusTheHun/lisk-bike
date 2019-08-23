import {buildActions} from "./utils";

export const GeolocationActions = buildActions('GeolocationActions', {
    setGeolocation(geolocation) {
        return { geolocation }
    },
    refreshGeolocation() {}
});
