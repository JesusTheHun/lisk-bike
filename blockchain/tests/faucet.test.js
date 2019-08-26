const util = require('util');
const fs = require('fs');
const { to } = require('await-to-js');

const { BigNum } = require('lisk-sdk');
const { getAddressFromPublicKey, getKeys } = require('@liskhq/lisk-cryptography');
const { Mnemonic } = require('@liskhq/lisk-passphrase');
const { EPOCH_TIME } = require('@liskhq/lisk-constants');
const transactions = require('@liskhq/lisk-transactions');

const passphrase = Mnemonic.generateMnemonic();
const { privateKey, publicKey } = getKeys(passphrase);
const address = getAddressFromPublicKey(publicKey);

const account = {
    passphrase,
    privateKey,
    publicKey,
    address,
};

fs.writeFileSync('./account.json', JSON.stringify(account));

console.info("Company account created :", account);

const { FaucetTransaction } = require('lisk-transaction-faucet');
const { CreateBikeTransaction, RentBikeTransaction } = require('../transactions');
const { APIClient } = require('@liskhq/lisk-client');

const client = new APIClient(['http://localhost:4000']);

const getTimestamp = () => {
    const millisSinceEpoc = Date.now() - Date.parse(EPOCH_TIME);
    const inSeconds = ((millisSinceEpoc) / 1000).toFixed(0);
    return  parseInt(inSeconds);
};

// Feed the account

const tx =  new FaucetTransaction({
    amount: transactions.utils.convertLSKToBeddows('10000'),
    senderPublicKey: account.publicKey,
    recipientId: account.address,
    timestamp: getTimestamp(),
});

tx.sign(account.passphrase);

client.transactions.broadcast(tx.toJSON())

.then(() => {
    console.info("Account fed.");
    setTimeout(() => process.exit(0), 10*1000);
})
.catch(error => {
    console.error(error);
    process.exit(1);
});
