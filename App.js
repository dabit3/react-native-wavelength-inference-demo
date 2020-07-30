/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  Image,
  Button,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  TextInput
} from 'react-native';

import ImagePicker from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';

// More info on all the options is below in the API Reference... just some common use cases shown here
const options = {
  title: 'Select photo',
  storageOptions: {
    skipBackup: true,
    path: 'images',
  },
}

const { width, height } = Dimensions.get('window')
// const url = "http://34.239.170.102:5000/api/1.0/classify"

const App: () => React$Node = () => {
  const [image, setImage] = React.useState(null)
  const [analyzedImage, setAnalyzedImage] = React.useState(null)
  const [loading, setLoading] = React.useState(false)
  const [base64ImageType, setImageType] = React.useState(null)
  const [error, setError] = React.useState(null)
  const [URL, setUrl] = React.useState('')
  function onChangeText(text) {
    setUrl(text)
  }
  function showPicker() {
    console.log("url: ", URL)
    if (!URL) {
      alert("Please enter a URL")
      return
    }
    ImagePicker.showImagePicker(options, async (response) => {
      console.log('Response = ', response);
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        setLoading(true)
        setError(null)
        setAnalyzedImage(null)
        let mimeType
        const imageType = response.type
        setImageType(imageType)
        if (imageType === 'image/jpeg' || 'image/jpg') {
          mimeType = 'JPEG'
        } else {
          mimeType = 'PNG'
        }
        ImageResizer.createResizedImage(response.uri, width, 400, mimeType, 100, 0, null)
          .then(async resized => {
            const source = { uri: resized.uri };
            setImage(source)
  
            const file = {
              uri: resized.uri,
              type: response.type,
              name: response.origURL
            }

            const formData = new FormData();
            formData.append('file', file)
            
            await fetch(URL, {
              method: 'POST',
              body: formData,
            })
            .then(r => {
              return r.json()
            })
            .then(jsonData => {
              setLoading(false)
              if (jsonData.message !== "OK") {
                setError(jsonData.message)
                setImage(null)
                return
              }
              let imageUri = jsonData.image.substring(2);
              imageUri = imageUri.substring(0, imageUri.length - 1);
              setAnalyzedImage(imageUri)
              setImage(null)
            })
            .catch(err => {
              console.log({ err })
            })
          })
          .catch(err => {
            console.log('error resizing image: ', err)
          });
      }
    });
  }
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Wavelength Inference Demo</Text>
        </View>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContainer}
        >
          <TextInput
            onChangeText={onChangeText}
            value={URL}
            placeholder="Set URL"
            style={styles.input}
          />
          <Button
            onPress={showPicker}
            title="Choose image"
          />
          {
            error && (
              <View>
                <Text>Error: {error}. Try another image...</Text>
              </View>
            )
          }
          {
            image && (
              <Image
                resizeMode="contain"
                style={{
                  width,
                  height: 300
                }}
                source={{ uri: image.uri}}
              />
            )
          }
          {
            loading && (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Rendering image...</Text>
                <ActivityIndicator
                  animating={loading}
                />
              </View>
            )
          }
          {
            analyzedImage && (
              <Image
                resizeMode="contain"
                style={{
                  width,
                  height: 300
                }}
                source={{uri: `data:${base64ImageType};base64,${analyzedImage}`}}
              />
            )
          }
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  input: {
    height: 45,
    padding: 8,
    width,
    backgroundColor: '#ddd'
  },
  titleContainer: {
    paddingVertical: 30,
    backgroundColor: '#0073ff',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    color: 'white'
  },
  scrollView: {
    backgroundColor: 'white',
    height,
  },
  scrollViewContainer: {
    alignItems: 'center'
  },
  loadingContainer: {
    marginVertical: 20,
  },
  loadingText: {
    marginBottom: 10,
    fontSize: 20
  }
});

export default App;
