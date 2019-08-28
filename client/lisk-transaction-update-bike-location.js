import lisk from './lisk-client';

import { Bike, BikeValidator } from './bike.domain';
const { BaseTransaction, TransactionError } = lisk.transaction;

class UpdateBikeLocationTransaction extends BaseTransaction {
    static get TYPE () {
        return 1004;
    }

    validateAsset() {
        const errors = [];

        const validId = BikeValidator.id(this.id, this.asset.id);
        const validLocation = BikeValidator.location(this.id, {
            latitude: this.asset.latitude,
            longitude: this.asset.longitude,
        });

        if (validId !== true) {
            errors.push(validId);
        }

        if (validLocation !== true) {
            errors.push(validLocation);
        }

        return errors;
    }

    async prepare(store) {
        return Promise.all([
            super.prepare(store),
            store.account.cache([ { address: this.recipientId }]),
        ]);
    }

    applyAsset(store) {
        const errors = [];

        const recipient = store.account.get(this.recipientId);
        const rentedBike = recipient.asset.bikes[this.asset.id];

        if (rentedBike === undefined) {
            errors.push(new TransactionError("Bike not found", this.id, "this.asset.id", this.asset.id, "An existing bike ID on recipient account"));
        }

        if (rentedBike.rentedBy !== this.senderId) {
            errors.push(new TransactionError(`Bike position can only be updated by the one who is renting it`, this.id, "this.asset.id", this.asset.id, "Nice try"));
        }

        if (this.asset.previousLatitude !== rentedBike.location.latitude || this.asset.previousLongitude !== rentedBike.location.longitude) {
            errors.push(new TransactionError("Invalid previous location", this.id));
        }

        rentedBike.location.latitude = this.asset.latitude;
        rentedBike.location.longitude = this.asset.longitude;

        recipient.asset.bikes[rentedBike.id] = rentedBike;

        store.account.set(this.recipientId, recipient);

        return errors;
    }

    undoAsset(store) {
        const errors = [];
        const recipient = store.account.get(this.recipientId);

        const rentedBike = recipient.asset.bikes[this.asset.id];

        rentedBike.location.latitude = this.asset.previousLatitude;
        rentedBike.location.longitude = this.asset.previousLongitude;

        recipient.asset.bikes[rentedBike.id] = rentedBike;

        store.account.set(this.recipientId, recipient);

        return errors;
    }
}

module.exports = UpdateBikeLocationTransaction;
