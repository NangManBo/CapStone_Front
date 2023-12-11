import React, { useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './styles';
import axios from 'axios';
import { AntDesign } from '@expo/vector-icons';

export const UserAuthenticationScreen = ({ navigation, route }) => {
  const { userId, isLoggedIn, password, jwtToken, nickname, mbti } =
    route.params;
  const [inputPassword, setInputPassword] = useState('');

  const handleAuthenticationPassword = async () => {
    // 비밀번호 입력 필드가 비어있는지 확인
    if (!inputPassword.trim()) {
      Alert.alert('알림', '비밀번호를 입력해주세요.');
      return;
    }
    console.log(userId); // 로깅: userId
    console.log(jwtToken); // 로깅: jwtToken
    try {
      const response = await axios.post(
        'https://port-0-capstone-project-gj8u2llon19kg3.sel5.cloudtype.app/auth/patch/check',
        {
          uid: userId,
          password: inputPassword,
        },
        {
          headers: {
            'AUTH-TOKEN': jwtToken,
          },
        }
      );
      console.log(response.data); // 로깅: 서버 응답
      if (response.status === 200) {
        // changed
        Alert.alert('알림', '본인인증 완료');
        navigation.navigate('ProfileUpdateScreen', {
          isLoggedIn: true,
          userId,
          jwtToken,
          nickname,
          password,
          mbti,
        });
      } else {
        Alert.alert('알림', '본인인증에 실패했습니다');
      }
    } catch (error) {
      console.error('Authentication failed:', error);
      console.error(error.response.data); // 로깅: 에러 응답
      console.error(error.message); // 로깅: 에러 메시지
      Alert.alert(
        '알림',
        '본인인증에 실패했습니다.\n네트워크 상태를 확인해주세요.'
      );
    }
  };

  return (
    <SafeAreaView>
      <View style={styles.header}>
        <View style={styles.header_left}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <AntDesign name="arrowleft" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <View style={styles.header_center}>
          <Text style={styles.back_text}>유저 인증</Text>
        </View>
        <View style={styles.header_right}></View>
      </View>
      <View style={styles.text_container}>
        <Text style={styles.signup_page_label_text}>
          회원정보 수정을 위해서 비밀번호를 한 번 입력해야 합니다.
        </Text>
        <Text style={styles.signup_page_label_text}>
          현재 사용중인 비밀번호를 입력해주세요.
        </Text>
      </View>
      <View style={styles.text_input_container}>
        <View style={styles.input_label_view}>
          <View style={styles.update_password_text}>
            <Text style={styles.update_password_text}>비밀번호</Text>
          </View>
          <TextInput
            placeholder="사용중인 비밀번호 입력"
            style={styles.update_password}
            value={inputPassword}
            onChangeText={setInputPassword} // Update the 'inputPassword' state when the user types
          />
        </View>
      </View>
      <View style={styles.update_button_container}>
        <TouchableOpacity
          style={styles.update_button}
          onPress={handleAuthenticationPassword} // Call the password authentication function when the button is pressed
        >
          <Text style={styles.button_text}>본인인증하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
