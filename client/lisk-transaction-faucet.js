import lisk from './lisk-client';
import BigNum from '@liskhq/bignum';

class FaucetTransaction extends lisk.transaction.BaseTransaction {
    static get TYPE () {
        return 777;
    }

    validateAsset() {
        return [];
    }

    async prepare(store) {
        await store.account.cache([ { address: this.recipientId } ]);
    }

    applyAsset(store) {

        const recipient = store.account.get(this.recipientId);

        store.account.set(this.recipientId, {
            ...recipient,
            balance: new BigNum(recipient.balance).add(this.amount).toString(),
        });

        return [];
    }

    undoAsset(store) {

        const recipient = store.account.get(this.recipientId);

        store.account.set(this.recipientId, {
            ...recipient,
            balance: new BigNum(recipient.balance).sub(this.amount).toString(),
        });

        return [];
    }
}

module.exports = FaucetTransaction;
