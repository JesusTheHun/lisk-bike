const { BigNum } = require('lisk-sdk');
const { BaseTransaction, TransferTransaction, TransactionError } = require('@liskhq/lisk-transactions');
const { Bike, BikeValidator } = require('../bike.domain');

/**
 * Assets : {
 *     id: string
 *     description: string
 *     pricePerHour: BigNum compatible string
 *     deposit: BigNum compatible string
 * }
 */
class CreateBikeTransaction extends BaseTransaction {
    static get TYPE () {
        return 1001;
    }

    static get FEE () {
        return TransferTransaction.FEE;
    };

    validateAsset() {
        const errors = [];

        if (this.senderId !== this.recipientId) {
            errors.push(new TransactionError('Invalid user or company account', this.id, '.recipientId', this.recipientId, 'You can only add bike to your own account'));
        }

        const validId = BikeValidator.id(this.id, this.asset.id);
        const validPricePerHour = BikeValidator.pricePerHour(this.id, this.asset.pricePerHour);
        const validDeposit = BikeValidator.deposit(this.id, this.asset.pricePerHour);

        if (validId !== true) {
            errors.push(validId);
        }

        if (validPricePerHour !== true) {
            errors.push(validPricePerHour);
        }

        if (validDeposit !== true) {
            errors.push(validDeposit);
        }

        return errors;
    }

    async prepare(store) {
        return Promise.all([
            super.prepare(store),
            store.account.cache([ { address: this.recipientId }])
        ]);
    }

    applyAsset(store) {
        const errors = [];

        const recipient = store.account.get(this.recipientId);

        if (recipient.bikes && recipient.bikes[this.asset.id] !== undefined) {
            errors.push(new TransactionError("Bike with this Id already exist", this.id, 'this.asset.id', this.asset.id, "A non-registered Id"));
        }

        const newBike = new Bike();

        newBike.id = this.asset.id;
        newBike.description = this.asset.description;
        newBike.pricePerHour = this.asset.pricePerHour.toString();
        newBike.deposit = this.asset.deposit.toString();

        if (recipient.asset === undefined) {
            recipient.asset = {};
        }

        if (recipient.asset.bikes === undefined) {
            recipient.asset.bikes = {};
        }

        recipient.asset.bikes[newBike.id] = newBike;

        store.account.set(this.recipientId, recipient);

        return errors;
    }

    undoAsset(store) {
        const errors = [];
        const recipient = store.account.get(this.recipientId);

        if (recipient.asset.bikes[this.asset.id]) {
            errors.push(new TransactionError('Bike not found for removal', this.id, '.asset.id', this.asset.id, 'A valid existing bike Id string'));
        }

        delete recipient.asset.bikes[this.asset.id];

        store.account.set(this.recipientId, recipient);

        return errors;
    }
}

module.exports = CreateBikeTransaction;
