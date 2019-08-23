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
        const validDeposit = BikeValidator.deposit(this.id, this.amount);

        if (validId !== true) {
            errors.push(validId);
        }

        if (validDeposit !== true) {
            errors.push(validDeposit);
        }

        return errors;
    }

    prepare(store) {
        return Promise.all([
            super.prepare(store),
            store.transaction.cache({
                id: this.asset.lastRentalTransactionId,
            }),
            store.transaction.cache({
                id: this.asset.lastReturnTransactionId,
            })
        ]);
    }

    applyAsset(store) {
        super.applyAsset(store);

        const errors = [];

        const lastRentTransaction = store.transaction.find(t => t.id === this.asset.lastRentTransactionId);
        const lastReturnTransaction = store.transaction.find(t => t.id === this.asset.lastReturnTransactionId);
        const recipient = store.account.get(this.recipientId);
        const rentedBike = recipient.asset.bikes[this.asset.id];

        if (rentedBike === undefined) {
            errors.push(new TransactionError("Bike not found", this.id, "this.asset.id", this.asset.id, "An existing bike ID on recipient account"));
        }

        if (lastRentTransaction.id !== rentedBike.lastRentTransactionId) {
            errors.push(new TransactionError('Invalid lastRentTransactionId for this bike', this.id, '.asset.id', this.asset.lastRentTransactionId, 'The last rent transaction id of the bike you want to rent'));
        }

        if (lastReturnTransaction.id !== rentedBike.lastReturnTransactionId) {
            errors.push(new TransactionError('Invalid lastReturnTransactionId for this bike', this.id, '.asset.id', this.asset.lastReturnTransactionId, 'The last transaction id of the bike you want to rent'));
        }

        const deposit = new BigNum(rentedBike.deposit);

        if (!deposit.eq(this.amount)) {
            errors.push(new TransactionError("Invalid amount", this.id, "this.amount", this.amount, `The precise amount of the bike's deposit : ${rentedBike.deposit.toString()}`));
        }

        rentedBike.rentedBy = this.senderId;
        rentedBike.rentalStartDatetime = this.timestamp;
        rentedBike.rentalEndDatetime = undefined;
        rentedBike.lastRentTransactionId = this.id;

        store.account.set(this.recipientId, recipient);

        return errors;
    }

    undoAsset(store) {
        super.undoAsset(store);

        const errors = [];

        const lastRentTransaction = store.transaction.get(this.asset.lastRentTransactionId);
        const lastReturnTransaction = store.transaction.get(this.asset.lastReturnTransactionId);
        const recipient = store.account.get(this.recipientId);
        const rentedBike = recipient.asset.bikes[this.asset.id];

        if (rentedBike === undefined) {
            errors.push(new TransactionError("Bike not found", this.id, "this.asset.id", this.asset.id, "An existing bike ID on recipient account"));
        }

        if (lastRentTransaction.id !== rentedBike.lastRentTransactionId) {
            errors.push(new TransactionError('Invalid lastRentTransactionId for this bike', this.id, '.asset.id', this.asset.lastRentTransactionId, 'The last rent transaction id of the bike you want to rent'));
        }

        if (lastReturnTransaction.id !== rentedBike.lastReturnTransactionId) {
            errors.push(new TransactionError('Invalid lastReturnTransactionId for this bike', this.id, '.asset.id', this.asset.lastReturnTransactionId, 'The last transaction id of the bike you want to rent'));
        }

        rentedBike.rentedBy = lastRentTransaction.senderId;
        rentedBike.rentalStartDatetime = lastRentTransaction.timestamp;
        rentedBike.rentalEndDatetime = lastReturnTransaction.timestamp;
        rentedBike.lastRentTransactionId = this.id;

        store.account.set(this.recipientId, recipient);

        return errors;
    }
}

module.exports = RentBikeTransaction;
