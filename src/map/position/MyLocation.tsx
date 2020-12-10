import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Marker } from 'react-native-maps';
import LocationManager from './LocationManager';

const ANCHOR = { x: 0.5, y: 0.5 };


export class Position {
  animatedRegion?: any
  latitude: any;
  longitude: any;
  constructor(latitude:any, longitude:any) {
    this.latitude = latitude;
    this.longitude = longitude;
  }
}

interface GetNewPosition {
  (position: Position) : void;
}

export interface MyLocationProps {
  onFirstLocation?: (position: Position) => void;
  enableHack?: boolean;
  heading?: number;
  showRadius?: boolean;
  coordinate?: Position;
  getNewPosition: GetNewPosition;
}

export interface MyLocationState {
  myPosition?: Position|null;
}

export default class MyLocationMapMarker extends Component<MyLocationProps, MyLocationState> {
  private _mounted: number = 0;
  private _onPosition = (position: Position) => {
    // console.log('get new position from MyLocationMarker', position);
    this.setState({myPosition: position});
    this.props.getNewPosition(position);
  };

  constructor(props: MyLocationProps) {
    super(props);
    this.state = { myPosition: null };
  }

  componentDidMount() {
    const id = Math.floor(Math.random() * 10000);
    this._mounted = id;
    LocationManager.instance.addListener("position", this._onPosition);
    LocationManager.instance.start();

    LocationManager.instance.getCurrentPosition()
    .then(coordinates => {
      if(this._mounted == id && this.props.onFirstLocation) {
        this.props.onFirstLocation(coordinates);
        this._onPosition(coordinates);
        this._mounted = 0;
        // console.log('get first position from MyLocationMarker', coordinates);
      }
    }).catch(err => console.warn("oops", err));
  }

  componentWillUnmount() {
    this._mounted = 0;
    LocationManager.instance.stop();
    LocationManager.instance.removeListener("position", this._onPosition);
  }

  render() {
    let { heading, coordinate } = this.props;
    if (!coordinate) {
      const { myPosition } = this.state;
      if (!myPosition) return null;
      coordinate = myPosition;
      heading = myPosition.heading;
    }

    const rotate = (typeof heading === 'number' && heading >= 0) ? `${heading}deg` : null;

    return (
      <View key="my_position_marker">
        <Marker
          anchor={ANCHOR}
          style={styles.mapMarker}
          {...this.props}
          coordinate={coordinate}
          flat={true}
        >
          <View style={styles.container}>
            <View style={styles.markerHalo} />
            {rotate &&
              <View style={[styles.heading, { transform: [{ rotate }] }]}>
                <View style={styles.headingPointer} />
              </View>
            }
            <View style={styles.marker}>
              <Text style={{ width: 0, height: 0 }}>
                {this.props.enableHack && rotate}
              </Text>
            </View>
          </View>
          {this.props.children}
        </Marker>
      </View>
    );
  }
}

const SIZE = 16;
const HALO_RADIUS = 10;
const ARROW_SIZE = 7;
const ARROW_DISTANCE = 2;
const HALO_SIZE = SIZE + HALO_RADIUS;
const HEADING_BOX_SIZE = HALO_SIZE + ARROW_SIZE + ARROW_DISTANCE;

const styles = StyleSheet.create({
  mapMarker: {
    zIndex: 1000,
  },
  // The container is necessary to protect the markerHalo shadow from clipping
  container: {
    width: HEADING_BOX_SIZE,
    height: HEADING_BOX_SIZE,
  },
  heading: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: HEADING_BOX_SIZE,
    height: HEADING_BOX_SIZE,
    alignItems: 'center',
  },
  headingPointer: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 0,
    borderRightWidth: ARROW_SIZE * 0.75,
    borderBottomWidth: ARROW_SIZE,
    borderLeftWidth: ARROW_SIZE * 0.75,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: "white",
    borderLeftColor: 'transparent',
  },
  markerHalo: {
    position: 'absolute',
    backgroundColor: "rgba(255, 255, 255, .4)",
    top: 0,
    left: 0,
    width: HALO_SIZE,
    height: HALO_SIZE,
    borderRadius: Math.ceil(HALO_SIZE / 2),
    margin: (HEADING_BOX_SIZE - HALO_SIZE) / 2,
    shadowColor: "white",
    shadowOpacity: 0.25,
    shadowRadius: 2,
    shadowOffset: {
      height: 0,
      width: 0,
    },
  },
  marker: {
    justifyContent: 'center',
    backgroundColor: "white",
    width: SIZE,
    height: SIZE,
    borderRadius: Math.ceil(SIZE / 2),
    margin: (HEADING_BOX_SIZE - SIZE) / 2,
  },
});