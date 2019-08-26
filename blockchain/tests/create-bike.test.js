const util = require('util');
const fs = require('fs');
const { to } = require('await-to-js');

const { BigNum } = require('lisk-sdk');
const { getAddressFromPublicKey, getKeys } = require('@liskhq/lisk-cryptography');
const { Mnemonic } = require('@liskhq/lisk-passphrase');
const { EPOCH_TIME } = require('@liskhq/lisk-constants');
const transactions = require('@liskhq/lisk-transactions');
const { APIClient } = require('@liskhq/lisk-client');

const { CreateBikeTransaction, RentBikeTransaction } = require('../transactions');

const client = new APIClient(['http://localhost:4000']);

const getTimestamp = () => {
    const millisSinceEpoc = Date.now() - Date.parse(EPOCH_TIME);
    const inSeconds = ((millisSinceEpoc) / 1000).toFixed(0);
    return  parseInt(inSeconds);
};

const account = JSON.parse(fs.readFileSync('./account.json'));

console.debug("Account used : ", account.address);

const promises = [];

for (let i = 0; i < 5; i++) {
    const tx =  new CreateBikeTransaction({
        senderPublicKey: account.publicKey,
        recipientId: account.address,
        timestamp: getTimestamp(),
        asset: {
            id: i,
            description: `Bike #${i}`,
            pricePerHour: transactions.utils.convertLSKToBeddows("1"),
            deposit: transactions.utils.convertLSKToBeddows("300"),
        }
    });

    tx.sign(account.passphrase);

    let creationPromise = client.transactions.broadcast(tx.toJSON())
    .then(() => {
        console.info(`Bike #${i} created`);
    })
    .catch(error => {
        console.error(error);
        return Promise.reject(error)
    });

    promises.push(creationPromise);
}

Promise.all(promises).then(() => {
    console.info("All bikes created.");
    setTimeout(process.exit(0), 10*1000);
})
.catch(error => {
    console.error(error);
    process.exit(0);
});
