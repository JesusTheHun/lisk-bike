

import React, {PureComponent} from 'react';
import {StyleSheet, Text, TouchableHighlight} from 'react-native';
import {env} from '../config/env';
import { func, string, any } from 'prop-types';

class PrimaryButton extends PureComponent {

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
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 2,
    },
    buttonText: {
        color: 'white',
        textTransform: 'uppercase',
    },
});

export { PrimaryButton }
