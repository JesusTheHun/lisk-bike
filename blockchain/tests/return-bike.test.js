const util = require('util');
const fs = require('fs');
const { to } = require('await-to-js');

const { BigNum } = require('lisk-sdk');
const { getAddressFromPublicKey, getKeys } = require('@liskhq/lisk-cryptography');
const { Mnemonic } = require('@liskhq/lisk-passphrase');
const { EPOCH_TIME } = require('@liskhq/lisk-constants');
const transactions = require('@liskhq/lisk-transactions');
const { APIClient } = require('@liskhq/lisk-client');

const { ReturnBikeTransaction } = require('../transactions');

const client = new APIClient(['http://localhost:4000']);

const getTimestamp = () => {
    const millisSinceEpoc = Date.now() - Date.parse(EPOCH_TIME);
    const inSeconds = ((millisSinceEpoc) / 1000).toFixed(0);
    return  parseInt(inSeconds);
};

const account = JSON.parse(fs.readFileSync('./account.json'));

console.debug("Account used : ", account.address);

const bikeToReturn = Number(process.argv[2]).toString();
const lastRentTransactionId = process.argv[3];
const lastReturnTransactionId  = process.argv[4];

const tx =  new ReturnBikeTransaction({
    senderPublicKey: account.publicKey,
    recipientId: account.address,
    timestamp: getTimestamp(),
    asset: {
        id: bikeToReturn,
        lastRentTransactionId,
        lastReturnTransactionId
    }
});

tx.sign(account.passphrase);

client.transactions.broadcast(tx.toJSON())
.then(() => {
    console.info("Bike returned through transaction :", tx.id);
    setTimeout(process.exit(0), 10*1000);
})
.catch(error => {
    console.error(error);
    process.exit(0);
});
