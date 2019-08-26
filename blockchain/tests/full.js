const util = require('util');
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

const laundry = new Promise(async (res, rej) => {

    // Feed the account

    const tx =  new FaucetTransaction({
        amount: transactions.utils.convertLSKToBeddows('1000'),
        senderPublicKey: account.publicKey,
        recipientId: account.address,
        timestamp: getTimestamp(),
    });

    tx.sign(account.passphrase);

    const [error, response] = await to(client.transactions.broadcast(tx.toJSON()));

    if (error) {
        return Promise.reject(error);
    }

    console.info("Account fed.");
    res();
})
.then(() => {
    return new Promise(res => setTimeout(res, 10*1000));
})
.then(async () => {

    // Create the bike

    {
        for (let i = 0; i < 5; i++) {
            const tx =  new CreateBikeTransaction({
                senderPublicKey: account.publicKey,
                recipientId: account.address,
                timestamp: getTimestamp(),
                asset: {
                    id: ++i,
                    description: `Bike #${i}`,
                    pricePerHour: transactions.utils.convertLSKToBeddows("1"),
                    deposit: transactions.utils.convertLSKToBeddows("300"),
                }
            });

            tx.sign(account.passphrase);

            const [error, response] = await to(client.transactions.broadcast(tx.toJSON()));

            if (error) {
                return Promise.reject(error);
            }

            console.info(`Bike #${i} created`);
        }
    }
})
.then(() => {
    return new Promise(res => setTimeout(res, 10*1000));
})

.then(async () => {

    // Rent the bike

    {
        const tx =  new RentBikeTransaction({
            senderPublicKey: account.publicKey,
            recipientId: account.address,
            timestamp: getTimestamp(),
            amount: transactions.utils.convertLSKToBeddows("300"),
            asset: {
                id: 1,
            }
        });

        tx.sign(account.passphrase);

        const [error, response] = await to(client.transactions.broadcast(tx.toJSON()));

        if (error) {
            return Promise.reject(error);
        }

        console.info(`Bike #${i} created`);
    }
})

.then(() => {
    console.info("All good.");
    process.exit(0);
})
.catch(err => {
    console.error(err);
    process.exit(1);
})

