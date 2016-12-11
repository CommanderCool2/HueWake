/**
 * Button component.
 * Button has an icon and a lable.
 */

import React, { Component } from 'react';
import {
 	Text,
 	Image,
	View,
	TouchableOpacity,
  StyleSheet,
} from 'react-native';


export default class MyButton extends Component {

	constructor(props) {
		super(props);
	}

	render() {
		return (
			<TouchableOpacity onPress={this.props.onPressFunction}>
				<View style={this.props.style}>
					<Image style={styles.buttonIcon} source={this.props.icon} />
					<Text style={styles.textM}>{this.props.label}</Text>
				</View>
			</TouchableOpacity>
		);
	}
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	textM: {
		color: '#f8f8ff',
		fontSize: 20,
		textAlign: 'center',
		margin: 10,
	},
  buttonStart: {
		width: 200,
		height: 48,
		backgroundColor: '#3a802d',
		justifyContent: 'center', //vertical
		alignItems: 'center', //horizontal
		flexDirection: 'row',
    elevation: 6,
	},
	buttonStop: {
		width: 200,
		height: 48,
		backgroundColor: '#802d2d',
		justifyContent: 'center', //vertical
		alignItems: 'center', //horizontal
		flexDirection: 'row',
    elevation: 6,
	},
	buttonIcon: {
		width: 32,
		height: 32,
		marginRight: 0,
	},
});
