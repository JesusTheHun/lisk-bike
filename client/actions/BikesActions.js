import {buildActions, dateToLiskEpochTimestamp} from "./utils";
import * as lisk from '../lisk-client';
import { env } from '../config/env';
import RentBikeTransaction from '../lisk-transaction-rent-bike';
import ReturnBikeTransaction from '../lisk-transaction-return-bike';
import UpdateBikeLocationTransaction from '../lisk-transaction-update-bike-location';

const client = new lisk.APIClient([env.BLOCKCHAIN_NODE_URL]);

export const BikesActions = buildActions('BikesActions', {
    getBikes() {
        return dispatch => client.accounts.get({
            sort: 'balance:desc',
            limit: 50,
        }).then(response => {
            const companyAccount = response.data.filter(account => Object.keys(account.asset).length > 0)[0];
            const bikes = companyAccount.asset.bikes;

            Object.values(bikes).forEach(bike => {
                bike.companyAccount = companyAccount;
                bike.location.latitude = Number(bike.location.latitude);
                bike.location.longitude = Number(bike.location.longitude);
            });

            dispatch(BikesActions.setBikes(bikes));
        });
    },
    setBikes(bikes) {
        return { bikes };
    },
    setBike(bike) {
        return { bike };
    },
    setCompanyAccount(account) {
        return { account };
    },
    rentBike(bike) {
        return (dispatch, getState) => {

            const tx =  new RentBikeTransaction({
                asset: {
                    id: bike.id,
                },
                amount: bike.deposit,
                senderPublicKey: getState().account.publicKey,
                recipientId: bike.companyAccount.address,
                timestamp: dateToLiskEpochTimestamp(new Date()),
            });

            tx.sign(getState().account.passphrase);

            return client.transactions.broadcast(tx.toJSON())
            .then(() => tx)
            .catch(err => {
                return Promise.reject(err);
            });
        }
    },
    returnBike(bike) {
        return (dispatch, getState) => {

            const tx =  new ReturnBikeTransaction({
                asset: {
                    id: bike.id,
                    lastRentTransactionId: bike.lastRentTransactionId,
                    lastReturnTransactionId: bike.lastReturnTransactionId,
                },
                senderPublicKey: getState().account.publicKey,
                recipientId: bike.companyAccount.address,
                timestamp: dateToLiskEpochTimestamp(new Date()),
            });

            tx.sign(getState().account.passphrase);

            return client.transactions.broadcast(tx.toJSON())
            .then(() => tx)
            .catch(err => {
                return Promise.reject(err);
            });
        }
    },
    updateRentedBikeLocation(coords) {
        return (dispatch, getState) => {

            const rentedBike = Object.values(getState().bikes).find(bike => bike.rentedBy === getState().account.address);

            if (rentedBike === undefined) {
                console.error("Update Bike Location trigger but no bike is currently rented");
            }

            const tx =  new UpdateBikeLocationTransaction({
                asset: {
                    id: rentedBike.id,
                    previousLatitude: rentedBike.location.latitude,
                    previousLongitude: rentedBike.location.longitude,
                    latitude: Number(coords.latitude).toString(),
                    longitude: Number(coords.longitude).toString(),
                },
                senderPublicKey: getState().account.publicKey,
                recipientId: rentedBike.companyAccount.address,
                timestamp: dateToLiskEpochTimestamp(new Date()),
            });

            tx.sign(getState().account.passphrase);

            return client.transactions.broadcast(tx.toJSON())
            .then(() => tx)
            .catch(err => {
                return Promise.reject(err);
            });
        }
    }
});
