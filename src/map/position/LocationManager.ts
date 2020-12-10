import {
    Platform,
    PermissionsAndroid
  } from 'react-native';
  
  import { EventEmitter2 } from "eventemitter2";
  import isEqual from 'lodash/isEqual';
  import GPSState from 'react-native-gps-state';
  import Geolocation from '@react-native-community/geolocation';
  
  const defaultOption = { enableHighAccuracy: false, timeout: 15000, maximumAge: 20000 };
  const highAccuracyOptions = { enableHighAccuracy: false, timeout: 15000, maximumAge: 20000 };
  
  const timeout = { timeout: 15000 };
  
  const PERMISSION = PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION;
  
  
  export interface RawPosition {
    latitude: number,
    longitude: number,
    heading?: number|null
  }
  
  export default class LocationManager extends EventEmitter2 {
    static instance = new LocationManager();
    private _started: boolean;
    private _watch_id?: number;
    private _granted: boolean;
    private _my_position?: Coordinates;
  
    constructor() {
      super();
  
      this._started = false;
      this._watch_id = undefined;
      this._granted = false;
    }
  
    getCurrentPosition = async(): Promise<Coordinates|undefined> => {
      if (Platform.OS === 'android') {
        const granted = await this._requestPermission();
        if(granted) {
          const position = await this._getCurrentPositionWhenGranted();
          return position;
        }
        throw "not granted";
      } else {
        console.warn("loading for ios location");
        await this.requestAuthorizationIOS();
        return this._getCurrentPositionWhenGranted();
      }
    }
  
    private _getCurrentPositionWhenGranted = async (): Promise<Coordinates|undefined> => {
      var coordinates = undefined;
      try {
        coordinates = await this._getCurrentPositionWithOptions(highAccuracyOptions);
        console.log('Get position :)');
        return coordinates;
      } catch(e) {
        console.warn("get position failed (1)", e);
      }
  
      try {
        coordinates = await this._getCurrentPositionWithOptions(timeout);
        return coordinates;
      } catch(e) {
        console.warn("get position failed (2)", e);
      }
  
      try {
        coordinates = await this._getCurrentPositionWithOptions();
        return coordinates;
      } catch(e) {
        console.warn("get position failed (3)", e);
        throw e;
      }
    }
  
    private _getCurrentPositionWithOptions(options: PositionOptions|undefined = undefined): Promise<Coordinates|undefined> {
      return new Promise<Coordinates|undefined>((resolve: any, reject: any) => {
        Geolocation.getCurrentPosition((position) => {
          if(position.coords) resolve(position.coords);
          else resolve(undefined);
        },
        (error: PositionError) => reject(error),
        options);
      });
    }
  
    requestAuthorizationIOS = async () => {
      await GPSState.getStatus();
      if(GPSState.isAuthorized()) return true;
      const code = await this._requestAuthorizationIOS();
      switch(code) {
        case GPSState.AUTHORIZED_WHENINUSE:
        case GPSState.AUTHORIZED_ALWAYS:
        case GPSState.AUTHORIZED:
          return true;
        default:
          throw "invalid code := " + code;
      }
    }
  
    private _requestAuthorizationIOS = async (): Promise<number> => {
      return new Promise((resolve, reject) => {
        const listener = (code: number) => {
          GPSState.removeListener(listener);
          resolve(code);
        };
        GPSState.addListener(listener);
        GPSState.requestAuthorization(GPSState.AUTHORIZED_WHENINUSE);
      });
    }
  
    getLastPosition = () => this._my_position;
  
    isGranted = () =>this._granted;
  
    start() {
      if(this._started) return false;
      this._started = true;
      this._requestPermission().then(granted => granted && this._watchLocation());
      return true;
    }
  
    checkPermission = async (): Promise<boolean> => {
      if (Platform.OS === 'android')
        return PermissionsAndroid.check(PERMISSION);
      else return true;
    }
  
    private _requestPermission = async (): Promise<boolean> => {
      if (Platform.OS === 'android') {
        var granted = await PermissionsAndroid.check(PERMISSION)
        if(!granted) granted = await PermissionsAndroid.requestPermission(PERMISSION)
        this._granted = granted;
        this.emit("granted", granted);
        return this._granted;
      }
      return true;
    }
  
    stop(): void {
      this._started = false;
      this._watch_id && Geolocation.clearWatch(this._watch_id);
      this._watch_id = undefined;
    }
  
    private _onError(error: any) {
      if(!error) return;
  
      if(1 == error.PERMISSION_DENIED) {
        this._granted = false;
        this.emit("granted", this._granted);
        this.emit("error", "gps");
        this.stop();
      }
    }
  
    openSettings() {
      GPSState.openLocationSettings();
    }
  
    isGPSRestricted(): Promise<boolean> {
      return GPSState.getStatus()
      .then((status: any) => GPSState.RESTRICTED == status);
    }
  
    private _watchLocation(): void {
      // eslint-disable-next-line no-undef
      this._watch_id = Geolocation.watchPosition((position) => {
        this._granted = true;
        const myLastPosition = this._my_position;
        const myPosition = position.coords;
        if (!isEqual(myPosition, myLastPosition)) {
          this._my_position = myPosition;
          this.emit("position", this._my_position);
        }
      }, (error) => {
        this._onError(error);
      }, defaultOption);
    }
  }