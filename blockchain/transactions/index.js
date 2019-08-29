const FaucetTransaction = require('./faucet');
const CreateBikeTransaction = require('./create-bike');
const RentBikeTransaction = require('./rent-bike');
const ReturnBikeTransaction = require('./return-bike');
const UpdateBikeLocationTransaction = require('./update-bike-location');

module.exports = {
    FaucetTransaction,
    CreateBikeTransaction,
    RentBikeTransaction,
    ReturnBikeTransaction,
    UpdateBikeLocationTransaction,
};
