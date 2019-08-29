import React, {Component} from 'react';
import {Dimensions, Keyboard, StatusBar, View, Text, StyleSheet, TouchableHighlight, Button} from 'react-native';
import { SafeAreaView } from 'react-navigation'
import {connect} from 'react-redux';
import { env } from '../config/env';
import {PrimaryButton} from '../components/PrimaryButton';
import {SecondaryButton} from '../components/SecondaryButton';
import lisk from '../lisk-client';
import {BikesActions} from '../actions/BikesActions';
import Toast from "react-native-root-toast";

class Rent extends Component {

    static navigationOptions = {
        title: 'Rent a bike',
    };

    constructor(props) {
        super(props);

        this.state = {
            errorMessage: '',
            rentButtonDisabled: false,
        }
    }

    getBike() {
        return this.props.bikes[this.props.navigation.getParam('bikeId')];
    }

    onChangeAccountPress = () => {
        this.props.navigation.navigate('SignIn', {
            bikeId: this.props.navigation.getParam('bikeId')
        });
    };

    onRentPress = () => {

        this.setState({
            rentButtonDisabled: true,
        });

        const toast = Toast.show('Sending request...', {
            duration: Infinity,
            position: Toast.positions.BOTTOM,
            shadow: true,
            animation: true,
            hideOnPress: true,
            delay: 0,
        });

        const bike = this.getBike();

        this.props.dispatch(BikesActions.rentBike(bike))
            .then(tx => {

                this.setState({
                    rentButtonDisabled: false,
                });

                this.props.dispatch(BikesActions.setBike({
                    ...bike,
                    rentedBy: this.props.account.address,
                    lastRentTransactionId: tx.id,
                    rentalStartDatetime: tx.timestamp,
                    location: this.props.geolocation,
                }));

                this.props.navigation.navigate('BikeMap');
            })
            .catch(response => {
                this.setState({
                    errorMessage: response.errors.map(error => error.message).join("\n"),
                });
            })
            .finally(() => {
                Toast.hide(toast);
            })
    };

    render() {

        const bike = this.getBike();

        if (bike === undefined) {
            return <SafeAreaView style={styles.emptyState}>
                <Text style={styles.emptyStateText}>Bike not found</Text>
            </SafeAreaView>
        }

        const props = [
            { label: "Bike", value: bike.title},
            { label: "Description", value: bike.description},
            { label: "Cost per hour", value:`${lisk.transaction.utils.convertBeddowsToLSK(bike.pricePerHour)} LSK`},
            { label: "Deposit", value:`${lisk.transaction.utils.convertBeddowsToLSK(bike.deposit)} LSK`},
        ];

        return <SafeAreaView style={styles.container}>
            <View style={styles.mainView}>
                <View style={styles.propLabelsBox}>
                    { props.map(prop => {
                        return <Text key={prop.label} style={styles.propLabel}>{prop.label}</Text>
                    }) }
                </View>
                <View style={styles.propValuesBox}>
                    { props.map(prop => {
                        return <Text key={prop.label} style={styles.propValue}>{prop.value}</Text>
                    }) }
                </View>
            </View>
            <View style={styles.errorBox}>
                <Text style={styles.errorText}>{this.state.errorMessage}</Text>
            </View>
            <View style={styles.actionsBox}>
                <PrimaryButton
                    label={"Rent"}
                    onPress={this.onRentPress}
                    style={styles.buttonStyle}
                    disabled={this.state.rentButtonDisabled}
                />
                <SecondaryButton
                    label={"Change account"}
                    onPress={this.onChangeAccountPress}
                    style={styles.buttonStyle}
                />
            </View>
        </SafeAreaView>
    }
}

const styles = StyleSheet.create({
    emptyState: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
    },
    emptyStateText: {

    },
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
    },
    mainView: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 40,
    },

    propLabelsBox: {

    },
    propLabel: {
        fontWeight: '500',
    },
    propValuesBox: {
        alignItems: 'flex-end',
    },
    propValue: {

    },

    errorBox: {
        marginBottom: 20,
        marginHorizontal: 40,
    },
    errorText: {
        color: '#C02B2B',
        textAlign: 'center',
    },

    actionsBox: {
        height: 90,
        justifyContent: 'space-between',
    },
    buttonStyle: {
        marginHorizontal: 40,
    }
});

export default connect(store => ({
    bikes: store.bikes,
    account: store.account,
    geolocation: store.geolocation,
}))(Rent);
