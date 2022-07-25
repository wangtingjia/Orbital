import { useEffect, useState } from 'react'
import { View, StyleSheet, Button, Text, ScrollView, Alert, TextInput } from "react-native";
import { Input } from "react-native-elements";
import { NavigationContainer } from '@react-navigation/native';
import LoginSignupScreen from '../Authentication/LoginSignupScreen'
import {Session, ApiError} from "@supabase/supabase-js";
import { supabase } from '../../lib/supabase';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import * as ReactDOM from 'react-dom';
import { renderNode } from 'react-native-elements/dist/helpers';

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    verticallySpaced: {
        paddingTop: 5,
        paddingBottom: 5,
        alignSelf: "stretch",
        fontWeight: "bold",
        color: "grey"
    },
    sender_data: {
        paddingTop: 1,
        paddingBottom: 1,
        alignSelf: "stretch",
        fontWeight: "bold",
        borderRadius: 4,
        borderColor: "#172343",
        backgroundColor: "#F5DEB3",
        marginHorizontal: 5,
        marginVertical: 5,
    },
    row_data: {
        paddingTop: 3,
        paddingBottom: 3,
        fontWeight: "bold",
        borderRadius: 4,
        borderColor: "#172343",
        backgroundColor: "#ADD8E6",
        marginHorizontal: 10,
        marginVertical: 10,
        justifyContent: "center",
        alightItems: "center",
        flex: 1
    },
    receiver_data: {
        paddingTop: 1,
        paddingBottom: 1,
        alignSelf: "stretch",
        fontWeight: "bold",
        borderRadius: 4,
        borderColor: "#172343",
        backgroundColor: "#FFC0CB",
        marginHorizontal: 5,
        marginVertical: 5,
    },
    mt20: {
        marginTop: 20,
    },
    bottom: {
        flex: 1
    }
});

export default function PrivateChat ({route, navigation}) {
    const [UserMessage, SetUserMessage] = useState('')
    const [Messages, setMessages] = useState<Object[] | null> ()

    const user = supabase.auth.user();
    if (!user) {
        Alert.alert('no user on session')
        throw(console.error())
    }

    const receiverID = route.params.receiver
    const receiver_name = route.params.name
    const senderID = user.id

    async function sendMessage(sender, receiverID) {
        const new_message = {
            created_at : new Date(),
            sender_id : sender,
            receiver_id : receiverID,
            message : UserMessage
        }
        if (UserMessage == '') {
            Alert.alert("no empty messages")
        }
        else {
            let { error } = await supabase
            .from("messages")
            .upsert(new_message, { returning: "minimal" });
            if (error) {
                throw error;
            }
        }
    }

    async function getMessages(senderID, receiverID) {
        const {data, error} = await supabase
            .from("messages")
            .select("created_at, sender_id, receiver_id, message")
            .or(`and(sender_id.eq.${senderID},receiver_id.eq.${receiverID}),and(sender_id.eq.${receiverID},receiver_id.eq.${senderID})`)
        if (error) {
            throw(error)
        }
        setMessages(data)
    }

    getMessages(senderID, receiverID)

    if (Messages) {
        return (
            <View>
            <ScrollView  contentContainerStyle={{flexGrow: 20}}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 3,
                    paddingBottom: 3,borderRadius: 4,borderColor: "#172343",backgroundColor: "#ADD8E6",marginHorizontal: 10,marginVertical: 10,}}>
                    <Text> { receiver_name }</Text>
                </View>
                    {
                        Messages.map((data, index) => {
                            if (data.sender_id == senderID) {
                                return (
                                    <View style={styles.sender_data} key={index}> 
                                    <Text> You </Text>
                                    <Text> {data.created_at} </Text>
                                    <Text> {data.message} </Text>
                                    </View>
                                )
                            }
                            else {
                                return (
                                    <View style={styles.receiver_data} key={index}> 
                                    <Text> {receiver_name} </Text>
                                    <Text> {data.created_at} </Text>
                                    <Text> {data.message} </Text>
                                    </View>
                                )
                            }
                            
                        })
                    }
            </ScrollView>
            <View style ={{bottom:0, position:'abosolute'}}>
                    <TextInput 
                            style = {{bottom: 0}}
                            placeholder = "your message"
                            value={UserMessage || ""}
                            onChangeText={(text) => SetUserMessage(text)} />
                    <Button
                            title={"Send message"}
                            onPress={() => sendMessage(senderID, receiverID)}
                    />
                    </View>
            </View>
        )
    }
    else {
        return (
            <View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text> send your first message </Text>
                </View>
                <TextInput 
                    style = {{bottom: 0}}
                    placeholder = "your message"
                    value={UserMessage || ""}
                    onChangeText={(text) => SetUserMessage(text)} />
                <Button
                    title={"Send message"}
                    onPress={() => sendMessage(senderID, receiverID)}
                />
            </View>
        )
    }
}