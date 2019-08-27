import {BlockchainActions} from "../actions/BlockchainActions";

export default (state = [], action) => {
    switch (action.type) {
        case BlockchainActions.setBikes.type:
            return action.bikes;
        default: return state;
    }
}
