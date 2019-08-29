# Lisk Bike

## Demo

You can try the mobile app on your device by following this link : https://expo.io/@jesusthehun/lisk-bike.
Download the **Expo Client** app and scan the QR code.

#### Bike Location Behavior

The bike location is updated when you move with your phone.
Since bike are not visible on the map if they are already rented, you won't see the bike's position updated until you return the bike.


## Development

### Blockchain using Docker

For the first run we have to create the database before we start eh node app.

````bash
cd blockchain
docker-compose build
docker-compose up -d psql
docker exec -ti lisk-psql psql -h localhost -U lisk -d postgres -c "CREATE DATABASE lisk_dev OWNER lisk"
docker-compose up -d nodejs
````

For the other run you just have to use your classic `docker-compose up` and `docker-compose stop`

### Create some data

Create accounts. This will create two accounts, one for the company, one for rent.
 The accounts will be store in json file in the script directory.

````bash
cd node tests && node create-accounts.test.js 
````

Create bikes. This will create 5 bikes by default using the company account.
The default bike location is in Paris, you can of course edit the script to change their default location.

````bash
node create-bikes.test.js 
````

### Mobile app

The app has been created with [Expo](https://expo.io/learn).
The blockchain needs to be running.

```bash
cd client && npm i
npm start
```

Scan the QR code with the **Expo Client** app and you are good to go !

## Technical details

### Rent & Return

To ensure consistency and reversability, both rent & return transaction must specify the previous transaction of each.
For example, to rent a bike you must specify the `lastRentTransactionId` and to return the bike you must specify the `lastReturnTransactionId`.

Read scripts for more details, they are pretty straight forward.
