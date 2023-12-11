import React, { useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import axios from 'axios';
import { styles } from './styles';
import RNPickerSelect from 'react-native-picker-select';

export const SignUpScreen = ({ navigation }) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [passwordCheck, setPasswordCheck] = useState('');
  const [nickname, setNickname] = useState('');
  const [selectedGender, setSelectedGender] =
    useState(null);
  const [ageGroup, setAgeGroup] = useState('');
  const [mbti, setMbti] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] =
    useState(false);
  const handleGenderSelection = (gender) => {
    setSelectedGender(gender);
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

  const handleIdChange = (text) => {
    // 정규표현식을 사용하여 영어 대문자, 한글 여부 체크
    const pattern = /[A-Zㄱ-ㅎㅏ-ㅣ가-힣]/;

    if (pattern.test(text)) {
      // 영어 대문자나 한글이 포함되어 있으면 알람을 띄움
      Alert.alert(
        '알림',
        '영어 대문자나 한글은 사용할 수 없습니다.'
      );
    } else {
      // 영어 대문자와 한글이 없으면 상태 업데이트
      setId(text);
    }
  };

  const handleSignUp = async () => {
    if (isButtonDisabled) {
      return; // If button is disabled, prevent multiple requests
    }
    setIsButtonDisabled(true); // Disable the button immediately

    if (id === nickname) {
      if (id === '') {
        Alert.alert('오류', '입력해주세요!');
        setIsButtonDisabled(false);
      } else {
        Alert.alert(
          '오류',
          'ID와 닉네임이 중복됩니다. 다시 입력해주세요'
        );
        setNickname('');
        setIsButtonDisabled(false); // Re-enable the button
      }
      return;
    } else if (nickname.length < 2) {
      Alert.alert(
        '오류',
        '닉네임은 최소 2글자 이상이어야 합니다.'
      )
      setNickname('');
      setIsButtonDisabled(false); // Re-enable the button
      return;
    } else if (nickname.length > 7) {
      Alert.alert('오류', '닉네임은 최대 8글자 이하이어야 합니다.');
      setNickname('');
      setIsButtonDisabled(false); // Re-enable the button
    } else if (password !== passwordCheck) {
      Alert.alert('오류', '비밀번호가 다릅니다');
      setPasswordCheck('');
      setIsButtonDisabled(false); // Re-enable the button
      return;
    } else if (password.length < 8) {
      Alert.alert('오류', '비밀번호는 최소 8글자 이상이어야 합니다.');
      setPasswordCheck('');
      setIsButtonDisabled(false); // Re-enable the button
      return;
    } else if (password.length > 12) {
      Alert.alert('오류', '비밀번호는 최대 12글자 이하이어야 합니다.');
      setPasswordCheck('');
      setIsButtonDisabled(false); // Re-enable the button
      return;
    }else {
      const userData = {
        uid: id,
        password: password,
        nickname: nickname,
        gender: selectedGender,
        age: ageGroup,
        mbti: mbti,
      };

      try {
        const response = await axios.post(
          'https://port-0-capstone-project-gj8u2llon19kg3.sel5.cloudtype.app/auth/signup',
          userData
        );

        if (response.status === 201) {
          console.log('회원가입 성공:', response.data);
          navigation.navigate('LoginScreen');
        } else {
          console.error('회원가입 실패:', response.data);
        }
      } catch (error) {
        Alert.alert(
          '오류',
          '잘못 입력하거나 비어있는 곳이 있습니다.'
        );
        console.error('회원가입 요청 오류:', error);
      } finally {
        // Use setTimeout to delay the reactivation of the button by 2 seconds (2000 milliseconds)
        setTimeout(() => {
          setIsButtonDisabled(false); // Re-enable the button after the delay
        }, 2000);
      }
    }
  };

  return (
    <View style={styles.main_Page1}>
      <View style={styles.main_Row}>
        <View style={styles.back_view}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('LoginScreen')
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
          <Text style={styles.back_text}>회원가입</Text>
        </View>
      </View>
      <View style={styles.signup_page_view}>
        <View style={styles.input_label_view}>
          <View style={styles.signup_page_label_view}>
            <Text style={styles.signup_page_label_text}>
              아이디
            </Text>
          </View>
          <TextInput
            placeholder="ID 입력 해주세요"
            value={id}
            onChangeText={(text) => handleIdChange(text)}
            style={styles.signup_page_inputfield}
            keyboardType="email-address" // 영어 소문자와 숫자만 입력 가능
            autoCapitalize="none" // 자동 대문자 변환 비활성화
          />
        </View>
        <View style={styles.input_label_view}>
          <View style={styles.signup_page_label_view}>
            <Text style={styles.signup_page_label_text}>
              비밀번호
            </Text>
          </View>
          <TextInput
            placeholder="비밀번호는 8 ~ 12자리"
            value={password}
            onChangeText={(text) => setPassword(text)}
            style={styles.signup_page_inputfield}
            secureTextEntry={true}
          />
        </View>
        <View style={styles.input_label_view}>
          <View style={styles.signup_page_label_view}>
            <Text style={styles.signup_page_label_text}>
              재입력
            </Text>
          </View>
          <TextInput
            placeholder="비밀번호 재입력"
            value={passwordCheck}
            onChangeText={(text) => setPasswordCheck(text)}
            style={styles.signup_page_inputfield}
            secureTextEntry={true}
          />
        </View>
        <View style={styles.input_label_view}>
          <View style={styles.signup_page_label_view}>
            <Text style={styles.signup_page_label_text}>
              닉네임
            </Text>
          </View>
          <TextInput
            placeholder="닉네임은 최대 7자리까지"
            value={nickname}
            onChangeText={(text) => setNickname(text)}
            style={styles.signup_page_inputfield}
          />
        </View>
        <View style={styles.input_label_view}>
          <View style={styles.signup_page_label_view}>
            <Text style={styles.signup_page_label_text}>
              성별
            </Text>
          </View>
          <View style={styles.signup_page_gender_view}>
            <TouchableOpacity
              style={[
                styles.signup_page_gender_btn,
                selectedGender === 'M'
                  ? styles.selectedGender
                  : null,
              ]}
              onPress={() => handleGenderSelection('M')}
            >
              <Text style={styles.signup_page_gender_text}>
                남
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.signup_page_gender_btn,
                selectedGender === 'W'
                  ? styles.selectedGender
                  : null,
              ]}
              onPress={() => handleGenderSelection('W')}
            >
              <Text style={styles.signup_page_gender_text}>
                여
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.input_label_view}>
          <View style={styles.signup_page_label_view}>
            <Text style={styles.signup_page_label_text}>
              나이대
            </Text>
          </View>
          <TextInput
            placeholder="나이 입력 해주세요!"
            value={ageGroup}
            onChangeText={(text) => setAgeGroup(text)}
            style={styles.signup_page_inputfield}
            keyboardType="numeric" // 숫자만 입력하도록 지정
          />
        </View>
        <View style={styles.input_label_view}>
          <View style={styles.signup_page_label_view}>
            <Text style={styles.signup_page_label_text}>
              MBTI
            </Text>
          </View>
          <RNPickerSelect
            placeholder={placeholder}
            value={mbti}
            onValueChange={(itemValue) =>
              setMbti(itemValue)
            }
            items={mbtis}
            style={{
              inputIOS: styles.mbti_select_ios,
              inputAndroid: styles.mbti_select_and, // iOS 및 Android 스타일을 동일하게 유지
            }}
          />
        </View>
        <TouchableOpacity
          onPress={handleSignUp}
          disabled={isButtonDisabled}
        >
          <View
            style={[
              styles.signup_page_signup_btn_view,
              {
                backgroundColor: isButtonDisabled
                  ? 'gray'
                  : '#0070FF',
              },
            ]}
          >
            <Text
              style={styles.signup_page_signup_btn_text}
            >
              회원 가입하기
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};
