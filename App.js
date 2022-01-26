
 import React, { Component } from 'react'
 import { StyleSheet, View, Alert, Text, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native'
 import { RNCamera } from 'react-native-camera'


async function delay(n){
  return new Promise(function(resolve){
      setTimeout(resolve,n*1000);
  });
} 

 const PendingView = () => (
  <View
    style={{
      width: '100%',
      height: '100%',
      flex: 1,
      backgroundColor: '#CCF2F4',
      justifyContent: 'center',
      alignItems: 'center',
      // borderRadius: 80,
    }}
  >
    <Text style={{ 
      fontSize: 25,
      color: 'black',
      padding: 50, 
      }} >Waiting...</Text>

    <ActivityIndicator />  
  </View>
);

 class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      timerValue: 'Ready?',
    }
    this.setTimer = this.setTimer.bind(this)
    this.changeValue = this.changeValue.bind(this)
    
  }

  captured = false;
  startTimer = false;
  

  render() {
    const {timerValue} = this.state;
    return (
      <View style={styles.container}>

         <View style={styles.statusBar}>
            <View style={styles.timer}>
                <Text style={{ 
                  fontSize: 25,
                  color: 'black', 
                  }}> {timerValue}</Text>
              </View>
          </View>
        

        <RNCamera
          ref={ref => {
            this.camera = ref;
          }}
          style={styles.preview}
          type={RNCamera.Constants.Type.front}
          flashMode={RNCamera.Constants.FlashMode.off}
          faceDetectionLandmarks={
            RNCamera.Constants.FaceDetection.Landmarks.all
          }
          onFacesDetected={this.facesDetected.bind(this)}
        >

          {({ camera, status, recordAudioPermissionStatus }) => {
            if (status !== 'READY') return <PendingView />;
            return (
              <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center' }}>
                <TouchableOpacity onPress={this.takePicture.bind(this)} style={styles.capture}>
                  <Text style={{ fontSize: 14 }}> SNAP </Text>
                </TouchableOpacity>
              </View>
            );
          }}
        </RNCamera>
      </View>
    );
  }

  changeValue = () => {
    console.log("changeValue")    
    switch (this.state.timerValue) {
      case '3'  : this.setState({ timerValue: '2'}); // this.timerValue = '2';
                  break;
      case '2'  : this.setState({ timerValue: '1'}); // this.timerValue = '1';
                  break;
      case '1'  : this.setState({ timerValue: 'Picture Taken!'}); // this.timerValue = 'null';
                  break;
      default   : this.setState({ timerValue: '3'}); // this.timerValue = '3';
                  console.log('case default?!')
                  break;
    }
    console.log("changeValue:", this.state.timerValue);
  }

  setTimer = () => {
    console.log("setTimer")
    if (this.startTimer) {
      console.log("setTimer: start Timer")
      this.changeValue();
      setTimeout(() => {this.changeValue()}, 1000);
      setTimeout(() => {this.changeValue();}, 2000);
      setTimeout(() => {this.changeValue();}, 3000);
    }
  }

  takePicture = async function() {
    const options = { quality: 0.5, base64: true };
    const data = await this.camera.takePictureAsync(options);
    console.log(data.uri);
    //console.log("camera: ",this.camera.takePictureAsync);
  };

  facesDetected = async function(faces) {
    //console.log('Faces detection success:');
    //console.log("number of faces: ",faces.faces.length);
    //console.log(this.camera);
    if (faces.faces.length == 1){
      //console.log("face yaw angle: ",faces.faces[0].yawAngle);

      //check face angle
      //call this.takePicture if angle is correct
      if (!this.captured && (faces.faces[0].yawAngle<=10 || faces.faces[0].yawAngle>=350)){
        console.log("capture now!");
        this.captured = true;
        const options = { quality: 0.5, base64: true };
        this.startTimer = true;
        this.setTimer();
        this.startTimer = false;
        await delay(3);
        if (faces.faces[0].yawAngle<=10 || faces.faces[0].yawAngle>=350) {
          const data = await this.camera.takePictureAsync(options);
          console.log("face angle: ",faces.faces[0].yawAngle,"\ncaptured at: ",data.uri);
        } else {
          this.captured = false;
          this.setState({ timerValue: 'Cannot Detect Your Face, Try Again!'});
        }
        
      }
    }

  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#CCF2F4',
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
  timer: {
    flex: 0,
    height:  Dimensions.get("window").height * 0.1,
    width: '100%',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    backgroundColor: 'white'
  },
  statusBar: {
    flex: 0,
    height:  0,
    width: '100%',
    // position: 'absolute',
    alignItems: 'center',
    top: Dimensions.get("window").height * 0.04,
    // left: Dimensions.get("window").width * 0.5,
    zIndex: 999,
  }
})

export default App
