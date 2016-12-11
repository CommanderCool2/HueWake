/**
 * Wake up light.
 */

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
  AppState
} from 'react-native';


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
			WakeUpTimeHour: 6,
			WakeUpTimeMinute: 15,
			RoutineRunning: false,
      RoutineTimerID: 0,
      SunIsOnTheRise: false,
		};
  }
	/**
	 * Starts an Android time picker.
	 */
	showPicker = async (stateKey, options) => {
	    try {
	      const {action, minute, hour} = await TimePickerAndroid.open(options);
	      var newState = {};
	      if (action === TimePickerAndroid.timeSetAction) {
	        //newState[stateKey + 'Text'] = _formatTime(hour, minute);
	        this.setState({WakeUpTimeHour: hour});
	        this.setState({WakeUpTimeMinute: minute});
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
	}

  /**
   * Called when start/stop button is pressed.
   * Sets RoutineRunning sate and starts/stops the routine.
   */
	onStartButtonPress() {
		//Alert.alert("Button pressed.");
		if(this.state.RoutineRunning == false) {
      this.startRoutine();
		} else if(this.state.RoutineRunning == true) {
      this.stopRoutine();
		} else {
			Alert.alert("this.state.RoutineRunning was not initialized correctly");
		}
	}

  /**
   * Starts the routine which waits until the set up wake up time is reached,
   * then starts the sunrise.
   */
  startRoutine() {

    /**
     * Set the global routine var to true.
     */
    this.setState({RoutineRunning: true});

    /**
     * Current time in Date format.
     */
    let currentTime = new Date();

    /**
     * Number of milliseconds since January 1, 1970 00:00:00 UTC.
     */
  	let currentTimeInMsSince1970 = Date.now();

    /**
     * Difference between the current time and the wake up time in miliseconds.
     */
    let offsetInMs = 0;

    /**
     * Minutes before the wake up time the sunrise starts.
     */
    let MinutesBeforeWakeUpTimeTheSunriseStarts = 7;

    /**
     * Alarm time in date format.
     */
    let alarmTime = new Date();

    /**
     * Sets the seconds and milliseconds of the alarm to 0 that it goas off
     * exactly at the time set up.
     */
    alarmTime.setSeconds(0);
    alarmTime.setMilliseconds(0);

    /**
     * Sets the minutes and hours of the alarm to the set up values.
     */
    alarmTime.setHours(this.state.WakeUpTimeHour);
    alarmTime.setMinutes(this.state.WakeUpTimeMinute);

    /**
     * Sets the day of the alarm time to tomorrow, if the set up time is tomorrow.
     */
    if (currentTime.getHours() > this.state.WakeUpTimeHour || (currentTime.getHours() == this.state.WakeUpTimeHour && currentTime.getMinutes() > this.state.WakeUpTimeMinute)) {
      alarmTime.setDate(currentTime.getDate() + 1);
    }

    /**
     * Sets the offset between the current time and the alarm time.
     */
    offsetInMs =  alarmTime.getTime() - currentTimeInMsSince1970;
    //TODO: handling when offset = 0 or negative


    offsetInMs - MinutesBeforeWakeUpTimeTheSunriseStarts * 1000;
    /**
     * Starts the timeout until the sunrine begins and sets the timer id
     * so that this timeout can be canceled.
     */
    let tmp = setTimeout(
		    () => { this.startSunrise(0, 10778, 251, 30); },
			offsetInMs
		);

    this.setState({RoutineTimerID: tmp});
  }

  /**
   * Stops the routine.
   */
  stopRoutine() {
    this.setState({RoutineRunning: false});
    clearTimeout(this.state.RoutineTimerID);
    this.stopSunrise();
  }

  /**
   * Starts the sunrise. Therefore, REST calls make the lights slowly brigther.
   * From bri: 0, hue: 10778, sat: 251, ct: 500
   * To bri: 254, hue: 14957, sat: 141, ct: 365
   * Steps: 254
   */
  startSunrise(bri, hue, sat, sunriseDurationInMinutes) {
    //TODO: the handling of the variables bri, sat and hue has to be cleaned up
    // The aim should be dynamically generated steps


    //Increase bri by 1
    bri++;

    //Increase hue by 16,45 and round it to an integer
    let tmpHue = hue + 16.45;
    hue = Math.round(tmpHue);

    //Decrease sat by 0,44 and round it to an integer
    let tmpSat = sat - 0.44;
    sat = Math.round(tmpSat);

    //TODO: if-Abfrage um die limits der Werte bri, hue und sat erweitern
    if(this.state.RoutineRunning == true && 0 <= bri < 255) {
      this.setLight(1, true, bri, hue, sat);
      this.setLight(3, true, bri, hue, sat);
      setTimeout(() => {this.startSunrise(bri, tmpHue, tmpSat, sunriseDurationInMinutes)}, Math.round(sunriseDurationInMinutes*60*1000/254));
    }
  }

  /**
   * Sets the values of a specific light.
   * id   id of the specific light which should be set up
   * on   state if it's on or off, boolean
   * bri  brightness of the light, number between 0 and 254
   * hue  hue of the light, number between 0 and 65280
   * sat  saturation of the light, number between 0 and 254
   */
  setLight(id, on, bri, hue, sat) {

      /**
       * REST call to put a body with the values to set up.
       */
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
  }

  /**
   * Stops the sunrise and turns off the lights.
   */
  stopSunrise() {
    this.setLight(1, false, 254, 14957, 141);
    this.setLight(3, false, 254, 14957, 141);
    //TODO build own function just to turn off the on property
  }

	/**
	 * Renders the UI components.
	 * Returns the same result each time it's invoked,
	 * and it does not read from or write to the DOM
	 * or otherwise interact with the browser (e.g., by using setTimeout).
	 * If you need to interact with the browser,
	 * perform your work in componentDidMount().
	 */
	render() {

	//This block handles the appearance of the button
	let buttonText = '';
	let buttonIcon = null;
	let buttonStyle = null;
	if(this.state.RoutineRunning == false) {
		buttonText = 'Start';
		buttonIcon = require('./images/Icon-Bed-Sleep.png');
		buttonStyle = styles.buttonStart;
	} else if(this.state.RoutineRunning == true) {
		buttonText = 'Stop';
		buttonIcon = require('./images/Icon-Bed-WakeUp.png');
		buttonStyle = styles.buttonStop;
	} else {
		Alert.alert("this.state.RoutineRunning was not initialized correctly");
	}

    return (
		<View style={styles.container}>

			<Text style={styles.textS}>Time you want to wake up</Text>

			<TouchableWithoutFeedback
				onPress={this.showPicker.bind(this, 'isoFormat', {
				hour: this.state.WakeUpTimeHour,
				minute: this.state.WakeUpTimeMinute,
				is24Hour: true,
			})}>
				<View>
					<Text style={styles.textL}>{this.formatTime(this.state.WakeUpTimeHour, this.state.WakeUpTimeMinute)}</Text>
				</View>
			</TouchableWithoutFeedback>

			<View style={{height: 40}}></View>

			<MyButton icon={buttonIcon} label={buttonText} onPressFunction={() => this.onStartButtonPress()} style={buttonStyle} />

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
	buttonStart: {
		width: 150,
		height: 48,
		backgroundColor: '#3a802d',
		justifyContent: 'center', //vertical
		alignItems: 'center', //horizontal
		flexDirection: 'row',
    elevation: 6,
	},
	buttonStop: {
		width: 150,
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
    marginLeft: 8,
	},
});
