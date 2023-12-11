import {
  Text,
  View,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from 'react-native';

import { styles } from './styles';
import { useState, useEffect } from 'react';
import axios from 'axios';

export const LoginScreen = ({ navigation }) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [jwtToken, setToken] = useState(null);
  const [nickname, setNickname] = useState(null);
  const updateDM2 = 1;
  let nick = '';
  let token = '';

  // const setIsLoggedIn = route.params?.setIsLoggedIn;
  // const setUserId = route.params?.setUserId; // 추가: 사용자 ID 업데이트 함수

  const handleLogin = async () => {
    const userData = {
      uid: id,
      password: password,
    };

    try {
      const response = await axios.post(
        'https://port-0-capstone-project-gj8u2llon19kg3.sel5.cloudtype.app/auth/signin',
        userData
      );

      if (response.status === 201) {
        token = response.data.token;
        nick = response.data.nickname;
        console.log('로그인 후 받는 데이터', response.data);
        setIsLoggedIn(true);
        setUserId(id);
        setToken(token);
        setNickname(nick);
        socket = new WebSocket(
          'wss://port-0-capstone-project-gj8u2llon19kg3.sel5.cloudtype.app/test?uid=' +
            userId
        );
        socket.onopen = () => {
          console.log('연결한당');
        };
        console.log('로그인 성공:', response.data);
        console.log('t:', token);
        console.log('n:', nick);
        navigation.navigate('HomeScreen', {
          isLoggedIn: true,
          userId: id,
          jwtToken: token, // jwtToken 전달
          nickname: nick, // nickname 전달
          updateDM2,
        });
      } else {
        console.error('로그인 실패:', response.data);
        alert('Invalid username or password');
      }
    } catch (error) {
      Alert.alert(
        '오류',
        '아이디나 비밀번호를 잘못입력했습니다'
      );
    }
  };
  return (
    <View style={styles.main_page}>
      <View style={styles.login_page_view}>
        <Text style={styles.login_title_text}>
          투표는 DO표
        </Text>
        <TextInput
          placeholder="아이디"
          value={id}
          onChangeText={(text) => setId(text)}
          style={styles.login_inputfield}
          keyboardType="email-address" // 영어 소문자와 숫자만 입력 가능
          autoCapitalize="none" // 자동 대문자 변환 비활성화
        />
        <TextInput
          placeholder="비밀번호"
          value={password}
          onChangeText={(text) => setPassword(text)}
          secureTextEntry={true}
          style={styles.login_inputfield}
        />
        <TouchableOpacity onPress={handleLogin}>
          <View style={styles.login_page_login_btn_view}>
            <Text style={styles.login_page_login_btn_text}>
              로그인
            </Text>
          </View>
        </TouchableOpacity>

        <View>
          <Text style={styles.login_page_ex}>
            처음 사용하시나요?
          </Text>
        </View>
        <View>
          <Text
            onPress={() =>
              navigation.navigate('SignUpScreen')
            }
            style={styles.login_page_signup_btn}
          >
            회원가입
          </Text>
        </View>
      </View>
    </View>
  );
};
