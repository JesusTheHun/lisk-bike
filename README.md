# Lisk Bike

## Demo

You can try the mobile app on your device by following this link : https://expo.io/@jesusthehun/lisk-bike.
Download the **Expo Client** app and scan the QR code.

## Development

We assume you already have setup a functioning Lisk environment. If not, see https://lisk.io/documentation/lisk-sdk/setup

Start the blockchain

```bash
$ npm start
```

Let's put some data. 

Create accounts. This will create two accounts, one for the company, one for rent.
 The accounts will be store in json file in the script directory.

````bash
$ cd node tests && node create-accounts.test.js 
````

Create bikes. This will create 5 bikes by default using the company account.
The default bike location is in Paris, you can of course edit the script to change their default location.

````bash
$ node create-bikes.test.js 
````

### Rent & Return

To ensure consistency and reversability, both rent & return transaction must specify the previous transaction of each.
For example, to rent a bike you must specify the `lastRentTransactionId` and to return the bike you must specify the `lastReturnTransactionId`.

Read scripts for more details, they are pretty straight forward.
