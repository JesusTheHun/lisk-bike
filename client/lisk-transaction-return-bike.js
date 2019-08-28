import lisk from './lisk-client';
import BigNum from '@liskhq/bignum';

import { Bike, BikeValidator } from './bike.domain';
const { BaseTransaction, TransactionError } = lisk.transaction;

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

        const promises = [super.prepare(store), store.account.cache([ { address: this.recipientId }])];

        if (this.asset.lastRentTransactionId) {
            promises.push(store.transaction.cache({
                id: this.asset.lastRentTransactionId,
            }));
        }

        if (this.asset.lastReturnTransactionId) {
            promises.push(store.transaction.cache({
                id: this.asset.lastReturnTransactionId,
            }));
        }

        return Promise.all(promises);
    }

    applyAsset(store) {

        const errors = [];

        const lastRentTransaction = store.transaction.find(t => t.id === this.asset.lastRentTransactionId);
        const lastReturnTransaction = store.transaction.find(t => t.id === this.asset.lastReturnTransactionId);
        const sender = store.account.get(this.senderId);
        const recipient = store.account.get(this.recipientId);
        const rentedBike = recipient.asset.bikes[this.asset.id];

        if (rentedBike === undefined) {
            errors.push(new TransactionError("Bike not found", this.id, "this.asset.id", this.asset.id, "An existing bike ID on recipient account"));
        }

        if (rentedBike.rentedBy === undefined) {
            errors.push(new TransactionError(`Bike not currently rented (returned by tx ${rentedBike.lastReturnTransactionId})`, this.id, "this.asset.id", this.asset.id, "The ID of a currently rented bike"));
        }

        if (rentedBike.rentedBy !== this.senderId) {
            errors.push(new TransactionError(`Bike can only be returned by the one who rented it`, this.id, "this.asset.id", this.asset.id, "Nice try"));
        }

        if (lastRentTransaction.id !== rentedBike.lastRentTransactionId) {
            errors.push(new TransactionError('Invalid lastRentTransactionId for this bike', this.id, '.asset.id', this.asset.lastRentTransactionId, 'The last rent transaction id of the bike you want to rent'));
        }

        if (rentedBike.lastReturnTransactionId && lastReturnTransaction.id !== rentedBike.lastReturnTransactionId) {
            errors.push(new TransactionError('Invalid lastReturnTransactionId for this bike', this.id, '.asset.id', this.asset.lastReturnTransactionId, 'The last transaction id of the bike you want to rent'));
        }

        const rentalDuration = this.timestamp - lastRentTransaction.timestamp;
        const billedHours = Math.ceil(rentalDuration / 3600);
        const billedAmount = new BigNum(rentedBike.pricePerHour).mul(billedHours);
        const netDepositReturn = new BigNum(lastRentTransaction.amount).sub(billedAmount);
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

        const errors = [];

        const lastRentTransaction = store.transaction.find(t => t.id === this.asset.lastRentTransactionId) || {};
        const lastReturnTransaction = store.transaction.find(t => t.id === this.asset.lastReturnTransactionId) || {};
        const sender = store.account.get(this.senderId);
        const recipient = store.account.get(this.recipientId);
        const rentedBike = recipient.asset.bikes[this.asset.id];

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

module.exports = ReturnBikeTransaction;
