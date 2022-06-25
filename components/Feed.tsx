import React, { useEffect } from 'react'
import { View, Button, Text, StyleSheet, Image, Alert, ScrollView, FlatList } from "react-native";
import { NavigationContainer } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Input } from 'react-native-elements';
import * as ImagePicker from 'expo-image-picker';
import { CheckBox } from 'react-native-elements';
import RNFetchBlob from 'react-native-fetch-blob';
import Post from './NewsFeed/Post';
import Comments from './NewsFeed/Comments';

const Stack = createNativeStackNavigator();

const styles = StyleSheet.create({
  profileImage: {
    width: 362,
    height: 362,
  },
  row_data: {
    paddingTop: 10,
    paddingBottom: 10,
    alignSelf: "stretch",
    fontWeight: "bold",
    borderRadius: 4,
    borderColor: "#172343",
    backgroundColor: "#F5DEB3",
    marginHorizontal: 15,
    marginVertical: 20,
  },
  container: {
    flex: 1,
  },
});

function AddPost(props) {
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState("");
  const [toggleCheckBox, setToggleCheckBox] = useState(false);
  const [formData, setFormData] = useState<FormData>(new FormData());
  const [fileName, setFileName] = useState("");
  const [currUser, setCurrUser] = useState(props.route.params.currUser);

  async function uploadImage(method) {
    let result = await (method == 'library' ? ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [3, 3],
      quality: 1,
    }) : ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [3, 3],
      quality: 1,
    }));

    console.log(result);

    if (!result.cancelled) {
      const ext = result.uri.substring(result.uri.lastIndexOf(".") + 1, result.uri.length);
      const fileName = Math.random() + '.' + ext;
      var formData = new FormData();
      formData.append("files", {
        uri: result.uri,
        name: fileName,
        type: result.type + '/' + ext,
      })
      setImage(result.uri);
      setFormData(formData);
      setFileName(fileName);
    }
  }

  async function postImage() {
    if (!formData) {
      Alert.alert("please choose an image");
    }
    let path = (toggleCheckBox ? "private/" + supabase.auth.session()?.user.id + "/" : "public/") + fileName;
    let { data, error } = await supabase.storage.from('images').upload(path, formData);
    let { data: publicURL } = await supabase.storage.from('images').getPublicUrl(path);
    if (data) {
      const updates = {
        uuid: supabase.auth.session()?.user.id,
        caption: caption,
        filepath: publicURL?.publicURL,
        username: toggleCheckBox ? "anonymous" : currUser,
        created_at: new Date()
      }
      console.log(currUser);
      let { error } = await supabase.from("image_posts").insert(updates, { returning: "minimal" });
    }
  }

  return (
    <View>
      <View>
        <Image style={styles.profileImage} source={{ uri: image || "https://i.stack.imgur.com/l60Hf.png" }} />
        <Input label="Caption" value={caption}
          autoCompleteType={undefined} onChangeText={(text) => setCaption(text)} />
      </View>
      <View>
        <Button title='Choose Photo from Library' onPress={() => uploadImage('library')} />
      </View>
      <View>
        <Button title='Take a Photo' onPress={() => uploadImage('camera')} />
      </View>
      <View>
        <CheckBox title={"Private Post? (Only your friends can see)"} checked={toggleCheckBox} onPress={() => setToggleCheckBox(!toggleCheckBox)} />
      </View>
      <View>
        <Button title='Post' onPress={() => postImage()} />
      </View>
    </View>
  )
}

function NewsFeed({ navigation }) {
  const [feedPosts, setFeedPosts] = useState<Object[]>([{}]);
  const [currUser, setCurrUser] = useState("");

  useEffect(() => {
    getAllPosts();
    const unsubscribe = navigation.addListener('focus', () => {
      getAllPosts();
      console.log(feedPosts);
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(()=>{
    const getCurrUser = async () => {
      const {data,error} = await supabase.from("profiles").select("username").match({id:supabase.auth.session()?.user.id}).single();
      if (data) setCurrUser(data.username);
    }
    getCurrUser();
  },[])

  async function getAllPosts() {
    const { data, error } = await supabase
      .from('image_posts')
      .select('id, caption, filepath, uuid, username, mediatype, comments')
    if (error) {
      throw error;
    }
    setFeedPosts(data);
  }

  return (
    <View>
      <View>
        <Text></Text>
        <View>
          <Button title="Post" onPress={() => navigation.navigate("Add Post", {currUser: currUser})} />
        </View>
      </View>
      <FlatList
        style={{height:400}}
        data={feedPosts}
        numColumns={1}
        horizontal={false}

        renderItem={({ item, index }) => (
          <View key={index}>
            <Post route={{ params: { item:item, currUser: currUser}}} navigation={navigation} />
          </View>
        )}
      />

    </View>
  )
}



export function FeedStack({ navigation }) {
  return (
    <Stack.Navigator>
      <Stack.Screen name="News Feed" component={NewsFeed} />
      <Stack.Screen name="Add Post" component={AddPost} />
      <Stack.Screen name="Comments" component={Comments}/>
    </Stack.Navigator>
  )
}