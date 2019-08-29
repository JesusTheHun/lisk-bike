const util = require('util');
const fs = require('fs');
const { to } = require('await-to-js');

require('dotenv').config({ path : '../.env' });

const { BigNum } = require('lisk-sdk');
const { getAddressFromPublicKey, getKeys } = require('@liskhq/lisk-cryptography');
const { Mnemonic } = require('@liskhq/lisk-passphrase');
const { EPOCH_TIME } = require('@liskhq/lisk-constants');
const transactions = require('@liskhq/lisk-transactions');

const { FaucetTransaction } = require('../transactions');
const { APIClient } = require('@liskhq/lisk-client');

let companyAccount;
let renterAccount;

{
    const passphrase = Mnemonic.generateMnemonic();
    const { privateKey, publicKey } = getKeys(passphrase);
    const address = getAddressFromPublicKey(publicKey);

    companyAccount = {
        passphrase,
        privateKey,
        publicKey,
        address,
    };

    fs.writeFileSync('./company.json', JSON.stringify(companyAccount));

    console.info("Company account created :", companyAccount);
}

{
    const passphrase = Mnemonic.generateMnemonic();
    const { privateKey, publicKey } = getKeys(passphrase);
    const address = getAddressFromPublicKey(publicKey);

    renterAccount = {
        passphrase,
        privateKey,
        publicKey,
        address,
    };

    fs.writeFileSync('./renter.json', JSON.stringify(renterAccount));

    console.info("Renter account created :", renterAccount);
}

const client = new APIClient([`http://${process.env.HTTP_HOST}:${process.env.HTTP_PORT}`]);

const getTimestamp = () => {
    const millisSinceEpoc = Date.now() - Date.parse(EPOCH_TIME);
    const inSeconds = ((millisSinceEpoc) / 1000).toFixed(0);
    return  parseInt(inSeconds);
};

// Feed the account

const tx1 =  new FaucetTransaction({
    type: 777,
    fee: '0',
    amount: transactions.utils.convertLSKToBeddows('10000'),
    senderPublicKey: companyAccount.publicKey,
    recipientId: companyAccount.address,
    timestamp: getTimestamp(),
});

tx1.sign(companyAccount.passphrase);

const tx2 =  new FaucetTransaction({
    amount: transactions.utils.convertLSKToBeddows('10000'),
    senderPublicKey: renterAccount.publicKey,
    recipientId: renterAccount.address,
    timestamp: getTimestamp(),
});

tx2.sign(renterAccount.passphrase);

Promise.all([client.transactions.broadcast(tx1.toJSON()), client.transactions.broadcast(tx2.toJSON())])

.then(() => {
    console.info("Accounts fed.");
    setTimeout(() => process.exit(0), 10*1000);
})
.catch(error => {
    console.error(error);
    process.exit(1);
});
