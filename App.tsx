/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { Component } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import MapHome from './src/map/MapHome';

interface AppState {
}
interface Props {
}
export default class App extends Component<Props, AppState> {

  constructor(props: Props) {
    super(props);

    this.state = {

    }
  }

  render() {

    const { } = this.state;

    return (
      <View style={styles.container}>
        <MapHome />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2'
  }
});

