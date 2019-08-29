import React, { PureComponent } from 'react';
import {Dimensions, FlatList, StyleSheet, Text, TouchableHighlight, TouchableWithoutFeedback, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import { distanceTo } from 'geolocation-utils';

import {arrayOf, shape, func, string, number} from 'prop-types';
import {RentButton} from './RentButton';
import {connect} from 'react-redux';
import {ReturnButton} from './ReturnButton';
import moment from 'moment';
import {liskEpochTimestampToDate} from '../actions/utils';
import lisk from '../lisk-client';

class BikeRentCard extends PureComponent {

    static propTypes = {
        bike: shape({
            title: string.isRequired,
            pricePerHour: string.isRequired,
            rentalStartDatetime: number.isRequired,
        }).isRequired,
        onPress: func.isRequired,
    };

    render() {

        const { bike } = this.props;
        const rentDuration = moment().diff(liskEpochTimestampToDate(bike.rentalStartDatetime), 'minutes');
        const cost = Math.ceil(rentDuration / 60) * lisk.transaction.utils.convertBeddowsToLSK(bike.pricePerHour);

        return <View
            style={styles.bikeRentCard}
        >
            <View style={styles.bikeRentCardHeaderBox}>
                <Text style={styles.bikeRentCardHeaderText}>{bike.title}</Text>
            </View>

            <View style={styles.bikeRentCardContentBox}>
                <Text>{`Rented for approx. ${rentDuration} minutes`}</Text>
                <Text>{`Estimated cost : ${cost} LSK`}</Text>
                <ReturnButton
                    onPress={() => this.props.onPress(bike)}
                    label={"Return"}
                    style={styles.rentButton}
                />
            </View>
        </View>
    }
}

const styles = StyleSheet.create({
    bikeRentCard: {
        flex: 1,
        flexDirection: 'column',

        maxHeight: Dimensions.get('window').height / 2,
        width: Dimensions.get('window').width - (2*20),
        backgroundColor: 'white',
        position: 'absolute',
        left: 20,
        bottom: 30,
        borderRadius: 5,
        padding: 10,

        // https://ethercreative.github.io/react-native-shadow-generator/

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.32,
        shadowRadius: 5.46,

        elevation: 9,
    },

    bikeRentCardHeaderBox: {
        paddingBottom: 10,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bikeRentCardHeaderText: {
        color: '#000',
        fontSize: 24,
    },

    bikeRentCardContentBox: {
    },
    rentButton: {
        marginTop: 20,
        height: 30,
    }
});

export default connect(store => ({
    account: store.account,
    bikes: store.bikes,
}))(BikeRentCard);
