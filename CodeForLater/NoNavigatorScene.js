/**
 * No navigator scene
 * When there is a problem with the navigator.
 */

import React, { Component } from 'react';
import {
 	AppRegistry,
 	StyleSheet,
 	Text,
	View,
	ScrollView,
	TouchableHighlight,
	TouchableOpacity,
} from 'react-native';

export default class NoNavigatorPage extends Component {
  render() {
    var navigator = this.props.navigator;
    return (
      <View style={{backgroundColor: 'rgba(0,0,0,0.5)', flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <TouchableOpacity
          onPress={() => navigator.pop()}>
          <Text style={{color: 'yellow'}}> I really do not have the navigation bar, point I try, you can not kill non！！</Text>
        </TouchableOpacity>
      </View>
    );
  }
}