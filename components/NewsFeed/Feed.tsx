import React, { useEffect, useReducer } from 'react'
import { View, Button, Text, StyleSheet, Image, Alert, ScrollView, FlatList, TouchableHighlight, Dimensions } from "react-native";
import { NavigationContainer } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { createNativeStackNavigator } from "react-native-screens/native-stack";
import { useState } from 'react';
import { Input } from 'react-native-elements';
import * as ImagePicker from 'expo-image-picker';
import { CheckBox, Overlay } from 'react-native-elements';
import Post from './Post';
import Comments from './Comments';
import { MyProfile } from '../Profile/Profile';
import { Session } from '@supabase/supabase-js';
import { SportsProfile } from '../Profile/SportsProfile';
import { container } from '../Style/Styles';
import { EditProfile } from '../Profile/EditProfile';
import AddSport from '../Profile/AddSport';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import {useHeaderHeight} from '@react-navigation/elements';

const Stack = createNativeStackNavigator();
const dimensions = Dimensions.get('window');
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
  const [currUser, setCurrUser] = useState("");
  const [currUserPostIDs, setCurrUserPostIDs] = useState([]);
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

  const getCurrUser = async () => {
    const { data, error } = await supabase.from("profiles")
      .select("username")
      .match({ id: supabase.auth.user()?.id }).single();
    if (data) {
      setCurrUser(data.username);
      return data.username;
    }
    if (error) throw error;
  }

  const toggleCheck = () => {
    setToggleCheckBox(!toggleCheckBox)
    console.log(toggleCheckBox)
  }

  async function postImage() {
    if (!formData) {
      Alert.alert("please choose an image");
    }
    let path = "public/" + fileName;
    let { data, error } = await supabase.storage.from('images').upload(path, formData);
    let { data: publicURL } = await supabase.storage.from('images').getPublicUrl(path);
    if (data) {
      const updates = {
        uuid: supabase.auth.session()?.user.id,
        caption: caption,
        filepath: path,
        username: currUser == "" ? await getCurrUser() : currUser,
        created_at: new Date(),
        filepublicURL: publicURL?.publicURL,
        isPrivate: toggleCheckBox
      }
      let { data, error } = await supabase.from("image_posts").insert(updates).single();
      let newPostID = data.id;
      console.log(data);
      if (!error) {
        let { data, error } = await supabase.from("profiles").select("post_ids").match({ id: supabase.auth.session()?.user.id }).single();
        if (data) {
          let newPostIDs = data.post_ids ? [...data.post_ids, newPostID] : [newPostID];
          let { error } = await supabase.from("profiles").update({ post_ids: newPostIDs }).match({ id: supabase.auth.session()?.user.id });
          if (error) console.log(error);
        }
      }
    }
    props.navigation.goBack();
  }

  return (
    <View>
      <View>
        <Image style={[styles.profileImage, { height: dimensions.width, width: dimensions.width }]} source={{ uri: image || "https://i.stack.imgur.com/l60Hf.png" }} />
        <Input label="Caption" value={caption} placeholder="Type your caption here"
          autoCompleteType={undefined} onChangeText={(text) => setCaption(text)} />
      </View>
      <View style={{ marginHorizontal: 10, marginBottom:10 }}>
        <Button title='Choose Photo/Video from Library' onPress={() => uploadImage('library')} />
      </View>
      <View style={{  marginHorizontal: 10 }}>
        <Button title='Take a Photo/Video' onPress={() => uploadImage('camera')} />
      </View>
      <View style={{  marginHorizontal: 10 }}>
        <CheckBox title="Private Post? (Only your friends can see)" checked={toggleCheckBox} onPress={() => { toggleCheck() }} />
      </View>
      <View style={{ marginHorizontal: 10 }}>
        <Button title='Post' onPress={() => postImage()} />
      </View>
    </View>
  )
}

export function NewsFeed({ navigation, route }) {
  const [feedPosts, setFeedPosts] = useState<Object[]>([{}]);
  const [currUser, setCurrUser] = useState("");
  const [visible, setVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Object | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [friendList, setFriendList] = useState<Object[]>([]);
  const tabBarHeight = useBottomTabBarHeight();
  const topBarHeight = useHeaderHeight();

  useEffect(() => {
    getAllPosts();
    getFriendList();
    const unsubscribe = navigation.addListener('focus', async () => {
      await getAllPosts();
      await getFriendList();
    });
    return unsubscribe;
  }, [navigation]);

  const showOverlay = (item) => {
    if (item.uuid == supabase.auth.session()?.user.id) {
      setVisible(true);
      setSelectedPost(item);
    }
  }

  const getFriendList = async () => {
    const user = supabase.auth.user()
    let { data, error } = await supabase.from("profiles").select("friend_list").match({ id: user.id }).single()
    if (error) throw error
    setFriendList(data.friend_list)
    console.log(friendList)
  }

  const DeletePost = async () => {
    if (!selectedPost) return;
    let { data, error } = await supabase.from("image_posts").delete().match({ id: selectedPost.id });
    console.log(error);
    if (!error) {
      let { data, error } = await supabase.storage.from('images').remove([selectedPost.filepath]);
      console.log(data);
      setSelectedPost(null);
      await getAllPosts();
    }
    setVisible(false);
  }

  const getAllPosts = async () => {
    const { data, error } = await supabase
      .from('image_posts')
      .select('id, caption, filepath, uuid, username, mediatype, comments, filepublicURL, isPrivate')
    if (error) {
      throw error;
    }
    data.reverse();
    if (route.params.viewOwnPost) {
      let feedData = data.filter((post) => {
        return post.uuid == supabase.auth.user().id
      })
      setFeedPosts(feedData)
    } else {
      setFeedPosts(data);
    }
  }

  return (
    <View>
      <View>
        <Overlay isVisible={visible} onBackdropPress={() => setVisible(false)}>
          <View style={{ paddingBottom: 10 }}>
            <Text>Do you want to delete this post?</Text>
          </View>
          <View style={{ paddingBottom: 10 }}><Button title="Yes" onPress={() => DeletePost()} /></View>
          <View style={{ paddingBottom: 10 }}><Button title="No" onPress={() => setVisible(false)} /></View>

        </Overlay>
        <View style={{margin:10}}>
          {route.params.viewOwnPost || <Button title="Create Post" onPress={() => navigation.navigate("Add Post", { currUser: currUser })} />}
        </View>
        {!feedPosts.length && route.params.viewOwnPost && <View style={{ height: dimensions.height - 200, alignItems: "center", justifyContent: "center" }}>
          <Text>You have not posted anything yet!</Text>
          <TouchableHighlight underlayColor="grey" onPress={()=>{navigation.navigate("Feed")}}><Text style={{color:"blue"}}>Head over to Feed to post your first image!</Text></TouchableHighlight>
        </View>}

      </View>
      <FlatList
        style={{ height: dimensions.height - tabBarHeight-topBarHeight-130}}
        data={feedPosts}
        numColumns={1}
        horizontal={false}
        renderItem={({ item, index }) => (
          <TouchableHighlight underlayColor="grey" key={index} onLongPress={() => showOverlay(item)} style={[container.horizontal, { alignItems: 'center', paddingBottom: 10 }]}>
            {route.params.viewOwnPost && item.uuid == supabase.auth.session()?.user.id ? <Post route={{ params: { item: item, currUser: currUser } }} navigation={navigation} /> :
              !route.params.viewOwnPost ? (!item.isPrivate ? <Post route={{ params: { item: item, currUser: currUser } }} navigation={navigation} />
                : ((item.uuid == supabase.auth.session()?.user.id || friendList.filter((item) => { return item.userID == supabase.auth.session()?.user.id }).length)) ? <Post route={{ params: { item: item, currUser: currUser } }} navigation={navigation} /> : <View></View>) : <View></View>}
          </TouchableHighlight>
        )}
      />

    </View>
  )
}



export function FeedStack({ navigation }) {
  return (
    <Stack.Navigator>
      <Stack.Screen name="News Feed" component={NewsFeed} initialParams={{ viewOwnPost: false }} />
      <Stack.Screen name="Add Post" component={AddPost} />
      <Stack.Screen name="Comments" component={Comments} />
      <Stack.Screen name="User Profile" component={MyProfile} initialParams={{ visitor: true }} />
      <Stack.Screen name="User Sport Interests" component={SportsProfile} />
      <Stack.Screen name="Edit Profile" component={EditProfile} />
      <Stack.Screen name="My Posts" component={NewsFeed} />
      <Stack.Screen name="Add Sports" component={AddSport} />
      <Stack.Screen name="Sports Interests" component={SportsProfile} />
    </Stack.Navigator>
  )
}