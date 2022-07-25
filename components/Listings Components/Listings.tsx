import {StyleSheet} from "react-native";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import CreateListing from './CreateListings'
import SearchListing from './SearchListings'
import MyListing from './MyListings'

const Tab = createMaterialTopTabNavigator();

function Listings(){
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