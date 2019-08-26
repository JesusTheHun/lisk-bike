const { BigNum } = require('lisk-sdk');
const { TransactionError } = require('@liskhq/lisk-transactions');

module.exports = {
    Bike: class {
        constructor() {
                this.id = undefined;
                this.description = undefined;
                this.rentedBy = undefined;
                this.pricePerHour = undefined;
                this.deposit = undefined;
                this.lastRentTransactionId = undefined;
                this.lastReturnTransactionId = undefined;
                this.rentalStartDatetime = undefined;
                this.rentalEndDatetime = undefined;
        }
    },
    BikeValidator: {
        id: (transactionId, param) => (param || typeof param === 'string' || param.length > 0) ? true :
            new TransactionError('Missing or invalid "asset.id" defined on transaction', transactionId, '.asset.id', this.asset.id, 'A string'),
        pricePerHour: (transactionId, param) => {
            try {
                const pricePerHour = new BigNum(param);
                return pricePerHour.gte(0);
            } catch(err) {
                return new TransactionError('Missing or invalid "asset.pricePerHour" defined on transaction', transactionId, '.asset.pricePerHour', this.asset.pricePerHour, 'A valid BigNum string')
            }
        },
        deposit: (transactionId, param) => {
            try {
                const deposit = new BigNum(param);
                return deposit.gte(0);
            } catch(err) {
                return new TransactionError('Missing or invalid "asset.deposit" defined on transaction', transactionId, '.asset.deposit', this.asset.deposit, 'A valid BigNum string')
            }
        }
    }
};
