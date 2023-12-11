import React, { useEffect, useState } from 'react';
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
import * as ImagePicker from 'expo-image-picker';
import RNPickerSelect from 'react-native-picker-select';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign } from '@expo/vector-icons';

export const ProfileUpdateScreen = ({ navigation, route }) => {
  const { userId, isLoggedIn, nickname, updateDM2, password, jwtToken, mbti } =
    route.params;

  const [newPassword, setNewPassword] = useState('');
  const [newMbti, setNewMbti] = useState('');
  const [newNickname, setNewNickname] = useState('');
  const [currentNickname, setCurrentNickname] = useState(nickname);
  const [selectedImage, setSelectedImage] = useState('');
  // jwtToken을 상태 변수로 관리
  const [jwtToken1, setJwtToken1] = useState(jwtToken);

  const handleImageSelection = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setSelectedImage(uri);

      // 이미지 선택 후 바로 업로드
      let formData = new FormData();
      formData.append('name', 'avatar');
      formData.append('fileData', {
        uri: uri,
        type: 'image/jpeg',
        name: 'upload.jpeg',
      });

      const config = {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      };

      axios
        .post('<IMAGE_UPLOAD_ENDPOINT>', formData, config)
        .then((response) => {
          console.log('upload success', response);
        })
        .catch((error) => {
          console.log('upload error', error);
        });
    }
  };

  const handleChangePassword = async () => {
    const password = {
      password: newPassword,
      uid: userId,
    };
    if (newPassword === '') {
      Alert.alert('알림', '비밀번호를 입력해주세요');
      return;
    }
    console.log(password);
    try {
      // Call your API or service to change the password
      const response = await axios.patch(
        'https://port-0-capstone-project-gj8u2llon19kg3.sel5.cloudtype.app/auth/patch/' +
          userId,
        password,
        {
          headers: {
            'AUTH-TOKEN': jwtToken1,
          },
        }
      );

      if (response.status === 200) {
        console.log(response.data);
        setNewPassword(''); // 성공한 후 입력 필드를 초기화
        // Assuming the API returns an object with a 'success' property
        Alert.alert('알림', '비밀번호 변경 완료');
      } else {
        Alert.alert('알림', '비밀번호 변경에 실패했습니다');
      }
    } catch (error) {
      console.error('Password change failed:', error);
      Alert.alert(
        '알림',
        '비밀번호 변경에 실패했습니다.\n네트워크 상태를 확인해주세요.'
      );
    }
  };

  const handleChangeMbti = async () => {
    const mbti = {
      uid: userId,
      mbti: newMbti,
    };
    if (newMbti === '') {
      Alert.alert('알림', 'MBTI를 입력해주세요');
      return;
    }
    try {
      const response = await axios.patch(
        'https://port-0-capstone-project-gj8u2llon19kg3.sel5.cloudtype.app/auth/patch/' +
          userId,
        mbti,
        {
          headers: {
            'AUTH-TOKEN': jwtToken1,
          },
        }
      );

      if (response.status === 200) {
        console.log(response.data);
        setNewMbti(''); // 성공한 후 입력 필드를 초기화
        Alert.alert('알림', 'MBTI 변경 완료');
      } else {
        Alert.alert('알림', 'MBTI 변경에 실패했습니다');
      }
    } catch (error) {
      console.error('MBTI change failed:', error);
      Alert.alert(
        '알림',
        'MBTI 변경에 실패했습니다.\n네트워크 상태를 확인해주세요.'
      );
    }
  };

  const placeholder = {
    label: 'MBTI',
    value: null,
  };

  const mbtis = [
    { label: 'INFP', value: 'INFP' },
    { label: 'INFJ', value: 'INFJ' },
    { label: 'INTP', value: 'INTP' },
    { label: 'INTJ', value: 'INTJ' },
    { label: 'ISFP', value: 'ISFP' },
    { label: 'ISFJ', value: 'ISFJ' },
    { label: 'ISTP', value: 'ISTP' },
    { label: 'ISTJ', value: 'ISTJ' },
    { label: 'ENFP', value: 'ENFP' },
    { label: 'ENFJ', value: 'ENFJ' },
    { label: 'ENTP', value: 'ENTP' },
    { label: 'ENTJ', value: 'ENTJ' },
    { label: 'ESFP', value: 'ESFP' },
    { label: 'ESFJ', value: 'ESFJ' },
    { label: 'ESTP', value: 'ESTP' },
    { label: 'ESTJ', value: 'ESTJ' },
  ];

  const handleChangeNickname = async () => {
    const nickname = {
      uid: userId,
      nickname: newNickname,
    };
    const uid = userId;
    console.log('url에 들어가는', uid);
    console.log('닉네임 변경시 userID', userId);
    console.log('닉네임 변경', newNickname);
    if (newNickname === '') {
      Alert.alert('알림', '닉네임을 입력해주세요');
      return;
    }
    try {
      const response = await axios.patch(
        'https://port-0-capstone-project-gj8u2llon19kg3.sel5.cloudtype.app/auth/patch/name/' +
          uid,
        nickname,
        {
          headers: {
            'AUTH-TOKEN': jwtToken1,
          },
        }
      );

      console.log(response.data); // 응답 확인

      if (response.status === 200) {
        console.log(response.data.token); // 토큰 값 출력
        await AsyncStorage.setItem('@jwtToken', response.data.token); // 새로운 토큰을 저장합니다.
        setJwtToken1(response.data.token); // 상태 변수 업데이트
        setNewNickname(''); // 성공한 후 입력 필드를 초기화
        setCurrentNickname(newNickname); // 상태 업데이트 부분 추가
        Alert.alert('알림', '닉네임 변경 완료');
      } else {
        Alert.alert('알림', '닉네임 변경에 실패했습니다');
      }
    } catch (error) {
      console.error('Nickname change failed:', error);
      Alert.alert(
        '알림',
        '닉네임 변경에 실패했습니다.\n네트워크 상태를 확인해주세요.'
      );
    }
  };
  console.log('profileupdate', currentNickname);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.header_left}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('ProfileScreen', {
                isLoggedIn: true,
                userId,
                updateDM2,
                jwtToken: jwtToken1,
                nickname: currentNickname || nickname, // If the nickname has been changed, pass the new one. Otherwise, pass the old one.
                password: newPassword || password, // If the password has been changed, pass the new one. Otherwise, pass the old one.
                mbti: newMbti || mbti, // If the MBTI has been changed, pass the new one. Otherwise, pass the old one.
              })
            }
          >
            <AntDesign name="arrowleft" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <View style={styles.header_center}>
          <Text style={styles.back_text}>개인 프로필 수정</Text>
        </View>
        <View style={styles.header_right}></View>
      </View>

      <View style={styles.profile_infos}>
        <TouchableOpacity onPress={handleImageSelection}>
          <View style={styles.image} />
        </TouchableOpacity>
        <View style={styles.name_section}>
          <Text style={styles.user_name_text}>{currentNickname}</Text>
          <Text style={styles.email_text}>{userId}</Text>
        </View>
      </View>

      <View style={styles.text_input_container}>
        <View style={styles.input_label_view}>
          <View style={styles.update2_text}>
            <Text style={styles.update2_text}>비밀번호</Text>
          </View>
          <TextInput
            placeholder="변경할 비밀번호를 입력해주세요"
            style={styles.update_inputfield}
            value={newPassword}
            onChangeText={(text) => setNewPassword(text)}
          />
        </View>
        <View style={styles.update_button_container}>
          <TouchableOpacity
            style={styles.update_button}
            onPress={handleChangePassword}
          >
            <Text style={styles.button_text}>비밀번호 변경하기</Text>
          </TouchableOpacity>
        </View>

        <Text>{'\n'}</Text>

        <View style={styles.input_label_view}>
          <View style={styles.update2_text}>
            <Text style={styles.update2_text}>MBTI</Text>
          </View>
          <RNPickerSelect
            placeholder={placeholder}
            value={newMbti}
            onValueChange={(itemValue) => setNewMbti(itemValue)}
            items={mbtis}
            style={{
              inputIOS: styles.mbti_select_ios,
              inputAndroid: styles.update2, // iOS 및 Android 스타일을 동일하게 유지
            }}
          />
        </View>
        <View style={styles.update_button_container}>
          <TouchableOpacity
            style={styles.update_button}
            onPress={handleChangeMbti}
          >
            <Text style={styles.button_text}>MBTI 변경하기</Text>
          </TouchableOpacity>
        </View>

        <Text>{'\n'}</Text>

        <View style={styles.update3_text_1}>
          <View style={styles.signup_page_label_view}>
            <Text style={styles.signup_page_label_text}>닉네임</Text>
          </View>
          <TextInput
            placeholder="새로운 닉네임을 넣어주세요"
            style={styles.signup_page_inputfield}
            value={newNickname}
            onChangeText={(text) => setNewNickname(text)}
          />
        </View>
        <View style={styles.update_button_container}>
          <TouchableOpacity
            style={styles.update_button}
            onPress={handleChangeNickname}
          >
            <Text style={styles.button_text}>닉네임 변경하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};
