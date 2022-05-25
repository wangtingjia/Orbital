import React from 'react'
import { View, Button, Text } from "react-native";
import { NavigationContainer } from '@react-navigation/native';
import LoginSignupScreen from './LoginSignupScreen'

function HomePage({navigation}){
  function checking(){
    //console.log(this.props.route.params.session)
  }
  return (
    <View>
      <Text>This is our Home Page!!!!</Text>
      <Button title="JustChecking" onPress={() => checking()}/>
    </View>
  )
}

export default HomePage