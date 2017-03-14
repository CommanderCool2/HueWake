/**
 * Wake up light.
 */
'use strict';

import React, { Component } from 'react';
import {
 	StyleSheet,
 	Text,
 	Image,
	View,
	Alert,
	TouchableHighlight,
	TouchableWithoutFeedback,
	TouchableOpacity,
	Switch,
	TimePickerAndroid,
  AppState,
  TextInput,
  Picker
} from 'react-native';

//import NumberPicker from './NumberPicker';

//import MyButton from './MyButton';
class MyButton extends Component {

	constructor(props) {
		super(props);
	}

	render() {
		return (
			<TouchableOpacity onPress={this.props.onPressFunction} style={this.props.style}>
					<Image style={styles.buttonIcon} source={this.props.icon} />
					<Text style={styles.textM}>{this.props.label}</Text>
			</TouchableOpacity>
		);
	}
}


export default class WakeUpLight extends Component {

	/**
	 * Initializes all states.
	 */
	constructor(props) {
	    super(props);
	    this.state = {
			WakeUpTimeHours: 6,
			WakeUpTimeMinutes: 5,
      scheduleIsOn: false,
      sunriseDurationBeforeWakeUp: 15
		};
  }

  componentDidMount() {
    fetch('http://192.168.0.21/api/CeyiFspaKI7cxGvtu9uOLJmQgOmAZuoUyMaxwETp/schedules/4')
      .then((response) => response.json())
      .then((responseJson) => {
        //Alert.alert('Innerhalb fetch(): ' + responseJson.status);
        //data = JSON.stringify(responseJson.movies[0]).substring(10,19);
        if(responseJson.status == "enabled") {
          this.setState({scheduleIsOn: true});
        }
        let hours = parseInt(responseJson.localtime.substring(6,8));
        let minutes = parseInt(responseJson.localtime.substring(9,11));
        //Alert.alert(hours + ":" + minutes);
        if(minutes >= 60-this.state.sunriseDurationBeforeWakeUp) {
          hours += 1;
          minutes = minutes + this.state.sunriseDurationBeforeWakeUp - 60;
        }
        else {
          minutes += this.state.sunriseDurationBeforeWakeUp;
        }

        this.setState({WakeUpTimeHours: hours});
        this.setState({WakeUpTimeMinutes: minutes});
      })
      .catch((error) => {
        console.error(error);
      });
  };

	/**
	 * Starts an Android time picker.
	 */
	showPicker = async (stateKey, options) => {
	    try {
	      const {action, minute, hour} = await TimePickerAndroid.open(options);
	      var newState = {};
	      if (action === TimePickerAndroid.timeSetAction) {
	        //newState[stateKey + 'Text'] = _formatTime(hour, minute);
	        this.setState({WakeUpTimeHours: hour});
	        this.setState({WakeUpTimeMinutes: minute});
	      } else if (action === TimePickerAndroid.dismissedAction) {
	        newState[stateKey + 'Text'] = 'dismissed';
	      }
	      this.setState(newState);
	    } catch ({code, message}) {
	      console.warn(`Error in example '${stateKey}': `, message);
	    }
	};


	/**
	 * Returns e.g. '3:05'.
	 */
	formatTime(hour, minute) {
	  return hour + ':' + (minute < 10 ? '0' + minute : minute);
	};

  /**
   * Sets the values of a specific light.
   * id   id of the specific light which should be set up
   * on   state if it's on or off, boolean
   * bri  brightness of the light, number between 0 and 254
   * hue  hue of the light, number between 0 and 65280
   * sat  saturation of the light, number between 0 and 254
   *
  setLight(id, on, bri, hue, sat) {

      /**
       * REST call to put a body with the values to set up.
       *
      fetch('http://192.168.0.21/api/CeyiFspaKI7cxGvtu9uOLJmQgOmAZuoUyMaxwETp/lights/' + id + '/state', {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'on': on,
          'bri': bri,
          'hue': hue,
          'sat': sat,
        })
      });
  }*/

  /**
   * This function is called every time the state of this component (WakeUpLight) is changed
   */
  componentDidUpdate(prevProps, prevState) {
    /**
     * If the switch is used
     */
    if(prevState.scheduleIsOn != this.state.scheduleIsOn) {
      this.setScheduleStatus(4); // TODO: id=4 is set hard in the code. This has to be changed in the future
    }

    else if(prevState.WakeUpTimeHours != this.state.WakeUpTimeHours || prevState.WakeUpTimeMinutes != this.state.WakeUpTimeMinutes) {
      this.setScheduleTime(4); // TODO: id=4 is set hard in the code. This has to be changed in the future
    }

    else if(prevState.sunriseDurationBeforeWakeUp != this.state.sunriseDurationBeforeWakeUp) {
      //Alert.alert("sunriseDurationBeforeWakeUp has changed, is now: " + this.state.sunriseDurationBeforeWakeUp);
      this.setScheduleTime(4); // TODO: id=4 is set hard in the code. This has to be changed in the future
    }
  }

  /**
   * Sets the status of a specific schedule.
   * id   id of the specific schedule which should be set up
   */
  setScheduleStatus(id) {

    let statusToSet = this.state.scheduleIsOn ? 'enabled' : 'disabled';

    /**
     * REST call to change the status of a schedule to enabled/disabled.
     */
    fetch('http://192.168.0.21/api/CeyiFspaKI7cxGvtu9uOLJmQgOmAZuoUyMaxwETp/schedules/' + id, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'status': statusToSet
      })
    });
  };

  /**
   * Sets the time of a specific schedule.
   * id   id of the specific schedule which should be set up
   */
  setScheduleTime(id) {

    let minutes = this.state.WakeUpTimeMinutes;
    let hours = this.state.WakeUpTimeHours;

    if(minutes > this.state.sunriseDurationBeforeWakeUp) {
      minutes = minutes - this.state.sunriseDurationBeforeWakeUp;
    }
    else {
      minutes = 60 + minutes - this.state.sunriseDurationBeforeWakeUp;
      hours == 0 ? hours = 23 : hours -= 1;
    }

    let time = "W124/T" + (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":00";
    /**
     * REST call to change the status of a schedule to enabled/disabled.
     */
    fetch('http://192.168.0.21/api/CeyiFspaKI7cxGvtu9uOLJmQgOmAZuoUyMaxwETp/schedules/' + id, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'localtime': time
      })
    });
  };




	/**
	 * Renders the UI components.
	 * Returns the same result each time it's invoked,
	 * and it does not read from or write to the DOM
	 * or otherwise interact with the browser (e.g., by using setTimeout).
	 * If you need to interact with the browser,
	 * perform your work in componentDidMount().
	 */
	render() {

    return (
		<View style={styles.container}>

    <View style={{height: 50}}></View>

			<Text style={styles.textS}>Time you want to wake up</Text>

			<TouchableWithoutFeedback
				onPress={this.showPicker.bind(this, 'isoFormat', {
				hour: this.state.WakeUpTimeHours,
				minute: this.state.WakeUpTimeMinutes,
				is24Hour: true,
			})}>
				<View>
					<Text style={styles.textL}>{this.formatTime(this.state.WakeUpTimeHours, this.state.WakeUpTimeMinutes)}</Text>
				</View>
			</TouchableWithoutFeedback>

      <View style={{height: 150}}></View>

      <Text style={styles.textS}>Sunrise</Text>

      <View style={{height: 5}}></View>

      <Switch
          onValueChange={(value) => this.setState({scheduleIsOn: value})}
          value={this.state.scheduleIsOn} />

      <View style={{height: 20}}></View>

      <Text style={styles.textS}>Minutes sunrise starts before you want to wake up</Text>

          <Picker
              style={styles.picker}
              selectedValue={this.state.sunriseDurationBeforeWakeUp.toString()}
              onValueChange={(value) => this.setState({sunriseDurationBeforeWakeUp: parseInt(value)})}
          >
              <Picker.Item label="0" value="0" />
              <Picker.Item label="5" value="5" />
              <Picker.Item label="10" value="10" />
              <Picker.Item label="15" value="15" />
              <Picker.Item label="20" value="20" />
              <Picker.Item label="25" value="25" />
              <Picker.Item label="30" value="30" />
          </Picker>

		</View>
    );
  }



}


/**
 * Styles
 */
const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center', //vertical
		alignItems: 'center', //horizontal
		backgroundColor: '#455055',
	},
	textL: {
		fontSize: 56,
		color: '#f8f8ff',
    textShadowColor: '#3f3f3f',
    textShadowOffset: {width: 0, height: 6},
    textShadowRadius: 8,
	},
	textM: {
		color: '#f8f8ff',
		fontSize: 20,
		textAlign: 'center',
		margin: 10,
	},
	textS: {
    fontSize: 15,
		color: '#bababf',
	},
  picker: {
    width: 70,
    color: '#f8f8ff',
  },
});
