const { BigNum } = require('lisk-sdk');
const { TransferTransaction, TransactionError } = require('@liskhq/lisk-transactions');
const { Bike, BikeValidator } = require('../bike.domain');

class RentBikeTransaction extends TransferTransaction {
    static get TYPE () {
        return 1002;
    }

    validateAsset() {
        const errors = [];

        const validId = BikeValidator.id(this.id, this.asset.id);

        if (validId !== true) {
            errors.push(validId);
        }

        return errors;
    }

    prepare(store) {
        return Promise.all([
            super.prepare(store),
            store.transaction.get({
                id: this.asset.lastTransactionId,
            })
        ]);
    }

    applyAsset(store) {
        super.applyAsset(store);

        const errors = [];

        const recipient = store.account.get(this.recipientId);
        const rentedBike = recipient.asset.bikes[this.asset.id];

        if (rentedBike === undefined) {
            errors.push(new TransactionError("Bike not found", this.id, "this.asset.id", this.asset.id, "An existing bike ID on recipient account"));
        }

        const deposit = new BigNum(rentedBike.deposit);

        if (!deposit.eq(this.amount)) {
            errors.push(new TransactionError("Invalid amount", this.id, "this.amount", this.amount, `The precise amount of the bike's deposit : ${rentedBike.deposit.toString()}`));
        }

        rentedBike.rentedBy = this.senderId;
        rentedBike.rentalStartDatetime = new Date().toUTCString();
        rentedBike.rentalEndDatetime = undefined;

        store.account.set(this.recipientId, recipient);

        return errors;
    }

    undoAsset(store) {
        super.undoAsset(store);

        const errors = [];
        const lastTransaction = store.transaction.get(this.asset.lastTransactionId);
        const recipient = store.account.get(this.recipientId);
        const rentedBike = recipient.asset.bikes[this.asset.id];

        if (lastTransaction.id != rentedBike.lastTransactionId) {

        }

        if (rentedBike ) {
            errors.push(new TransactionError('Bike not found for removal', this.id, '.asset.id', this.asset.id, 'A valid existing bike Id string'));
        }

        store.account.set(this.recipientId, {
            ...recipient,
            bikes: [
                ...recipient.bikes.slice(0, newBikeIndex),
                ...recipient.bikes.slice(newBikeIndex+1),
            ],
        });

        return errors;
    }
}

module.exports = RentBikeTransaction;
