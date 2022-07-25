import React, { useState, useEffect } from 'react'
import { Alert, StyleSheet, View } from 'react-native'
import { supabase } from '../../lib/supabase'
import { Button, Input } from 'react-native-elements'

export default function Registration({navigation}) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [password2, setPassword2] = useState('')
    const [loading, setLoading] = useState(false)

    async function checkEmailExistence(){
        let { data, error, status} = await supabase
        .from("users")
        .select("email")
        .eq("email",email)
        .single();

        if (error && status !== 406) {
            throw error;
        }
        if (data) {
            return true;
        } else {
            return false;
        }
    }
    
    async function signUpWithEmail() {
        setLoading(true)
        let emailExists = await checkEmailExistence();
        if (emailExists){
            console.log("Email already registered");
            Alert.alert("Email already registered");
            setLoading(false);
            return false;
        }
        let emailDomain = email.slice(-9);
        if (emailDomain != "u.nus.edu"){
            Alert.alert("Please sign up with a NUS email!");
            setLoading(false);
            return false;
        }
        const { user, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        })
        if (error) Alert.alert(error.message)
        setLoading(false)
        return true
    }

    async function checkPasswords() {
        if (password == password2) {
            let success = await signUpWithEmail()
            console.log("Matches")
            if (success) Alert.alert("Registration Successful!", "Check your email for confirmation before you are able to log in",[{text:"Okay",onPress:()=>navigation.goBack()}])
        }
        else {
            alert("Passwords do not match")
        }
    }

    return (
        <View>
            <View style={[styles.verticallySpaced, styles.mt20]}>
                <Input
                    label="Email"
                    leftIcon={{ type: 'font-awesome', name: 'envelope' }}
                    onChangeText={(text) => setEmail(text)}
                    value={email}
                    placeholder="email@address.com"
                    autoCapitalize={'none'} 
                    autoCompleteType={undefined} />
            </View>
            <View style={styles.verticallySpaced}>
                <Input
                    label="Password"
                    leftIcon={{ type: 'font-awesome', name: 'lock' }}
                    onChangeText={(text) => setPassword(text)}
                    value={password}
                    secureTextEntry={true}
                    placeholder="Password"
                    autoCapitalize={'none'} 
                    autoCompleteType={undefined} />
            </View>
            <View style={styles.verticallySpaced}>
                <Input
                    label="Confirm Password"
                    leftIcon={{ type: 'font-awesome', name: 'lock' }}
                    onChangeText={(text) => setPassword2(text)}
                    value={password2}
                    secureTextEntry={true}
                    placeholder="Confirm Password"
                    autoCapitalize={'none'} 
                    autoCompleteType={undefined} />
            </View>
            <View style={[styles.verticallySpaced,{margin:10}]}>
                <Button title="Sign up" disabled={loading} onPress={() => checkPasswords()} />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: 40,
        padding: 12,
    },
    verticallySpaced: {
        paddingTop: 4,
        paddingBottom: 4,
        alignSelf: 'stretch',
    },
    mt20: {
        marginTop: 20,
    },
})