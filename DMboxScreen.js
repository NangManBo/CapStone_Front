import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { AntDesign } from '@expo/vector-icons';
import { styles } from './styles';
import { Entypo } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import axios from 'axios';
import moment from 'moment';

export const DMboxScreen = ({ navigation, route }) => {
  const [messages, setMessages] = useState([]);
  const {
    userId,
    isLoggedIn,
    jwtToken,
    nickname,
    updateDM2,
  } = route.params;

  const [messageId1, setMessageId] = useState('');

  const unreadMessageCount =
    route.params.unreadMessageCount;
  // const [updateDM, setUpdateDM] = useState(
  //   route.params.updateDM
  // );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          'https://port-0-capstone-project-gj8u2llon19kg3.sel5.cloudtype.app/message/read/all/' +
            nickname,
          {
            headers: {
              'AUTH-TOKEN': jwtToken,
            },
          }
        );

        if (response.status === 200) {
          const messagesData = response.data;

          const formattedMessages = messagesData.map(
            (message) => ({
              username: message.sender,
              time: moment(message.sendTime).format(
                'YYYY-MM-DD HH:mm'
              ),
              title: message.content,
              isRead: message.readStatus,
              messageId1: message.messageId,
              commentId: message.commentId || null,
            })
          );

          setMessages(formattedMessages);
        } else {
          console.error(
            'Failed to fetch messages:',
            response.status,
            response.data
          );
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    // Call the fetchData function to fetch messages when the component mounts
    fetchData();
  }, [updateDM2]);

  const handleItemClick = async (index) => {
    const selectedMessage = messages[index];
    const updatedMessages = [...messages];

    // Fetch the message by messageId (Long 타입으로 전달)
    try {
      const messageResponse = await axios.get(
        'https://port-0-capstone-project-gj8u2llon19kg3.sel5.cloudtype.app/message/read/' +
          selectedMessage.messageId1,
        {
          headers: {
            'AUTH-TOKEN': jwtToken,
          },
        }
      );

      if (messageResponse.status === 200) {
        // Update the message with readStatus set to true
        const updatedMessage = messageResponse.data;
        updatedMessage.readStatus = true;

        console.log(messageResponse.data);

        // Update the local state to mark the message as read
        updatedMessages[index].isRead = true;
        setMessages(updatedMessages);

        // Set the messageId after the message is marked as read
        setMessageId(selectedMessage.messageId1);

        // Navigate to DMScreen with the selected message
        navigation.navigate('DMScreen', {
          isLoggedIn,
          userId,
          nickname,
          jwtToken,
          messageId1, // messageId를 Long 타입으로 유지
          item: selectedMessage,
          unreadMessageCount: unreadMessageCount,
          updateDM2: updateDM2 + 1,
        });
      } else {
        console.error(
          'Error fetching message:',
          messageResponse.data
        );
      }
    } catch (error) {
      console.error(
        'Error marking message as read:',
        error
      );
    }
    console.log('DMScrenn으로 간다~ : ', updateDM2);
  };
  const ha = () => {
    navigation.navigate('HomeScreen', {
      isLoggedIn: true,
      userId,
      nickname,
      jwtToken,
      updateDM2: updateDM2 + 1,
    });
    console.log('Home으로 간다~ : ', updateDM2);
  };
  return (
    <View style={styles.main_page}>
      <View style={styles.main_Row}>
        <View style={styles.back_view}>
          <TouchableOpacity onPress={ha}>
            <AntDesign
              name="arrowleft"
              size={24}
              color="black"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.back_title_view}>
          <Text style={styles.back_text}>내 쪽지함</Text>
        </View>
        <View style={styles.DMboxScreen_Btn_View}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('DMSendScreen', {
                isLoggedIn: true,
                userId,
                nickname,
                jwtToken,
                unreadMessageCount, // 숫자를 DMboxScreen으로 전달
                updateDM2: updateDM2 + 1,
              })
            }
          >
            <Entypo name="pencil" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView style={styles.DMboxScreen_DM_ScrollView}>
        {messages.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleItemClick(index)}
          >
            <View
              style={[
                styles.DMboxScreen_DM_View,
                {
                  backgroundColor: item.isRead
                    ? 'white'
                    : '#FFE5A6',
                },
              ]}
            >
              <View
                style={styles.DMboxScreen_DM_inner_View}
              >
                <View
                  style={styles.DMboxScreen_DM_Name_View}
                >
                  <Text
                    style={styles.DMboxScreen_DM_Name_Text}
                  >
                    {item.username}
                  </Text>
                </View>
                <View
                  style={styles.DMboxScreen_DM_Time_View}
                >
                  <Text
                    style={styles.DMboxScreen_DM_Time_Text}
                  >
                    {item.time}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};
