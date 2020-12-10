import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity
} from 'react-native';

import MapView, { Camera, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MyLocationMapMarker, { Position } from './position/MyLocation';


const obj = [
    {
        id: 1,
        latlng: {
            latitude: 44.837817,
            longitude: -0.567724
        }
    },
    {
        id: 2,
        latlng: {
            latitude: 44.037817,
            longitude: -0.367724
        }
    },
    {
        id: 3,
        latlng: {
            latitude: 44.637817,
            longitude: -0.567724
        }
    },
    {
        id: 4,
        latlng: {
            latitude: 43.837817,
            longitude: -0.567724
        }
    }  
];

const edgePadding = {top: 140, right: 80, bottom: 140, left: 80};


type MapHomeState = {
    initialRegion: any|undefined;
    positionLoad: boolean;
    show_add_form: boolean;
    markers: any|undefined;
}
type Props = {
}

export default class MapHome extends Component<Props, MapHomeState> {
    map: any;
    constructor(props: Props){
        super(props);

        this.state = {
            initialRegion: undefined,
        };
    }


    componentDidMount() {
        this.setState({markers: obj})
    }

    _onMap(map:any){
        this.map = map;
    }

    getCamera(): Promise<Camera> {
        return this.map.getCamera();
    }
    
    animateToCamera(camera: Camera, duration?: number|undefined) {
        this.map.animateCamera(camera, {duration});
    }
    
    public animateToZoom(position: Position | undefined , zoom: number, duration?: number | undefined) {
        this.map && this.map.getCamera()
        .then((camera: { zoom: number; center: Position; }) => {
            camera.zoom = zoom || 13;
            position && (camera.center = position);
            this.animateToCamera(camera, duration);
        })
        .catch((err: any) => console.warn(err));
    }


    _onNewPosition = (position: Position) => {
        this.animateToZoom(position, 13, 850);
        this.setState({initialRegion: position});
    }
    
    _onFirstLocation = (position: Position) => {
        this.animateToZoom(position, 13, 850);
        this.setState({initialRegion: position});
    };



    render() {

        const { initialRegion, positionLoad, show_add_form, markers } = this.state;

        return (
            <View style={styles.container}>
                <MapView
                    provider={ PROVIDER_GOOGLE }
                    ref={map => this._onMap(map)}
                    style={styles.map}
                    showsUserLocation={false}
                    mapType={'standard'}
                >

                    <MyLocationMapMarker
                        key="my_location"
                        onFirstLocation={(position: Position) => this._onFirstLocation(position)}
                        getNewPosition={(position: Position) => this._onNewPosition(position)}
                    />

                </MapView>
            </View>
        );
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    map: {
        flex: 1
    },
});
