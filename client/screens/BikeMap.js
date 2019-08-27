import React, {Component} from 'react';
import {StyleSheet, Dimensions, Keyboard, StatusBar, View, Text, FlatList} from 'react-native';
import { shape, arrayOf, number, string } from 'prop-types';

import ClusteredMapView from 'react-native-maps-super-cluster';
import { Marker, Callout } from 'react-native-maps';
import {connect} from 'react-redux';
import CenterPositionButton from '../components/CenterPositionButton';
import {BlockchainActions} from '../actions/BlockchainActions';

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

        this.props.dispatch(BlockchainActions.getBikes());

        this.state = {
            clusterDetails: null,
        }
    }

    getUserLocation() {
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

    onMarkerPress(data) {

    }

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
        });
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
                showsMyLocationButton={true}
                rotateEnabled={true}
                showsCompass={true}
                edgePadding={{ top: 50, left: 50, bottom: 50, right: 50 }}

                renderCluster={this.renderCluster}
                renderMarker={this.renderMarker}
                onClusterPress={this.onClusterPress}

                height={Dimensions.get('window').height}
            />

            { this.state.clusterDetails && (
                <FlatList
                    style={styles.clusterDetails}
                    data={this.state.clusterDetails}
                    renderItem={({item}) => {
                        return <View style={styles.clusterDetailElementBox}>
                            <Text style={styles.clusterDetailElementText}>{item.description}</Text>
                        </View>
                    }}
                    ListHeaderComponent={() => {
                        return <View style={styles.clusterDetailsHeaderBox}>
                            <Text style={styles.clusterDetailsHeaderText}>Available bikes</Text>
                        </View>
                    }}
                    ItemSeparatorComponent={() => {
                        return <View style={styles.clusterDetailsElementSeparator}/>
                    }}
                />
            )}

            {this.props.geolocation && (
                <CenterPositionButton onPress={this.centerOnCurrentPosition} />
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
        height: 20,
        width: 20,
        borderRadius: 5,
        backgroundColor: '#005F0D',
    },
    clusterText: {
        lineHeight: 20,
        textAlign: 'center',
        color: 'white',
    },
    clusterDetails: {
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
    clusterDetailsHeaderBox: {
        paddingBottom: 10,
    },
    clusterDetailsHeaderText: {
        fontSize: 18,
    },
    clusterDetailsElementSeparator: {
        height: 1,
        width: '100%',
        backgroundColor: 'rgba(196, 196, 196, 0.3)',
        margin: 5,
    },
    clusterDetailElementBox: {
        paddingHorizontal: 5,
    },
    clusterDetailElementText: {

    },
});

export default connect(store => ({
    geolocation: store.geolocation,
    bikes: Object.values(store.bikes).filter(bike => {
        return bike.rentedBy === undefined
    }),
}))(BikeMap);
