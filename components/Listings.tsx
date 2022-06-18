import { useEffect, useState } from 'react'
import { View, StyleSheet, Button, Text, ScrollView } from "react-native";
import { Input } from "react-native-elements";
import { NavigationContainer } from '@react-navigation/native';
import LoginSignupScreen from './LoginSignupScreen'
import {Session, ApiError} from "@supabase/supabase-js";
import { supabase } from '../lib/supabase';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Select from 'react-select'
import { useUpsert, useSelect } from 'react-supabase';

const Tab = createMaterialTopTabNavigator();

function CreateListing() {
  const [GroupName, setGroupName] = useState('')
  const [Sport, setSport] = useState('')
  const [Description, setDescription] = useState('')

  const [GroupSize, setGroupSize] = useState('0')
  const GroupSizeOptions = [
    {id: '5', name: '0-5'},
    {id: '10', name: '6-10'},
    {id: '15', name: '11-15'},
    {id: '20', name: '16-20'},
    {id: '99', name: 'More than 20'}
  ];
  const Add = GroupSizeOptions.map(Add => Add)
  const handleGroupSizeChange = (e) => console.log((GroupSize[e.target.value]))

  const [isPrivate, setisPrivate] = useState(0)
  const PrivacyOptions = [
    {id: 'isnotprivate', name: 'public'},
    {id: 'isprivate', name: 'private'}
  ];
  const Add2 = PrivacyOptions.map(Add2 => Add2)
  const handlePrivacyChange = (e) => console.log((isPrivate[e.target.value]))

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false)

  async function generateListing({
    GroupName,
    Sport,
    Description,
    GroupSize,
    isPrivate
  }: {
    GroupName: string;
    Sport: string;
    Description: string;
    GroupSize: string;
    isPrivate: string;
  }) {
    try {
      setLoading(true);
      const user = supabase.auth.user();
      if (!user) throw new Error("No user on the session!");
      
      console.log(user.id)

      const updates = {
        user_id: user.id,
        GroupName,
        Sport,
        Description,
        GroupSize,
        isPrivate,
      };

      let { error } = await supabase
        .from("listings")
        .upsert(updates, { returning: "minimal" });

      if (error) {
        throw error;
      }

  } catch (error) {
    alert((error as ApiError).message);
  } finally {
    setLoading(false);
  }
}

  return (
    <ScrollView>
      <View style={styles.verticallySpaced}>
        <Input
          label="Group Name"
          value={GroupName || ""}
          onChangeText={(text) => setGroupName(text)}
          autoCompleteType={undefined} />
      </View>

      <View style={styles.verticallySpaced}>
        <Input
          label="Sport"
          value={Sport || ""}
          onChangeText={(text) => setSport(text)}
          autoCompleteType={undefined} />
      </View>

      <View style={styles.verticallySpaced}>
        <Input
          label="Description of your activity"
          value={Description || ""}
          onChangeText={(text) => setDescription(text)}
          autoCompleteType={undefined} />
      </View>

      <View style={styles.verticallySpaced}>
        <h3> Size of your group </h3>
        <select
          onChange={e => {
            const val = e.target.value.split("**")[0];
            const name = e.target.value.split("**")[1];
            setGroupSize(val);
          }}
        >
          <option value ="" />
          {GroupSizeOptions.map(item => (
            <option value={item.id}> {item.name} </option>
          ))}
        </select>
        <h4>{GroupSize}</h4>
      </View>

      <View style={styles.verticallySpaced}>
        <h3> Privacy settings</h3>
        <select
          onChange={e => {
            const val = e.target.value.split("**")[0];
            const name = e.target.value.split("**")[1];
            setisPrivate(val);
          }}
        >
          <option value ="" />
          {PrivacyOptions.map(item => (
            <option value={item.id}> {item.name} </option>
          ))}
        </select>
        <h4>{isPrivate}</h4>
      </View>

      <View>
        <Button
          title={loading ? "Loading ..." : "Create listing"}
          onPress={() => generateListing({ GroupName, Sport, Description, GroupSize, isPrivate})}
          disabled={loading}
        />
      </View>

    </ScrollView>
  )
}

function SearchListing () {
  return (
    <View>
      <Text> Search for sports activity here </Text> 
    </View>
  )
}

function MyListing () {
  const [myData, setmyData] = useState<any | null> ()

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () =>  {
    const user = supabase.auth.user();
      if (!user) throw new Error("No user on the session!");
  
    const { data, error } = await supabase 
      .from('listings')
      .select('id, user_id, GroupName, Sport, Description')
      .match ({user_id : user.id})
      setmyData(data)
  }

  return (
    <div>
      <Text> Hi </Text>
    </div>
    
  )
}

function Listings(){
  function checking(){
    console.log(supabase.auth.session())
  }
  return (
    <Tab.Navigator> 
      <Tab.Screen name="Initiate activity" component ={CreateListing} />
      <Tab.Screen name="Search activities" component ={SearchListing} />
      <Tab.Screen name="My activities" component={MyListing} />
    </Tab.Navigator>
  )
}

export default Listings

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
    display:'flex',
    flexDirection: 'row',
    flex: 1,
    justifyContent: "space-between"
  },
  mt20: {
      marginTop: 20,
  },
});