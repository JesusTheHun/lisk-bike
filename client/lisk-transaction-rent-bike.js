import lisk from './lisk-client';
import BigNum from '@liskhq/bignum';

import { Bike, BikeValidator } from './bike.domain';
const { TransferTransaction, TransactionError } = lisk.transaction;

/**
 * Assets : {
 *     id: string
 *     lastRentTransactionId: string, Transaction.id
 *     lastReturnTransactionId: string, Transaction.id
 * }
 * Amount: BigNum string, bike deposit
 */

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

        const promises = [super.prepare(store)];

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
        super.applyAsset(store);

        const errors = [];

        const lastRentTransaction = store.transaction.find(t => t.id === this.asset.lastRentTransactionId);
        const lastReturnTransaction = store.transaction.find(t => t.id === this.asset.lastReturnTransactionId);
        const recipient = store.account.get(this.recipientId);

        if (recipient.asset.bikes === undefined) {
            errors.push(new TransactionError("Bike not found", this.id, "this.asset.id", this.asset.id, "An existing bike ID on recipient account"));
        }

        if (recipient.asset.bikes.some(bike => bike.rentedBy === this.senderId)) {
            errors.push(new TransactionError("You are already renting a bike", this.id));
        }

        const rentedBike = recipient.asset.bikes[this.asset.id];

        if (rentedBike === undefined) {
            errors.push(new TransactionError("Bike not found", this.id, "this.asset.id", this.asset.id, "An existing bike ID on recipient account"));
        }

        if (rentedBike.rentedBy !== undefined) {
            errors.push(new TransactionError(`Bike already rented (tx ${rentedBike.lastRentTransactionId})`, this.id, "this.asset.id", this.asset.id, "The ID of a currently non-rented bike"));
        }

        if (rentedBike.lastRentTransactionId && lastRentTransaction && lastRentTransaction.id !== rentedBike.lastRentTransactionId) {
            errors.push(new TransactionError('Invalid lastRentTransactionId for this bike', this.id, '.asset.id', this.asset.lastRentTransactionId, 'The last rent transaction id of the bike you want to rent'));
        }

        if (rentedBike.lastReturnTransactionId && lastReturnTransaction && lastReturnTransaction.id !== rentedBike.lastReturnTransactionId) {
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

        const lastRentTransaction = store.transaction.find(t => t.id === this.asset.lastRentTransactionId) || {};
        const lastReturnTransaction = store.transaction.find(t => t.id === this.asset.lastReturnTransactionId) || {};

        const recipient = store.account.get(this.recipientId);
        const rentedBike = recipient.asset.bikes[this.asset.id];

        rentedBike.rentedBy = lastRentTransaction.senderId;
        rentedBike.rentalStartDatetime = lastRentTransaction.timestamp;
        rentedBike.rentalEndDatetime = lastReturnTransaction.timestamp;
        rentedBike.lastRentTransactionId = this.id;

        store.account.set(this.recipientId, recipient);

        return errors;
    }
}

module.exports = RentBikeTransaction;
