import React, {Component} from 'react';
import {StyleSheet, Dimensions, Keyboard, StatusBar, View, Text, FlatList, TouchableHighlight, TouchableWithoutFeedback} from 'react-native';
import { shape, arrayOf, number, string } from 'prop-types';
import Toast from 'react-native-root-toast';

import ClusteredMapView from 'react-native-maps-super-cluster';
import { Marker, Callout } from 'react-native-maps';
import {connect} from 'react-redux';
import CenterPositionButton from '../components/CenterPositionButton';
import {BikesActions} from '../actions/BikesActions';
import BikeMapList from '../components/BikeMapList';
import BikeMapBikeDetails from '../components/BikeMapBikeDetails';
import BikeRentCard from '../components/BikeRentCard';
import {GeolocationActions} from '../actions/GeolocationActions';

class BikeMap extends Component {

    static propTypes = {
        navigation: shape({}).isRequired,
        geolocation: shape({
            latitude: number.isRequired,
            longitude: number.isRequired,
        }),
        bikes: arrayOf(shape({
            id: string.isRequired,
            description: string,
            rentedBy: string,
        })).isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            clusterDetails: null,
            selectedBike: null,
        }
    }

    componentDidMount() {
        const toast = Toast.show('Searching for bikes', {
            duration: Toast.durations.LONG,
            position: Toast.positions.BOTTOM,
            shadow: true,
            animation: true,
            hideOnPress: true,
            delay: 100,
        });

        this.props.dispatch(BikesActions.getBikes()).finally(() => {
            Toast.hide(toast);
        });

        this.props.dispatch(GeolocationActions.refreshGeolocation());

        this.updateInterval = setInterval(() => {
            this.forceUpdate();
        }, 60*1000);
    }

    componentWillUnmount() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!this.props.account || !prevProps.account) return;

        const bikePreviousRented = prevProps.bikes.find(bike => bike.rentedBy === prevProps.account.address);
        const currentRentedBy = this.getRentedBike();

        if (currentRentedBy && bikePreviousRented !== currentRentedBy) {
            this.closeClusterDetails();
            this.closeBikeDetails();
        }
    }

    getUserLocation = () => {
        return {
            latitude: this.props.geolocation ? this.props.geolocation.latitude : 48.8534, // Paris latitude
            longitude: this.props.geolocation ? this.props.geolocation.longitude : 2.3488, // Paris longitude
        };
    };

    getRentedBike = () => {
        const { account } = this.props;

        if (!account) return undefined;

        return this.props.bikes.find(bike => bike.rentedBy === account.address);
    };

    centerOnCurrentPosition = () => {
        if (this.clusteredMap) {
            this.clusteredMap.getMapRef().animateToRegion(this.getUserLocation());
        }
    };

    renderMarker = data => {
        return (
            <Marker
                key={data.id}
                coordinate={data.location}
                onPress={() => this.onMarkerPress(data)}
            />
        );
    };

    renderCluster = (cluster, onPress) => {
        const pointCount = cluster.pointCount;
        const coordinate = cluster.coordinate;
        const clusterId = cluster.clusterId;

        return (
            <Marker
                identifier={`cluster-${clusterId}`}
                coordinate={coordinate}
                onPress={onPress}
                style={styles.clusterBox}
            >
                <Text style={styles.clusterText}>{pointCount}</Text>
            </Marker>
        );
    };

    onClusterPress = (clusterId, children) => {
        this.setState({
            clusterDetails: children,
            selectedBike: null,
        });
    };

    closeClusterDetails = () => {
        this.setState({
            clusterDetails: null,
        });
    };

    onMarkerPress = (bike) => {
        this.setState({
            selectedBike: bike,
        });
        this.closeClusterDetails();
    };

    closeBikeDetails = () => {
        this.setState({
            selectedBike: null,
        });
        this.closeClusterDetails();
    };

    onRentPress = bike => {
        if (!this.props.account) {
            this.props.navigation.navigate('SignIn', { bikeId: bike.id });
            return;
        }

        this.props.navigation.navigate('Rent', { bikeId: bike.id });
    };

    onReturnPress = bike => {
        this.props.dispatch(BikesActions.returnBike(bike))

        .then(tx => {
            this.props.dispatch(BikesActions.setBike({
                ...bike,
                rentedBy: undefined,
                lastReturnTransactionId: tx.id,
                rentalEndDatetime: tx.timestamp,
            }));
            this.props.navigation.navigate('RootStack');
        })

        .then(() => {
            Toast.show('The bike has been returned', {
                duration: Toast.durations.SHORT,
                position: Toast.positions.BOTTOM,
                shadow: true,
                animation: true,
                hideOnPress: true,
                delay: 100,
            });
        })

        .catch(response => {
            this.setState({
                errorMessage: response.errors.map(error => error.message).join("\n"),
            });
        })
    };

    render() {

        const rentedBike = this.getRentedBike();
        const availableBikes = Object.values(this.props.bikes).filter(bike => {
                return bike.rentedBy === undefined
            });

        return <View style={styles.container}>
            <ClusteredMapView
                ref={node => { this.clusteredMap = node }}
                data={availableBikes}
                initialRegion={{
                    ...this.getUserLocation(),
                    latitudeDelta: 2,
                    longitudeDelta: 2,
                }}

                showsUserLocation={true}
                showsMyLocationButton={false}
                rotateEnabled={false}
                showsCompass={false}
                edgePadding={{ top: 50, left: 50, bottom: 50, right: 50 }}

                renderCluster={this.renderCluster}
                renderMarker={this.renderMarker}
                onClusterPress={this.onClusterPress}

                height={Dimensions.get('window').height}
            />

            { this.state.clusterDetails && (
                <BikeMapList
                    bikes={this.state.clusterDetails}
                    onBikePress={this.onRentPress}
                    onClosePress={this.closeClusterDetails}
                />
            )}

            { this.state.selectedBike && (
                <BikeMapBikeDetails
                    bike={this.state.selectedBike}
                    onRentPress={this.onRentPress}
                    onClosePress={this.closeBikeDetails}
                />
            )}

            { rentedBike && (
                <BikeRentCard
                    bike={rentedBike}
                    onPress={this.onReturnPress}
                />
            )}

        </View>
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-end',
    },
    clusterBox: {
        height: 30,
        width: 30,
        borderRadius: 5,
        backgroundColor: '#005F0D',
    },
    clusterText: {
        fontSize: 20,
        lineHeight: 30,
        textAlign: 'center',
        color: 'white',
    },
    centerButton: {
        position: 'absolute',
        bottom: 50,
        right: 50,
    }
});

export default connect(store => ({
    geolocation: store.geolocation,
    bikes: Object.values(store.bikes),
    account: store.account,
}))(BikeMap);
