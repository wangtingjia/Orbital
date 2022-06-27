import { View, Text, FlatList, TouchableOpacity, TouchableHighlight } from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Button, Input, Overlay } from "react-native-elements";
import { Route } from "react-router-dom";

function Comments(props) {
    const [commentList, setCommentList] = useState<Object[]>([]);
    const [comment, setComment] = useState("");
    const [user, setUser] = useState(props.route.params.user);
    const [updating, setUpdating] = useState(false);
    const [postID, setPostID] = useState(props.route.params.id);
    const [poster, setPoster] = useState(props.route.params.username);
    const [caption, setCaption] = useState(props.route.params.caption);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const fetchComments = async () => {
            const { data, error } = await supabase.from('image_posts').select('comments').match({ id: postID });
            if (data) {
                if (data[0].comments) setCommentList(data[0].comments);
            }
        }

        fetchComments().catch(console.error);
    }, [updating]);

    const getCurrUser = async () => {
        const { data, error } = await supabase.from("profiles").select("username").match({ id: supabase.auth.session()?.user.id }).single();
        if (data) {
            setUser(data.username);
            return data.username;
        }
    }

    const postComment = async () => {
        const newComment = {
            commenterID: supabase.auth.session()?.user.id,
            commenter: user == "" ? await getCurrUser() : user,
            comment: comment,
        };
        let newComments = [...commentList, newComment];
        //console.log(newComments);
        const { data, error } = await supabase.from('image_posts').update({ comments: newComments }).match({ id: postID });
        setUpdating(!updating);
    }

    const deleteComment = async (index) => {
        let newComments = commentList.splice(index, 1);
        console.log(newComments);
        const { data, error } = await supabase.from('image_posts').update({ comments: commentList }).match({ id: postID });
        setVisible(false);
    }

    const toggleOverlay = (uuid) => {
        if (uuid == supabase.auth.session()?.user.id) {
            setVisible(true);
        }
    }

    return (
        <View>
            <Text>{poster} : {caption}</Text>
            <FlatList
                style={{ height: 400 }}
                initialNumToRender={5}
                data={commentList}
                numColumns={1}
                horizontal={false}

                renderItem={({ item, index }) => (
                    <View>
                        <Overlay isVisible={visible} onBackdropPress={() => setVisible(false)}>
                            <Text>Do you want to delete this comment?</Text>
                            <Button title="Yes" onPress={() => deleteComment(index)} />
                            <Button title="No" onPress={() => setVisible(false)} />
                        </Overlay>
                        <TouchableHighlight onLongPress={() => props.navigation.navigate("User Profile", { uuid: item.commenterID, visitor: item.commenterID == supabase.auth.session()?.user.id ? false : true })}><Text>{item.commenter}</Text></TouchableHighlight>
                        <TouchableHighlight onLongPress={() => toggleOverlay(item.commenterID)}><Text>{item.comment}{"\n"}</Text></TouchableHighlight>
                    </View>
                )}
            />
            <View>
                <Input label="Type comment" value={comment} autoCompleteType={undefined} onChangeText={(text) => setComment(text)} />
                <Button title="Post comment" onPress={() => postComment()} />
            </View>
        </View>
    )
}

export default Comments;