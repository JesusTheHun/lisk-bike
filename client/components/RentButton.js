

import React, {PureComponent} from 'react';
import {StyleSheet, Text, TouchableHighlight} from 'react-native';
import {env} from '../config/env';
import { func, string, any } from 'prop-types';

class RentButton extends PureComponent {

    static propTypes = {
        onPress: func.isRequired,
        label: string.isRequired,
        style: any,
    };

    render() {

        const buttonStyles = [styles.buttonBox];

        if (this.props.style) {
            buttonStyles.push(this.props.style);
        }

        return <TouchableHighlight onPress={this.props.onPress} style={buttonStyles}>
            <Text style={styles.buttonText}>{this.props.label}</Text>
        </TouchableHighlight>
    }
}

const styles = StyleSheet.create({
    buttonBox: {
        backgroundColor: env.primaryColor,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 2,

        padding: 3,

        shadowColor: "#000",
        shadowOffset: {
            width: -2,
            height: 4,
        },
        shadowOpacity: 0.32,
        shadowRadius: 2.46,

        elevation: 4,
    },
    buttonText: {
        color: '#FFF',
        textTransform: 'uppercase',
        fontSize: 12,
    },
});

export { RentButton }
