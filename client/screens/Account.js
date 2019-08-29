import React, {Component} from 'react';
import {Dimensions, Keyboard, StatusBar, View, Text, StyleSheet, TouchableOpacity, Clipboard} from 'react-native';
import { SafeAreaView } from 'react-navigation'
import {connect} from 'react-redux';

class Account extends Component {

    static navigationOptions = {
        title: 'My account',
    };

    constructor(props) {
        super(props);

        this.state = {
            clipboardMessage: 'Click the passphrase to copy it',
        }
    }

    onPropPress = propName => {
        const props = this.getProps();
        const prop = props.find(prop => prop.label === propName);

        Clipboard.setString(prop.value);

        this.setState({
            clipboardMessage: `${prop.label} copied to clipboard !`,
        });
    };

    getProps() {
        const account = this.props.navigation.getParam('account');

        return [
            { label: "Address", value: account.address },
            { label: "Passphrase", value: account.passphrase },
            { label: "Balance", value: account.balance },
        ];
    }

    render() {

        const account = this.props.navigation.getParam('account');

        if (account === undefined) {
            return <SafeAreaView style={styles.emptyState}>
                <Text style={styles.emptyStateText}>Account not found</Text>
            </SafeAreaView>
        }

        const props = this.getProps().filter(prop => !!prop.value);

        return <SafeAreaView style={styles.container}>
            <Text style={styles.clipboardMessage}>{ this.state.clipboardMessage }</Text>

            <View style={styles.propsBox}>
                { props.map(prop => {
                    return <View style={styles.propBox} key={prop.label}>
                        <Text style={styles.propHeader}>{prop.label}</Text>
                        <TouchableOpacity onPress={() => this.onPropPress(prop.label)}>
                            <Text style={styles.prop}>{prop.value}</Text>
                        </TouchableOpacity>
                    </View>
                })}
            </View>

        </SafeAreaView>
    }
}

const styles = StyleSheet.create({
    emptyState: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
    },
    emptyStateText: {

    },
    container: {
        flex: 1,
        flexDirection: 'column',
    },
    clipboardMessage: {
        color: '#56BD73',
        height: 20,
        marginVertical: 20,
        marginHorizontal: 40,
    },
    propsBox: {
        flex: 1,
        justifyContent: 'flex-start',
    },
    propBox: {
        justifyContent: 'center',
        marginHorizontal: 40,
    },
    propHeader: {
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'left',
    },
    prop: {
        marginTop: 15,
        textTransform: 'lowercase',
        fontSize: 14,
        color: '#323232',
    }
});

export default connect(store => ({
    account: store.account,
}))(Account);
