import React, {Component} from 'react';
import {Dimensions, Keyboard, StatusBar, View, Text, StyleSheet, Button, TextInput, TouchableHighlight, KeyboardAvoidingView} from 'react-native';
import { SafeAreaView } from 'react-navigation'
import {connect} from 'react-redux';
import { validation } from '@liskhq/lisk-passphrase/dist-browser';
import {AccountActions} from '../actions/AccountActions';
import { env } from '../config/env';

class SignIn extends Component {

    static navigationOptions = {
        title: 'Sign in',
    };

    constructor(props) {
        super(props);

        this.state = {
            text: '',
            error: '',
            loading: false,
        }
    }

    useAccount(passphrase) {
        return this.props.dispatch(AccountActions.fetchAccount(passphrase)).then(account => {
            return this.props.dispatch(AccountActions.setAccount(account)).account;
        });
    }

    createAccountAndLogin() {
        this.props.dispatch(AccountActions.createAccount()).then(newAccountCredentials => {
            this.useAccount(newAccountCredentials.passphrase).then(account => {
                this.props.navigation.navigate('Account', { account });
            });
        });
    };

    onChangeText(passphrase) {
        const errors = validation.getPassphraseValidationErrors(passphrase);

        this.setState({
            text: passphrase,
            error: errors[0] ? errors[0].message : '',
        });

        if (errors.length === 0) {
            this.setState({
                loading: true,
            });

            this.useAccount(passphrase).then(() => {
                if (this.props.navigation.getParam('bikeId')) {
                    this.props.navigation.navigate('Rent', {
                        bikeId: this.props.navigation.getParam('bikeId')
                    });

                    return;
                }

                this.props.navigation.navigate('RootStack');
            });
        }
    };

    render() {

        return <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
            <SafeAreaView style={styles.container}>
                <View style={styles.createAccountBox}>
                    <TouchableHighlight
                        onPress={() => this.createAccountAndLogin()}
                    >
                        <Text  style={styles.createAccountText}>Create an account</Text>
                    </TouchableHighlight>
                </View>

                <View style={styles.separatorBox}>
                    <View style={styles.horizontalLine} />
                    <Text style={styles.separatorText}>OR</Text>
                    <View style={styles.horizontalLine} />
                </View>

                <View style={styles.inputPassphraseBox}>
                    <TextInput
                        onChangeText={text => this.onChangeText(text)}
                        value={this.state.text}
                        placeholder={"Account passphrase"}
                        style={styles.inputPassphrase}
                    />
                    <Text style={styles.errorMessage}>{this.state.error}</Text>
                </View>
            </SafeAreaView>
        </KeyboardAvoidingView>;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
    },
    separatorBox: {
        marginHorizontal: 40,
        marginVertical: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    horizontalLine: {
        backgroundColor: '#c4c4c4',
        height: 2,
        flex: 1,
    },
    separatorText: {
        fontSize: 20,
        marginHorizontal: 10,
        color: '#c4c4c4',
    },
    createAccountBox: {
        height: 50,
        justifyContent: 'center',
        marginHorizontal: 40,
        backgroundColor: env.primaryColor,
        padding: 10,
        borderRadius: 2,
    },
    createAccountText: {
        fontSize: 24,
        fontWeight: '300',
        color: 'white',
        textAlign: 'center',
    },
    inputPassphraseBox: {
        marginHorizontal: 40,
    },
    inputPassphrase: {
        borderWidth: 1,
        borderColor: 'rgba(120,120,120,0.4)',
        padding: 10,
        fontSize: 24,
    },
    errorMessage: {
        marginTop: 3,
        color: '#C02B2B',
    }
});

export default connect(store => ({

}))(SignIn);
