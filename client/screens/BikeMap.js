import React, {Component} from 'react';
import {StyleSheet, Dimensions, Keyboard, StatusBar, View, Text, FlatList, TouchableHighlight, TouchableWithoutFeedback} from 'react-native';
import { shape, arrayOf, number, string } from 'prop-types';

import ClusteredMapView from 'react-native-maps-super-cluster';
import { Marker, Callout } from 'react-native-maps';
import {connect} from 'react-redux';
import CenterPositionButton from '../components/CenterPositionButton';
import {BikesActions} from '../actions/BikesActions';
import BikeMapList from '../components/BikeMapList';
import BikeMapBikeDetails from '../components/BikeMapBikeDetails';

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
        })).isRequired,
    };

    constructor(props) {
        super(props);

        this.props.dispatch(BikesActions.getBikes());

        this.state = {
            clusterDetails: null,
            selectedBike: null,
        }
    }

    getUserLocation = () => {
        return {
            latitude: this.props.geolocation ? this.props.geolocation.latitude : 48.8534, // Paris latitude
            longitude: this.props.geolocation ? this.props.geolocation.longitude : 2.3488, // Paris longitude
        };
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
    }

    closeBikeDetails = () => {
        this.setState({
            selectedBike: null,
        });
        this.closeClusterDetails();
    }

    onRentPressed = bike => {
        if (!this.props.account) {
            this.props.navigation.navigate('SignIn', { bikeId: bike.id });
            return;
        }

        this.props.navigation.navigate('Rent', { bikeId: bike.id });
    };

    render() {
        return <View style={styles.container}>
            <ClusteredMapView
                ref={node => { this.clusteredMap = node }}
                data={this.props.bikes}
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
                    onBikePress={this.onRentPressed}
                    onClosePress={this.closeClusterDetails}
                />
            )}

            { this.state.selectedBike && (
                <BikeMapBikeDetails
                    bike={this.state.selectedBike}
                    onRentPress={this.onRentPressed}
                    onClosePress={this.closeBikeDetails}
                />
            )}

            {this.props.geolocation && (
                <CenterPositionButton onPress={this.centerOnCurrentPosition} style={styles.centerButton} />
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
    bikes: Object.values(store.bikes).filter(bike => {
        return bike.rentedBy === undefined
    }),
    account: store.account,
}))(BikeMap);
