import React, {Component} from 'react';
import {StyleSheet, View, Alert, Text, TouchableOpacity} from 'react-native';
import {RNCamera} from 'react-native-camera';

const SERVER = 'http://localhost:18080/';

const sendReq = async () => {
  try {
    const res = await fetch(SERVER);
    const jsonRes = await res.text();
    console.log(jsonRes);
  } catch (err) {
    console.log('Err: ', err);
  }
};

const PendingView = () => (
  <View
    style={{
      flex: 1,
      backgroundColor: 'lightgreen',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
    <Text>Waiting</Text>
  </View>
);

class App extends Component {
  captured = false;
  render() {
    return (
      <View style={styles.container}>
        <RNCamera
          ref={ref => {
            this.camera = ref;
          }}
          style={styles.preview}
          type={RNCamera.Constants.Type.back}
          flashMode={RNCamera.Constants.FlashMode.on}
          faceDetectionLandmarks={
            RNCamera.Constants.FaceDetection.Landmarks.all
          }
          onFacesDetected={this.facesDetected.bind(this)}>
          {({camera, status, recordAudioPermissionStatus}) => {
            if (status !== 'READY') return <PendingView />;
            return (
              <View
                style={{
                  flex: 0,
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}>
                <TouchableOpacity
                  onPress={this.takePicture.bind(this)}
                  style={styles.capture}>
                  <Text style={{fontSize: 14}}> SNAP </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => sendReq()}
                  style={styles.capture}>
                  <Text style={{fontSize: 14}}> Fetch </Text>
                </TouchableOpacity>
              </View>
            );
          }}
        </RNCamera>
      </View>
    );
  }

  takePicture = async function () {
    const options = {quality: 0.5, base64: true};
    const data = await this.camera.takePictureAsync(options);
    console.log(data.uri, data.base64 !== undefined);

    try {
      const formData = new FormData();
      formData.append('face_images', {
        name: 'face_image.jpg',
        uri: data.uri,
        type: 'image/jpeg',
      });
      formData.append('eppn', 'example.connect.ust.hk');

      const res = await fetch(`${SERVER}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const jsonRes = await res.json();
      console.log(jsonRes);
    } catch (err) {
      console.log('Err: ', err);
    }

    //console.log('camera: ',this.camera.takePictureAsync);
  };

  facesDetected = async function (faces) {
    //console.log('Faces detection success:');
    //console.log('number of faces: ',faces.faces.length);
    //console.log(this.camera);
    if (faces.faces.length == 1) {
      //console.log('face yaw angle: ',faces.faces[0].yawAngle);

      //check face angle
      //call this.takePicture if angle is correct
      if (
        !this.captured &&
        (faces.faces[0].yawAngle <= 10 || faces.faces[0].yawAngle >= 350)
      ) {
        this.captured = true;
        const options = {quality: 0.5, base64: true};
        const data = await this.camera.takePictureAsync(options);
        console.log('face angle: ', faces.faces[0].yawAngle, '\ncaptured at: ', data.uri);
      }
    }
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
  },
});

export default App;
