import {buildActions} from "./utils";
import { APIClient } from '@liskhq/lisk-client/dist-browser';
import { env } from '../config/env';
import BigNum from '@liskhq/bignum';

console.debug("Node URL", env.BLOCKCHAIN_NODE_URL);

const client = new APIClient([env.BLOCKCHAIN_NODE_URL]);

export const BlockchainActions = buildActions('BlockchainActions', {
    getBikes() {
        return dispatch => client.accounts.get({
            sort: 'balance:desc',
            limit: 5,
        }).then(response => {
            const companyAccount = response.data.filter(account => Object.keys(account.asset).length > 0)[0];
            const bikes = companyAccount.asset.bikes;

            Object.values(bikes).forEach(bike => {
                bike.location.latitude = new BigNum(bike.location.latitude).toNumber();
                bike.location.longitude = new BigNum(bike.location.longitude).toNumber();
            });

            dispatch(BlockchainActions.setBikes(bikes));
        });
    },
    setBikes(bikes) {
        return { bikes };
    },
    refreshGeolocation() {}
});
