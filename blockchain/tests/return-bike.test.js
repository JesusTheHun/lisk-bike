const util = require('util');
const fs = require('fs');
const { to } = require('await-to-js');
require('dotenv').config({ path : '../.env' });

const { BigNum } = require('lisk-sdk');
const { getAddressFromPublicKey, getKeys } = require('@liskhq/lisk-cryptography');
const { Mnemonic } = require('@liskhq/lisk-passphrase');
const { EPOCH_TIME } = require('@liskhq/lisk-constants');
const transactions = require('@liskhq/lisk-transactions');
const { APIClient } = require('@liskhq/lisk-client');

const { ReturnBikeTransaction } = require('../transactions');

const client = new APIClient([`http://${process.env.HTTP_HOST}:${process.env.HTTP_PORT}`]);

const getTimestamp = () => {
    const millisSinceEpoc = Date.now() - Date.parse(EPOCH_TIME);
    const inSeconds = ((millisSinceEpoc) / 1000).toFixed(0);
    return  parseInt(inSeconds);
};

const renter = JSON.parse(fs.readFileSync('./renter.json'));
const company = JSON.parse(fs.readFileSync('./company.json'));

console.debug("Account used : ", renter.address);

const bikeToReturn = Number(process.argv[2]).toString();
const lastRentTransactionId = process.argv[3];
const lastReturnTransactionId  = process.argv[4];

const tx =  new ReturnBikeTransaction({
    senderPublicKey: renter.publicKey,
    recipientId: company.address,
    timestamp: getTimestamp(),
    asset: {
        id: bikeToReturn,
        lastRentTransactionId,
        lastReturnTransactionId
    }
});

tx.sign(renter.passphrase);

client.transactions.broadcast(tx.toJSON())
.then(() => {
    console.info("Bike returned through transaction :", tx.id);
    setTimeout(process.exit(0), 10*1000);
})
.catch(error => {
    console.error(error);
    process.exit(0);
});
