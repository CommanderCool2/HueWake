/**
 * Wake up light.
 */
'use strict';

import React, { Component } from 'react';
import {
  AppRegistry,
 	StyleSheet,
 	Text,
 	Image,
	View,
	Alert,
  Button,
	TouchableHighlight,
	TouchableWithoutFeedback,
	TouchableOpacity,
	Switch,
	TimePickerAndroid,
  AppState,
  TextInput,
  Picker,
	DrawerLayoutAndroid,
} from 'react-native';

//import NumberPicker from './NumberPicker';

//import MyButton from './MyButton';
class MyButton extends Component {

	constructor(props) {
		super(props);
	}

	render() {
		return (
			<TouchableOpacity onPress={this.props.onPress} style={this.props.style}>
					<Text style={styles.textButton}>{this.props.label}</Text>
			</TouchableOpacity>
		);
	}
}


export default class HueWake extends Component {

	/**
	 * Initializes all states with default
	 */
	constructor(props) {
	    super(props);
	    this.state = {
			WakeUpTimeHours: 6,
			WakeUpTimeMinutes: 5,
      scheduleIsOn: true,
      sunriseDurationBeforeWakeUp: 15,
			sunriseDurationMinutes: 30,
      MondayIsActive: false,
      TuesdayIsActive: false,
      WednesdayIsActive: false,
      ThursdayIsActive: false,
      FridayIsActive: false,
      SaturdayIsActive: false,
      SundayIsActive: false,
		};
  }

	/**
	 * Initializes state values
	 * Gets data from hue bridge to set up states (WakeUpTimeHours, WakeUpTimeMinutes, scheduleIsOn)
	 */
  componentDidMount() {

		// Get data from schedule (time, schedule status)
    fetch('http://192.168.0.21/api/CeyiFspaKI7cxGvtu9uOLJmQgOmAZuoUyMaxwETp/schedules/4')
      .then((response) => response.json())
      .then((responseJson) => {

        if(responseJson.status == "enabled") {
          this.setState({scheduleIsOn: true});
        }
        // init hours an minutes by parsing the json and setting the states
        let hours = parseInt(responseJson.localtime.substring(6,8));
        let minutes = parseInt(responseJson.localtime.substring(9,11));
        if(minutes >= 60-this.state.sunriseDurationBeforeWakeUp) {
          hours += 1;
          minutes = minutes + this.state.sunriseDurationBeforeWakeUp - 60;
        }
        else {
          minutes += this.state.sunriseDurationBeforeWakeUp;
        }

        this.setState({WakeUpTimeHours: hours});
        this.setState({WakeUpTimeMinutes: minutes});

        // init weekdays by parsing the json and setting the states
        let weekdayCount = parseInt(responseJson.localtime.substring(1,4));

        // the following numbers come from the Philips Hue time format
        // for more information see https://developers.meethue.com/documentation/datatypes-and-time-patterns
        if(weekdayCount >= 64) {
          this.setState({MondayIsActive: true});
          weekdayCount -= 64;
        }
        if(weekdayCount >= 32) {
          this.setState({TuesdayIsActive: true});
          weekdayCount -= 32;
        }
        if(weekdayCount >= 16) {
          this.setState({WednesdayIsActive: true});
          weekdayCount -= 16;
        }
        if(weekdayCount >= 8) {
          this.setState({ThursdayIsActive: true});
          weekdayCount -= 8;
        }
        if(weekdayCount >= 4) {
          this.setState({FridayIsActive: true});
          weekdayCount -= 4;
        }
        if(weekdayCount >= 2) {
          this.setState({SaturdayIsActive: true});
          weekdayCount -= 2;
        }
        if(weekdayCount >= 1) {
          this.setState({SundayIsActive: true});
          weekdayCount -= 1;
        }

      })
      .catch((error) => {
        console.error(error);
      });

			// Get data from rulse (sun rise length)
	    fetch('http://192.168.0.21/api/CeyiFspaKI7cxGvtu9uOLJmQgOmAZuoUyMaxwETp/rules/5')
	      .then((response) => response.json())
	      .then((responseJson) => {

					let time = responseJson.actions[0].body.transitiontime;

					// This must be done because the time on the hue bridge is saved in milliseconds * 10
					time /= 600;

	        this.setState({sunriseDurationMinutes: time});
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
   * This function is called every time the state of this component is changed
   */
  componentDidUpdate(prevProps, prevState) {
    // If the switch is used
    if(prevState.scheduleIsOn != this.state.scheduleIsOn) {
      this.setScheduleStatus(4); // TODO: id=4 is set hard in the code. This has to be changed in the future
    }
		// If time is set up
    else if(prevState.WakeUpTimeHours != this.state.WakeUpTimeHours || prevState.WakeUpTimeMinutes != this.state.WakeUpTimeMinutes) {
      this.setScheduleTime(4); // TODO: id=4 is set hard in the code. This has to be changed in the future
    }
		// If wake up phase is set up
    else if(prevState.sunriseDurationBeforeWakeUp != this.state.sunriseDurationBeforeWakeUp) {
      this.setScheduleTime(4); // TODO: id=4 is set hard in the code. This has to be changed in the future
    }
		// If sunrise duration is set up
    else if(prevState.sunriseDurationMinutes != this.state.sunriseDurationMinutes) {
      this.setRuleActionTransitiontime(5); // TODO: rule id=5 is set hard in the code. This has to be changed in the future
    }
    // If one of the weekydays changed
    else if(prevState.MondayIsActive != this.state.MondayIsActive ||
            prevState.TuesdayIsActive != this.state.TuesdayIsActive ||
            prevState.WednesdayIsActive != this.state.WednesdayIsActive ||
            prevState.ThursdayIsActive != this.state.ThursdayIsActive ||
            prevState.FridayIsActive != this.state.FridayIsActive ||
            prevState.SaturdayIsActive != this.state.SaturdayIsActive ||
            prevState.SundayIsActive != this.state.SundayIsActive) {
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

    // prepare minutes and hours
    let minutes = this.state.WakeUpTimeMinutes;
    let hours = this.state.WakeUpTimeHours;

    if(minutes > this.state.sunriseDurationBeforeWakeUp) {
      minutes = minutes - this.state.sunriseDurationBeforeWakeUp;
    }
    else {
      minutes = 60 + minutes - this.state.sunriseDurationBeforeWakeUp;
      hours == 0 ? hours = 23 : hours -= 1;
    }

    // prepare weekdays, for more information about the Philips Hue time format see https://developers.meethue.com/documentation/datatypes-and-time-patterns
    let weekdayCount = 0; // init an int for the weekday count in hex
    if(this.state.MondayIsActive) { weekdayCount += 64; }
    if(this.state.TuesdayIsActive) { weekdayCount += 32; }
    if(this.state.WednesdayIsActive) { weekdayCount += 16; }
    if(this.state.ThursdayIsActive) { weekdayCount += 8; }
    if(this.state.FridayIsActive) { weekdayCount += 4; }
    if(this.state.SaturdayIsActive) { weekdayCount += 2; }
    if(this.state.SundayIsActive) { weekdayCount += 1; }

    // set everything together to a string
    let time = "W" + weekdayCount.toString() + "/T" + (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":00";
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
	 * Sets the transition time of defined actions.
	 * id   id of the specific schedule which should be set up
	 */
	setRuleActionTransitiontime(id) {

		let timeToSet = this.state.sunriseDurationMinutes * 600;

		/**
		 * REST call to change the transitiontime of a rules action(s).
		 */
		fetch('http://192.168.0.21/api/CeyiFspaKI7cxGvtu9uOLJmQgOmAZuoUyMaxwETp/rules/' + id, {
			method: 'PUT',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				'actions': [{
					"address": "/groups/2/action",
					"method": "PUT",
					"body": {
						"transitiontime": timeToSet,
						"bri": 254
					}
				},
				{
					"address": "/groups/2/action",
					"method": "PUT",
					"body": {
						"transitiontime": timeToSet,
						"ct": 365
					}
				},
				{
					"address": "/sensors/7/state",
					"method": "PUT",
					"body": {
						"flag": false
					}
				},
				{
					"address": "/schedules/5/",
					"method": "PUT",
					"body": {
						"status": "disabled"
					}
				}]

			})
		});
	};

  /**
   * This function is called every time a change is made for the weekday states.
   * In this case, when a weekday button is presed.
   * weekday   weekday state to change (from true to false or from false to true)
   */
  updateWeekdays(weekday) {
    if(weekday == "monday") {
      this.state.MondayIsActive ? this.setState({MondayIsActive: false}) : this.setState({MondayIsActive: true});
    } else if (weekday == "tuesday") {
      this.state.TuesdayIsActive ? this.setState({TuesdayIsActive: false}) : this.setState({TuesdayIsActive: true});
    } else if (weekday == "wednesday") {
      this.state.WednesdayIsActive ? this.setState({WednesdayIsActive: false}) : this.setState({WednesdayIsActive: true});
    } else if (weekday == "thursday") {
      this.state.ThursdayIsActive ? this.setState({ThursdayIsActive: false}) : this.setState({ThursdayIsActive: true});
    } else if (weekday == "friday") {
      this.state.FridayIsActive ? this.setState({FridayIsActive: false}) : this.setState({FridayIsActive: true});
    } else if (weekday == "saturday") {
      this.state.SaturdayIsActive ? this.setState({SaturdayIsActive: false}) : this.setState({SaturdayIsActive: true});
    } else if (weekday == "sunday") {
      this.state.SundayIsActive ? this.setState({SundayIsActive: false}) : this.setState({SundayIsActive: true});
    }
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

    // Sets the button style for each button respecting it's state (active/inactive)
    let mondayButtonStyle = this.state.MondayIsActive ? styles.buttonHighlighted : styles.button;
    let tuesdayButtonStyle = this.state.TuesdayIsActive ? styles.buttonHighlighted : styles.button;
    let wednesdayButtonStyle = this.state.WednesdayIsActive ? styles.buttonHighlighted : styles.button;
    let thursdayButtonStyle = this.state.ThursdayIsActive ? styles.buttonHighlighted : styles.button;
    let fridayButtonStyle = this.state.FridayIsActive ? styles.buttonHighlighted : styles.button;
    let saturdayButtonStyle = this.state.SaturdayIsActive ? styles.buttonHighlighted : styles.button;
    let sundayButtonStyle = this.state.SundayIsActive ? styles.buttonHighlighted : styles.button;

    // Function for the option panel
		let navigationView = (
    	<View style={styles.containerDrawerView}>
				<Text style={styles.textS}>Sunrise</Text>

				<View style={{height: 10}}></View>

				<Switch
						onValueChange={(value) => this.setState({scheduleIsOn: value})}
						value={this.state.scheduleIsOn} />

				<View style={{height: 25}}></View>

				<Text style={styles.textS}>Wake up phase (minutes)</Text>

				<Picker
						style={styles.picker}
						selectedValue={this.state.sunriseDurationBeforeWakeUp.toString()}
						onValueChange={(value) => this.setState({sunriseDurationBeforeWakeUp: parseInt(value)})}>
						<Picker.Item label="0" value="0" />
						<Picker.Item label="5" value="5" />
						<Picker.Item label="10" value="10" />
						<Picker.Item label="15" value="15" />
						<Picker.Item label="20" value="20" />
						<Picker.Item label="25" value="25" />
						<Picker.Item label="30" value="30" />
				</Picker>

				<View style={{height: 20}}></View>

				<Text style={styles.textS}>Sunrise duration (minutes)</Text>

				<Picker
						style={styles.picker}
						selectedValue={this.state.sunriseDurationMinutes.toString()}
						onValueChange={(value) => this.setState({sunriseDurationMinutes: parseInt(value)})}>
						<Picker.Item label="10" value="10" />
						<Picker.Item label="30" value="30" />
						<Picker.Item label="60" value="60" />
				</Picker>

        <View style={{height: 20}}></View>

        <Text style={styles.textS}>Weekdays</Text>

        <View style={{height: 10}}></View>

          <MyButton onPress={() => this.updateWeekdays("monday")} label="Monday" style={mondayButtonStyle} />
          <MyButton onPress={() => this.updateWeekdays("tuesday")} label="Tuesday" style={tuesdayButtonStyle} />
          <MyButton onPress={() => this.updateWeekdays("wednesday")} label="Wednesday" style={wednesdayButtonStyle} />
          <MyButton onPress={() => this.updateWeekdays("thursday")} label="Thursday" style={thursdayButtonStyle} />
          <MyButton onPress={() => this.updateWeekdays("friday")} label="Friday" style={fridayButtonStyle} />
          <MyButton onPress={() => this.updateWeekdays("saturday")} label="Saturday" style={saturdayButtonStyle} />
          <MyButton onPress={() => this.updateWeekdays("sunday")} label="Sunday" style={sundayButtonStyle} />

    	</View>
  	);

    return (
      // Renders the main view
			<DrawerLayoutAndroid
	      drawerWidth={200}
	      drawerPosition={DrawerLayoutAndroid.positions.Left}
	      renderNavigationView={() => navigationView}>

				<View style={styles.containerMainView}>

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
				</View>
			</DrawerLayoutAndroid>
    );
  }



}


/**
 * Styles
 */
const styles = StyleSheet.create({
	containerMainView: {
		flex: 1,
		justifyContent: 'center', //vertical
		alignItems: 'center', //horizontal
		backgroundColor: '#455055',
	},
	containerDrawerView: {
		flex: 1,
		//justifyContent: 'center', //vertical
		alignItems: 'flex-start', //horizontal
		backgroundColor: '#455055',
		padding: 10,
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
  textButton: {
    fontSize: 15,
    color: '#f8f8ff',
    margin: 5,
    textAlign: 'center',
  },
  picker: {
    width: 70,
    color: '#f8f8ff',
  },
  buttonHighlighted: {
    width: 170,
    backgroundColor: '#354045',
  },
  button: {
    width: 170,
    backgroundColor: '#556065',
  },
});

AppRegistry.registerComponent('HueWake', () => HueWake);
