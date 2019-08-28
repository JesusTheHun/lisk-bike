import { buildActions, dateToLiskEpochTimestamp } from "./utils";

import lisk from '../lisk-client';
import { env } from '../config/env';
import FaucetTransaction from '../lisk-transaction-faucet';

const client = new lisk.APIClient([env.BLOCKCHAIN_NODE_URL]);

export const AccountActions = buildActions('AccountActions', {
    createAccount() {
        return dispatch => {
            const passphrase = lisk.passphrase.Mnemonic.generateMnemonic();
            const { publicKey, address } = lisk.cryptography.getAddressAndPublicKeyFromPassphrase(passphrase);

            const newAccount = {
                passphrase,
                publicKey,
                address,
            };

            const tx =  new FaucetTransaction({
                amount: lisk.transaction.utils.convertLSKToBeddows('1000'),
                senderPublicKey: newAccount.publicKey,
                recipientId: newAccount.address,
                timestamp: dateToLiskEpochTimestamp(new Date()),
            });

            tx.sign(newAccount.passphrase);

            return client.transactions.broadcast(tx.toJSON()).then(() => {
                return newAccount
            }).catch(err => {
                console.error(err);
                return Promise.reject(err);
            });
        }
    },
    fetchAccount(passphrase) {
        return dispatch => {
            const address = lisk.cryptography.getAddressFromPassphrase(passphrase);

            return client.accounts.get({ address }).then(response => {
                return {
                    passphrase,
                    ... response.data[0],
                };
            });
        }
    },
    setAccount(account) {
        return { account };
    },
});
