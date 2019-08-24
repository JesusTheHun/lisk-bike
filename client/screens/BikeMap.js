import React, {Component} from 'react';
import {StyleSheet, Dimensions, Keyboard, StatusBar, View, Text} from 'react-native';
import { shape, arrayOf, number } from 'prop-types';

import ClusteredMapView from 'react-native-maps-super-cluster';
import { Marker, Callout } from 'react-native-maps';
import {connect} from 'react-redux';
import CenterPositionButton from '../components/CenterPositionButton';

class BikeMap extends Component {

    static propTypes = {
        navigation: shape({}).isRequired,
        geolocation: shape({
            latitude: number.isRequired,
            longitude: number.isRequired,
        }),
        bikes: arrayOf(shape({})).isRequired,
    };

    constructor(props) {
        super(props);


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
            >
                <Text style={styles.clusterText}>{pointCount}</Text>
            </Marker>
        );
    };

    render() {
        return <View>
            <ClusteredMapView
                ref={node => { this.clusteredMap = node }}
                data={[]}
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
            >

                {/*{this.props.geolocation && (*/}
                {/*    <CenterPositionButton onPress={this.centerOnCurrentPosition} />*/}
                {/*)}*/}

            </ClusteredMapView>
        </View>
    }
}

const styles = StyleSheet.create({
    clusterText: {
    },
});

export default connect(store => ({
    geolocation: store.geolocation,
    bikes: store.bikes,
}))(BikeMap);
