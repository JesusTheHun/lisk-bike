import {buildActions} from "./utils";
import { APIClient } from '@liskhq/lisk-client/dist-browser';
import env from 'react-native-config';
import { to } from 'await-to-js';

const client = new APIClient([env.BLOCKCHAIN_NODE_URL]);

export const BlockchainActions = buildActions('BlockchainActions', {
    getBikes() {
        return client.transactions.get({
            type: 1001,
        });
    },
    refreshGeolocation() {}
});
