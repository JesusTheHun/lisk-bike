

import React, {PureComponent} from 'react';
import {StyleSheet, Text, TouchableOpacity} from 'react-native';
import {env} from '../config/env';
import { func, string, any } from 'prop-types';

class ReturnButton extends PureComponent {

    static propTypes = {
        onPress: func.isRequired,
        label: string.isRequired,
        style: any,
        ... TouchableOpacity.propTypes,
    };

    render() {

        const buttonStyles = [styles.buttonBox];

        if (this.props.style) {
            buttonStyles.push(this.props.style);
        }

        return <TouchableOpacity { ... this.props } onPress={this.props.onPress} style={buttonStyles}>
            <Text style={styles.buttonText}>{this.props.label}</Text>
        </TouchableOpacity>
    }
}

const styles = StyleSheet.create({
    buttonBox: {
        backgroundColor: '#50A060',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 2,
        padding: 3,
    },
    buttonText: {
        color: '#FFF',
        textTransform: 'uppercase',
        fontSize: 12,
    },
});

export { ReturnButton }
