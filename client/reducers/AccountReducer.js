import {AccountActions} from "../actions/AccountActions";

export default (state = null, action) => {
    switch (action.type) {
        case AccountActions.setAccount.type:
            return action.account;
        default: return state;
    }
}
