import {BikesActions} from "../actions/BikesActions";

export default (state = {}, action) => {
    switch (action.type) {
        case BikesActions.setBikes.type: {
            return action.bikes;
        }

        case BikesActions.setBike.type: {
            return {
                ...state,
                [action.bike.id]: action.bike,
            };
        }

        default: return state;
    }
}
