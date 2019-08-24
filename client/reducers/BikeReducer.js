import {BlockchainActions} from "../actions/BlockchainActions";

export default (state = [], action) => {
    switch (action.type) {
        case BlockchainActions.getBikes.type:
            return action.bikes;
        default: return state;
    }
}
