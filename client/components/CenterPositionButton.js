import React, {Component} from 'react';
import { StyleSheet, View, Image, TouchableOpacity, Dimensions } from 'react-native';

/**
 * CenterPositionButton center the clusteredMap position on the current position
 */
class CenterPositionButton extends Component {

    constructor(props) {
        super(props);
    }

    render() {

        return (
            <TouchableOpacity style={[styles.container, {bottom: bottom}]} onPress={this.props.onPress}>
                <Image style={styles.image} resizeMode='contain' source={require('../assets/centerButton.png')} />
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        height: 30,
        width: 30,
        backgroundColor: 'transparent',
        position: 'absolute',
        right: 15,
        zIndex: 1,
    },
    image: {
        height: 30,
        width: 30,
    },
});

export default CenterPositionButton;
