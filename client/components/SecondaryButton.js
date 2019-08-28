

import React, {PureComponent} from 'react';
import {StyleSheet, Text, TouchableHighlight} from 'react-native';
import {env} from '../config/env';
import { func, string, any } from 'prop-types';

class SecondaryButton extends PureComponent {

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
            <Text style={styles.buttonText}>Change account</Text>
        </TouchableHighlight>
    }
}

const styles = StyleSheet.create({
    buttonBox: {
        backgroundColor: env.secondaryColor,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 2,
        borderWidth: 1,
    },
    buttonText: {
        color: '#000',
        textTransform: 'uppercase',
    },
});

export { SecondaryButton }
