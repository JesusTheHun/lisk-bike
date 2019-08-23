const { BigNum } = require('lisk-sdk');
const { TransferTransaction, TransactionError } = require('@liskhq/lisk-transactions');
const { Bike, BikeValidator } = require('../bike.domain');

class ReturnBikeTransaction extends BaseTransaction {
    static get TYPE () {
        return 1003;
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

        const lastRentTransaction = store.transaction.get(this.asset.lastRentTransactionId);
        const lastReturnTransaction = store.transaction.get(this.asset.lastReturnTransactionId);
        const sender = store.account.get(this.senderId);
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

        const rentalDuration = this.timestamp - lastRentTransaction.timestamp;
        const billedHours = Math.ceil(rentalDuration / 3600);
        const billedAmount = new BigNum(rentedBike.pricePerHour).mul(billedHours);
        const netDepositReturn = new BigNum(lastRentTransaction.deposit).sub(billedAmount);
        const newRecipientBalance = new BigNum(recipient.balance).sub(netDepositReturn).toString();
        const newSenderBalance = new BigNum(sender.balance).add(netDepositReturn).toString();

        store.account.set(this.senderId, { ...sender, balance: newSenderBalance});

        rentedBike.rentalEndDatetime = this.timestamp;
        rentedBike.lastReturnTransactionId = this.id;
        rentedBike.rentedBy = undefined;

        recipient.balance = newRecipientBalance;

        store.account.set(this.recipientId, recipient);

        return errors;
    }

    undoAsset(store) {
        super.undoAsset(store);

        const errors = [];

        const lastRentTransaction = store.transaction.get(this.asset.lastRentTransactionId);
        const lastReturnTransaction = store.transaction.get(this.asset.lastReturnTransactionId);
        const sender = store.account.get(this.senderId);
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

        const rentalDuration = this.timestamp - lastRentTransaction.timestamp;
        const billedHours = Math.ceil(rentalDuration / 3600);
        const billedAmount = new BigNum(rentedBike.pricePerHour).mul(billedHours);
        const netDepositReturn = new BigNum(lastRentTransaction.deposit).sub(billedAmount);
        const newRecipientBalance = new BigNum(recipient.balance).add(netDepositReturn).toString();
        const newSenderBalance = new BigNum(sender.balance).sub(netDepositReturn).toString();

        store.account.set(this.senderId, { ...sender, balance: newSenderBalance});

        rentedBike.rentalEndDatetime = this.timestamp;
        rentedBike.lastReturnTransactionId = lastReturnTransaction.id;
        rentedBike.rentedBy = this.senderId;

        recipient.balance = newRecipientBalance;

        store.account.set(this.recipientId, recipient);

        return errors;
    }
}

module.exports = RentBikeTransaction;
