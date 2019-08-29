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

const { CreateBikeTransaction } = require('../transactions');

const client = new APIClient([`http://${process.env.HTTP_HOST}:${process.env.HTTP_PORT}`]);

const getTimestamp = () => {
    const millisSinceEpoc = Date.now() - Date.parse(EPOCH_TIME);
    const inSeconds = ((millisSinceEpoc) / 1000).toFixed(0);
    return  parseInt(inSeconds);
};

const account = JSON.parse(fs.readFileSync('./company.json'));

console.debug("Account used : ", account.address);

const promises = [];

const getBikeInfo = i => {
  switch(i) {
      case 1: {
          return {
              title: "Bike - children",
              description: "Bike for children up to 1m20",
          };
      }
      case 4: {
          return {
              title: "Bike - electric",
              description: "Bike with electric assistance",
          }
      }
      default: {
          return {
              title: "Bike",
              description: "Adult sized bike",
          }
      }
  }
};

const numberOfBikeToCreate = Number(process.argv[2]);

const startLatitude = new BigNum(48.8535);
const startLongitude = new BigNum(2.3489);
const squareSize = Math.ceil(Math.sqrt(numberOfBikeToCreate));

for (let i = 0; i < numberOfBikeToCreate; i++) {
    const tx =  new CreateBikeTransaction({
        senderPublicKey: account.publicKey,
        recipientId: account.address,
        timestamp: getTimestamp(),
        asset: {
            id: Number(i).toString(),
            ... getBikeInfo(i),
            pricePerHour: transactions.utils.convertLSKToBeddows("1"),
            deposit: transactions.utils.convertLSKToBeddows("300"),
            latitude: startLatitude.add( (i % squareSize) * 0.002).toString(),
            longitude: startLongitude.add( (Math.ceil(i / squareSize)) * 0.002).toString(),
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
    setTimeout(() => process.exit(0), 10*1000);
})
.catch(error => {
    console.error(error);
    process.exit(1);
});
