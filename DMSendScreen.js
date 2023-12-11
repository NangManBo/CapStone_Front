import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { styles } from './styles';
import axios from 'axios'; // Axios 라이브러리를 임포트

export const DMSendScreen = ({ navigation, route }) => {
  const {
    userId,
    isLoggedIn,
    jwtToken,
    nickname,
    updateDM2,
  } = route.params;

  const [recipientId, setRecipientId] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const unreadMessageCount =
    route.params.unreadMessageCount;
  const handleSendMessage = async () => {
    // Assuming you want to send the message data back to DMboxScreen
    const messageData = {
      sender: nickname,
      receiver: recipientId,
      content: messageContent,
    };
    try {
      const response = await axios.post(
        'https://port-0-capstone-project-gj8u2llon19kg3.sel5.cloudtype.app/message/send',
        messageData,
        {
          headers: {
            'AUTH-TOKEN': jwtToken,
          },
        }
      );

      if (response.status === 201) {
        console.log('메시지 전송 성공:', response.data);
        // 성공적으로 메시지를 보냈을 때 처리할 작업을 추가하세요.
        // 예를 들어, 메시지 전송 성공 알림 등을 표시할 수 있습니다.
      } else {
        console.log('nickname:', nickname);
        console.log('jwtToken:', jwtToken);
        console.error('메시지 전송 실패:', response.data);

        // 오류 처리 코드를 추가하세요.
      }
    } catch (error) {
      console.error('메시지 전송 중 오류:', error);
      // 오류 발생 시 처리할 작업을 추가하세요.
    }
    navigation.navigate('DMboxScreen', {
      isLoggedIn: true,
      userId,
      jwtToken,
      nickname,
      updateDM2: updateDM2 + 1,
    });
  };

  return (
    <View style={styles.main_page1}>
      <View style={styles.main_Row}>
        <View style={styles.back_view}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('DMboxScreen', {
                isLoggedIn: true,
                userId,
                nickname,
                jwtToken,
                unreadMessageCount, // 숫자를 DMboxScreen으로 전달
                updateDM2,
              })
            }
          >
            <AntDesign
              name="arrowleft"
              size={24}
              color="black"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.back_title_view}>
          <Text style={styles.back_text}>쪽지 쓰기</Text>
        </View>
        <View style={styles.send_message_btn_view}>
          <TouchableOpacity onPress={handleSendMessage}>
            <Feather name="send" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.DMSendScreen_view}>
        <View style={styles.DMSendScreen_sendId_View}>
          <Text style={styles.sendId_text}>수신인:</Text>
          <TextInput
            style={styles.sendId_input_box}
            value={recipientId}
            onChangeText={(text) => setRecipientId(text)}
            placeholder="수신인 닉네임을 적어주세요."
          />
        </View>
        <View style={styles.DMSendScreen_content_View}>
          <Text style={styles.content_text}>쪽지 내용</Text>
          <TextInput
            style={styles.content_input_box}
            value={messageContent}
            onChangeText={(text) => setMessageContent(text)}
            placeholder="내용을 입력해주세요."
          />
        </View>
      </View>
    </View>
  );
};
