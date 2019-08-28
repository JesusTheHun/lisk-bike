import React from 'react';
import { Image } from 'react-native';
import {
    createStackNavigator,
} from 'react-navigation';

import BikeMap from '../screens/BikeMap';
import SignIn from '../screens/SignIn';
import Rent from '../screens/Rent';
import Account from '../screens/Account';

export const RootStack = createStackNavigator(
    {
        BikeMap: {
            screen: BikeMap,
            navigationOptions: {
                header: null,
            },
        },
        Account: {
            screen: Account,
        },
        SignIn: {
            screen: SignIn,
        },
        Rent: {
            screen: Rent,
        },
    }
);
