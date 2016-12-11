/**
 * App class
 * Contains the navigator.
 * Holds everything together and cares about the navigation
 * trough different scenes.
 */

import React, { Component } from 'react';
import {
	AppRegistry,
	StyleSheet,
	Text,
	View,
	Navigator,
	TouchableOpacity,
} from 'react-native';

import WakeUpLight from './WakeUpLight';
import NoNavigatorScene from './NoNavigatorScene';

class HueWake extends Component {
  render() {
    return (
      <Navigator
          initialRoute={{id: 'WakeUpLight', name: 'Index'}}
          renderScene={this.renderScene.bind(this)}
          configureScene={(route) => {
            if (route.sceneConfig) {
              return route.sceneConfig;
            }
            return Navigator.SceneConfigs.FloatFromRight;
          }} />
    );
  }

  renderScene(route, navigator) {
    let routeId = route.id;
    if (routeId === 'WakeUpLight') {
      return (
        <WakeUpLight
          navigator={navigator} />
      );
    }
    if (routeId === 'NoNavigatorScene') {
      return (
        <NoNavigatorScene
            navigator={navigator} />
      );
    }
    return this.noRoute(navigator);

  }
  noRoute(navigator) {
    return (
      <View style={{flex: 1, alignItems: 'stretch', justifyContent: 'center'}}>
        <TouchableOpacity style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}
            onPress={() => navigator.pop()}>
          <Text style={{color: 'red', fontWeight: 'bold'}}>Configure the Route in index.android.js in the renderScene</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('HueWake', () => HueWake);
