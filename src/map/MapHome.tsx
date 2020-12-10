import React, {Component} from 'react';
import {
    StyleSheet,
    View,
} from 'react-native';
import MapView, { Camera } from 'react-native-maps';
import MyLocationMapMarker, { Position } from './position/MyLocation';



type MapHomeState = {
    initialRegion: any|undefined;
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

        const { } = this.state;

        return (
            <View style={styles.container}>
                <MapView
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
