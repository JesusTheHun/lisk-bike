import React from 'react';
import { Image } from 'react-native';
import {
    createDrawerNavigator,
    createBottomTabNavigator,
    createStackNavigator,
    createSwitchNavigator,
} from 'react-navigation';

import {LoginScreen} from '../screens/Login';
import BikeMap from '../screens/BikeMap';

export const RootStack = createStackNavigator(
    {
        BikeMap: {
            screen: BikeMap,
            navigationOptions: {
                header: null,
            },
        },
    }
);
