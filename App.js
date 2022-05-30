import React, {Component} from 'react';
import {StyleSheet, View, Alert, Text, TouchableOpacity, TextInput, Button} from 'react-native';
import {RNCamera} from 'react-native-camera';

const SERVER = 'http://192.168.0.188:18080/';
const sendReq = async (formData) => {
  try {
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
}
class App extends Component {
  capturing = false;

  
  constructor(props) {
    super(props);
    this.state = {
      eppn: "",
      eppnFixed: false,
      capturedImg: [],
      currentAngle: null,
      formSubmmited: false,
      overlayMsg: ""
    };
  }
  fetchReq = async () => {
    try {
      const res = await fetch(SERVER);
      const jsonRes = await res.text();
      console.log(jsonRes);
    } catch (err) {
      console.log('Err: ', err);
    }
  };

  PendingView = () => (
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
  

  EppnInputView = () => (
    <View
      style={{
        flex: 1,
        backgroundColor: 'lightgreen',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'stretch'
      }}>
      <Text>Please input your eppn:</Text>
      <TextInput
          ref= {(el) => { this.eppn = el; }}
          style={styles.input}
          value={this.state.eppn}
          onChangeText={(eppn)=>{
            this.setState({eppn:eppn});
          }}
          placeholder="example@connect.ust.hk"
        />
      <Button
        title="sumbmit"
        disabled={this.state.eppn=="" || typeof this.state.eppn === "string" && !this.state.eppn.includes("@connect.ust.hk")}
        onPress={() => {
          this.setState({eppnFixed: true});
        }}
      />
      
    </View>
  );

  SuccessView = () => (
    <View
      style={{
        flex: 1,
        backgroundColor: 'lightgreen',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'stretch'
      }}>
      <Text>Your registration request is submitted</Text>
      
    </View>
  );

  isEppn(){
    return str.includes("@connect.ust.hk");
  }

  insertAngles(angles){
    tmp = [];
    angles.forEach(insAngle => {
      tmp.push({
        angle: insAngle%360,
        imgPath: null
      });
    });
    this.setState({
      currentAngle: this.state.currentAngle == null? tmp[0].angle: this.state.currentAngle,
      capturedImg: [...this.state.capturedImg, ...tmp ]
    });
  }

  GenerateReq(){
    let formData = new FormData();
    for(i = 0; i< this.state.capturedImg.length; i++){
      formData.append('face_images', {
        name: `face_image_${i}.jpg`,
        uri: this.state.capturedImg[i].imgPath,
        type: 'image/jpeg',
      });
    }
    formData.append('eppn', this.state.eppn);
    sendReq(formData);
  }

  insertImg(angle, uri){
    tmp = this.state.capturedImg;
    updated = false;
    for(i = 0; i<tmp.length; i++){
      if(tmp[i].angle==angle){
        tmp[i].imgPath = uri;
        updated = true;
        if(i==tmp.length-1){
          this.setState({formSubmmited: true});
          this.GenerateReq();
        }else{  
          this.setState({currentAngle: tmp[i+1].angle})
        }
        break;
      }
    }
    return updated;
  }

  componentDidMount(){
    
    this.insertAngles([0, 30, -30])
  }

  render() {
    return (
      <View style={styles.container}>
        {!this.state.formSubmmited?
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
          onFacesDetected={this.state.eppnFixed? this.facesDetected.bind(this): null}>
          {({camera, status, recordAudioPermissionStatus}) => {
            if (status !== 'READY') return <this.PendingView />;
            else if(!this.state.eppnFixed) return <this.EppnInputView/>;
            return (
              <View
                style={{
                  flex: 0,
                  flexDirection: 'column',
                  justifyContent: 'center',
                  
                }}>
                  <Text style={{ backgroundColor: "rgba(204, 204, 204, 0.8)", color: "black" }}>
                    {this.state.overlayMsg}
                  </Text>
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
                      onPress={() => fetchReq.bind(this)}
                      style={styles.capture}>
                      <Text style={{fontSize: 14}}> Fetch </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              
            );
          }}
        </RNCamera>:
        <this.SuccessView/>}
      </View>
    );
  }

  takePicture = async function () {
    while(this.capturing);
    capturing = true;
    const options = {quality: 0.5, base64: true};
    const data = await this.camera.takePictureAsync(options);
    //console.log(data.uri, data.base64 !== undefined);
    this.insertImg(this.state.currentAngle, data.uri);
    capturing = false;
    

    //console.log('camera: ',this.camera.takePictureAsync);
  };

  facesDetected = async function (faces) {
    //if(!this.state.eppnFixed) return;
    //console.log('Faces detection success:');
    //console.log('number of faces: ',faces.faces.length);
    //console.log(this.camera);
    if (this.capturing) return;
    this.capturing = true;
    if (faces.faces.length == 1 && this.state.currentAngle != null) {
      //console.log('found face');

      //check face angle
      //call this.takePicture if angle is correct
      faceAngle = faces.faces[0].yawAngle<180? faces.faces[0].yawAngle+360: faces.faces[0].yawAngle;
      tmp = this.state.currentAngle<180? this.state.currentAngle+360: this.state.currentAngle;
      if (
        Math.abs((faceAngle-tmp)%360) <= 10
      ) {
        const options = {quality: 0.5, base64: true};
        const data = await this.camera.takePictureAsync(options);
        this.insertImg(this.state.currentAngle, data.uri);
        console.log('face angle: ', faces.faces[0].yawAngle, ' captured');
      }else{
        //console.log('face angle: ', faces.faces[0].yawAngle);
        
        if(faceAngle<tmp){
          console.log("face angle: ", faceAngle, " current angle: ",tmp);
          this.setState({overlayMsg: "Please turn your face to left"});
        }else{
          console.log("face angle: ", faceAngle, " current angle: ",tmp);
          this.setState({overlayMsg: "Please turn your face to right"});
        }
      }
    }
    this.capturing = false;
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
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
});

export default App;
