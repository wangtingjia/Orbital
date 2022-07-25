import { useEffect, useState } from 'react'
import { View, StyleSheet, Button, Text, ScrollView, Alert, FlatList, Dimensions } from "react-native";
import { Input } from "react-native-elements";
import { Session, ApiError } from "@supabase/supabase-js";
import { supabase } from '../../lib/supabase';


const dimensions = Dimensions.get('window')

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 5,
    paddingBottom: 5,
    alignSelf: "stretch",
    fontWeight: "bold",
    color: "grey"
  },
  row_data: {
    paddingTop: 10,
    paddingBottom: 10,
    alignSelf: "stretch",
    fontWeight: "bold",
    borderRadius: 4,
    borderColor: "#172343",
    backgroundColor: "#F5DEB3",
    marginHorizontal: 5,
    marginVertical: 5,
  },
  mt20: {
    marginTop: 20,
  },
});

export default function SearchListing() {
  const [MyData, setMyData] = useState<Object[] | null>()
  const [MyInput, setMyInput] = useState('')
  const [username, setUsername] = useState("")

  useEffect(() => {
    getUsername()
  }, [])

  async function getUsername() {
    let { data, error } = await supabase.from("profiles").select("username").match({ id: supabase.auth.session()?.user.id }).single()
    setUsername(data.username);
  }

  async function GetListingbyGroupName(input) {
    const { data, error } = await supabase
      .from('listings')
      .select('id, owner_id, GroupName, Sport, Description, isPrivate')
      .match({ GroupName: input })
    if (error) {
      throw error;
    }
    setMyData(data)
  }

  async function GetListingbySport(input) {
    const { data, error } = await supabase
      .from('listings')
      .select('id, owner_id, GroupName, Sport, Description, isPrivate')
      .match({ Sport: input })
    if (error) {
      throw error;
    }
    setMyData(data)
  }

  async function GetAllListing() {
    const { data, error } = await supabase
      .from('listings')
      .select('id, owner_id, GroupName, Sport, Description, isPrivate')
    if (error) {
      throw error;
    }
    setMyData(data)
  }

  async function update_listing(SportIdKey) {
    const user = supabase.auth.user();
    if (!user) throw new Error("No user on the session!");

    let { data, error } = await supabase
      .from('listings')
      .select('id, all_members, members')
      .match({ id: SportIdKey })
      .single()
    if (error) {
      console.log(error)
    }
    else {
      console.log(data)
      let { error } = await supabase
        .from('listings')
        .update({ all_members: [...data.all_members, user.id], members: [...data.members, { uuid: user.id, username: username }] }, { returning: "minimal" })
        .match({ id: SportIdKey })
        .single();

      if (error) {
        throw error;
      }
    }
  }


  async function add_member(SportIdKey) {
    try {
      const user = supabase.auth.user();
      if (!user) throw new Error("No user on the session!");

      const updates = {
        user_id: user.id,
        sport_id: SportIdKey
      };

      let { error } = await supabase
        .from("member_list")
        .upsert(updates, { returning: "minimal" });

      if (error) {
        throw error;
      }

    } catch (error) {
      alert((error as ApiError).message);
    }
  }

  async function sendJoinRequest(SportIdKey, isPrivate) {
    const user = supabase.auth.user()
    let { data, error } = await supabase.from("listings").select("join_requests").match({ id: SportIdKey }).single()
    if (error) throw error
    else {
      let requestExist = data.join_requests.filter((request) => {
        return request.uuid == user.id
      })
      if (requestExist.length) {
        Alert.alert("You have a pending join request, please wait for a response")
        return
      }
      let { error } = await supabase.from("listings").update({ join_requests: [...data.join_requests, { uuid: user.id, username: username, date_requested: new Date() }] }).match({ id: SportIdKey }).single()
      if (error) throw error
    }
    Alert.alert("Join Request Sent")
  }

  function confirm_join(SportIdKey, isPrivate) {
    return (
      Alert.alert(
        "Confirm to join group",
        "Confirm to join group",
        [
          {
            text: "Yes",
            onPress: () => {
              if (isPrivate == 'yes') {
                sendJoinRequest(SportIdKey, isPrivate)
              } else {
                update_listing(SportIdKey)
                add_member(SportIdKey)
              }
            }
          },
          {
            text: "No",
            onPress: () => console.log("cancel join group")
          }
        ]

      )
    )
  }

  async function check_owner(SportIdKey) {
    const user = supabase.auth.user();
    if (!user) throw new Error("No user on the session!");

    const { data, error } = await supabase
      .from('listings')
      .select('id, owner_id')
      .match({ owner_id: user.id, id: SportIdKey })

    if (error) {
      throw (error)
    }
    else {
      return data.length ? true : false
    }
  }

  async function check_membership(SportIdKey, isPrivate) {
    const user = supabase.auth.user();
    if (!user) throw new Error("No user on the session!");

    let IsOwner = await check_owner(SportIdKey)

    const { data, error } = await supabase
      .from('member_list')
      .select('id, user_id, sport_id')
      .match({ sport_id: SportIdKey, user_id: user.id })

    console.log(data)
    if (error) {
      throw error;
    }
    if (IsOwner) {
      alert("error: you are the owner of this group")
    }
    else if (data.length) {
      alert("error: you are in this group")
    }
    else {
      confirm_join(SportIdKey, isPrivate)
    }
  }

  return (
    <View>
      <View style={styles.verticallySpaced}>
        <Input
          label="Search"
          placeholder='Input your search terms'
          value={MyInput || ""}
          onChangeText={(text) => setMyInput(text)}
          autoCompleteType={undefined} />
        <View style={{ marginHorizontal: 10, marginBottom: 5 }}><Button title='Search by groupname' onPress={() => GetListingbyGroupName(MyInput)} /></View>
        <View style={{ marginHorizontal: 10, marginBottom: 5 }}><Button title='Search by sport ' onPress={() => GetListingbySport(MyInput)} /></View>
        <View style={{ marginHorizontal: 10, marginBottom: 5 }}><Button title='Show all listings' onPress={() => GetAllListing()} /></View>
      </View>
      <FlatList horizontal={false} data={MyData} style={{ height: dimensions.height - 400 }} renderItem={({ item, index }) => (
        <View>
          <View style={styles.row_data} key={index}>
            <Text> GroupName: {item.GroupName} </Text>
            <Text> Sport: {item.Sport} </Text>
            <Text> Description: {item.Description}</Text>
            <Text> Private: {item.isPrivate}</Text>
            <View style={{ marginHorizontal: 10 }}><Button title='Join group' onPress={() => check_membership(item.id, item.isPrivate)} /></View>
          </View>
        </View>
      )} />
    </View>
  )
}