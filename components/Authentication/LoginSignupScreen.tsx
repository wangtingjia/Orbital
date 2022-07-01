import React, { useState } from "react";
import { Text, View, Button } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

export default function LoginSignupScreen({navigation}) {

    return (
        <View>
            <Button title="Sign in" onPress={() => navigation.navigate('Login')}/>
            <Button title="Sign up" onPress={() => navigation.navigate('Registration')}/>
        </View>
    )
}