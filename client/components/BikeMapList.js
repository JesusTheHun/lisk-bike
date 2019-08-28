import React, {Component} from 'react';
import {Dimensions, FlatList, StyleSheet, Text, TouchableHighlight, TouchableWithoutFeedback, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';

import {arrayOf, shape, func} from 'prop-types';
import {RentButton} from './RentButton';
import {connect} from 'react-redux';

class BikeMapList extends Component {

    static propTypes = {
        bikes: arrayOf(shape({})).isRequired,
        onBikePress: func.isRequired,
        onClosePress: func.isRequired,
    };

    render() {
        return <FlatList
            stickyHeaderIndices={[0]}
            data={this.props.bikes}
            keyExtractor={item => item.id}
            style={styles.clusterDetails}
            ListHeaderComponent={() => {
                return <View style={styles.clusterDetailsHeaderBox}>
                    <Text style={styles.clusterDetailsHeaderText}>Available bikes</Text>
                    <TouchableWithoutFeedback onPress={this.props.onClosePress}>
                        <Ionicons name="ios-close-circle" size={32} color="#C4C4C4" />
                    </TouchableWithoutFeedback>
                </View>
            }}
            renderItem={({item}) => {
                return <View style={styles.clusterDetailElementBox}>
                    <View style={styles.clusterDetailElementBoxTextColumn}>
                        <Text style={styles.clusterDetailElementTextTitle}>{item.title}</Text>
                        <Text style={styles.clusterDetailElementTextDescription}>{item.description}</Text>
                    </View>
                    <View style={styles.clusterDetailElementBoxButtonColumn}>
                        <RentButton
                            label={"Rent"}
                            onPress={() => this.props.onBikePress(item)}
                        />
                    </View>
                </View>
            }}
            ItemSeparatorComponent={() => {
                return <View style={styles.clusterDetailsElementSeparator}/>
            }}
        />
    }
}

const styles = StyleSheet.create({
    clusterDetails: {
        maxHeight: Dimensions.get('window').height / 2,
        width: Dimensions.get('window').width - (2*20),
        backgroundColor: 'white',
        position: 'absolute',
        left: 20,
        bottom: 30,
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingBottom: 10,

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
        backgroundColor: 'white',
        height: 50,
        paddingBottom: 10,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    clusterDetailsHeaderText: {
        color: '#C4C4C4',
    },

    clusterDetailElementBoxTextColumn: {
        flexDirection: 'column',
        flex: 1,
    },

    clusterDetailElementBoxButtonColumn: {
        flexDirection: 'column',
        justifyContent: 'center',
    },

    clusterDetailElementTextTitle: {
        fontSize: 22,
    },
    clusterDetailElementTextDescription: {
        fontSize: 16,
    },


    clusterDetailsElementSeparator: {
        height: 1,
        width: '100%',
        backgroundColor: 'rgba(196, 196, 196, 0.3)',
        margin: 5,
    },
    clusterDetailElementBox: {
        paddingHorizontal: 5,
        flexDirection: 'row',
        flex: 1,
    },
    clusterDetailElementText: {

    },

    clusterDetailElementBoxButtonColumnButton: {
        padding: 6,
        borderRadius: 10,
        backgroundColor: '#424242',

        shadowColor: "#000",
        shadowOffset: {
            width: -2,
            height: 4,
        },
        shadowOpacity: 0.32,
        shadowRadius: 2.46,

        elevation: 4,
    },
    clusterDetailElementBoxButtonColumnButtonText: {
        color: 'white',
    }
});

export default connect(store => ({
    account: store.account,
    geolocation: store.geolocation,
}))(BikeMapList);
