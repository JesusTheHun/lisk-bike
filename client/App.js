import React, {Component} from 'react';
import { StyleSheet, Text, View, BackHandler } from 'react-native';
import { createAppContainer } from 'react-navigation';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/es/integration/react';
import { configureStore } from './config/store';

import { RootStack } from './config/router';

const AppContainer = createAppContainer(RootStack);

const { persistor, store } = configureStore();

export default class App extends Component {
  componentDidMount() {
      BackHandler.addEventListener('hardwareBackPress', () => {
      return true;
    });
  }

  componentWillUnmount() {
      BackHandler.removeEventListener('hardwareBackPress', () => {
      return true;
    });
  }

  render() {
    return (
        <Provider store={store}>
          <PersistGate persistor={persistor}>
            <AppContainer />
          </PersistGate>
        </Provider>
    );
  }
}

