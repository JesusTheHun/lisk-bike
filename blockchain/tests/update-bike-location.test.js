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

const { UpdateBikeLocationTransaction } = require('../transactions');

const client = new APIClient([`http://${process.env.HTTP_HOST}:${process.env.HTTP_PORT}`]);

const getTimestamp = () => {
    const millisSinceEpoc = Date.now() - Date.parse(EPOCH_TIME);
    const inSeconds = ((millisSinceEpoc) / 1000).toFixed(0);
    return  parseInt(inSeconds);
};

const renter = JSON.parse(fs.readFileSync('./renter.json'));
const company = JSON.parse(fs.readFileSync('./company.json'));

console.debug("Account used : ", renter.address);

const bikeToUpdate = Number(process.argv[2]).toString();

const tx =  new UpdateBikeLocationTransaction({
    senderPublicKey: renter.publicKey,
    recipientId: company.address,
    timestamp: getTimestamp(),
    asset: {
        id: bikeToUpdate,
        previousLatitude: new BigNum(48.8534).toString(),
        previousLongitude: new BigNum(2.3488).toString(),
        latitude: new BigNum(48.8535).toString(),
        longitude: new BigNum(2.3489).toString(),
    }
});

tx.sign(renter.passphrase);

client.transactions.broadcast(tx.toJSON())
.then(() => {
    console.info("Bike location updated through transaction :", tx.id);
    setTimeout(() => process.exit(0), 10*1000);
})
.catch(error => {
    console.error(error);
    process.exit(1);
});
