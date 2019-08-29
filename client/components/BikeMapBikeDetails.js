import React, { PureComponent } from 'react';
import {Dimensions, FlatList, StyleSheet, Text, TouchableHighlight, TouchableWithoutFeedback, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import { distanceTo } from 'geolocation-utils';

import {arrayOf, shape, func, string} from 'prop-types';
import {RentButton} from './RentButton';
import {connect} from 'react-redux';
import BigNum from '@liskhq/bignum/bignum';
import {humanReadableDistance} from '../actions/utils';

class BikeMapBikeDetails extends PureComponent {

    static propTypes = {
        bike: shape({
            title: string.isRequired,
            description: string.isRequired,
            deposit: string.isRequired,
            pricePerHour: string.isRequired,
        }).isRequired,
        onRentPress: func.isRequired,
        onClosePress: func.isRequired,
    };

    render() {

        const { bike } = this.props;

        let distance;

        try {
            distance = distanceTo(this.props.geolocation, bike.location);
        } catch (e) {
            // Meh.
        }

        return <View
            style={styles.bikeDetails}
        >
            <View style={styles.bikeDetailsHeaderBox}>
                <Text style={styles.bikeDetailsHeaderText}>{bike.title}</Text>
                <TouchableWithoutFeedback onPress={this.props.onClosePress}>
                    <Ionicons name="ios-close-circle" size={32} color="#C4C4C4" />
                </TouchableWithoutFeedback>
            </View>

            <View style={styles.bikeDetailsContentBox}>
                <Text>{ distance && ( ' Distance: ' + humanReadableDistance(distance)) }</Text>
                <Text>{bike.description}</Text>
                <RentButton
                    onPress={() => this.props.onRentPress(bike)}
                    label={"Rent"}
                    style={styles.rentButton}
                />
            </View>
        </View>
    }
}

const styles = StyleSheet.create({
    bikeDetails: {
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

    bikeDetailsHeaderBox: {
        paddingBottom: 10,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bikeDetailsHeaderText: {
        color: '#000',
        fontSize: 24,
    },

    bikeDetailsContentBox: {
    },
    rentButton: {
        marginTop: 20,
        height: 30,
    }
});

export default connect(store => ({
    account: store.account,
    geolocation: store.geolocation,
}))(BikeMapBikeDetails);
