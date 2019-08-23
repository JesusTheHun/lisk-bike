import {GeolocationActions} from "actions/GeolocationActions";

export default (state = null, action) => {
    switch (action.type) {
        case GeolocationActions.setGeolocation.type:
            return action.geolocation;
        default: return state;
    }
}