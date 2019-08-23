import React from 'react';
import { Image } from 'react-native';
import {
    createDrawerNavigator,
    createBottomTabNavigator,
    createStackNavigator,
    createSwitchNavigator,
} from 'react-navigation';

export const AppStack = createStackNavigator(
    {
        // AroundMe: {
        //     screen: AroundMe,
        //     navigationOptions: {
        //         header: null,
        //     },
        // },
    }
);

export const LoginStack = createStackNavigator({
    // Login: {
    //     screen: Login,
    //     navigationOptions: {
    //         header: null,
    //     },
    // },
});

export const RootStack = createSwitchNavigator(
    {
        AppStack: {
            screen: AppStack,
            navigationOptions: {
                header: null,
            },
        },
        LoginStack: {
            screen: LoginStack,
            navigationOptions: {
                header: null,
            },
        },
    },
    {
        initialRouteName: 'LoginStack',
    }
);
