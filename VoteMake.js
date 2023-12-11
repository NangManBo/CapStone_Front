import React, { useState } from 'react';
import {
  Image,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { TextInput } from 'react-native';
import { styles } from './styles';
import axios from 'axios';
import RNPickerSelect from 'react-native-picker-select';
import * as ImagePicker from 'expo-image-picker'; // import

export const VoteMake = ({ navigation, route }) => {
  const {
    userId,
    isLoggedIn,
    jwtToken,
    nickname,
    updateDM2,
  } = route.params;
  // 제목 입력
  const [titleInput, setTitleInput] = useState('');
  // 본문 입력
  const [description, setDescription] = useState('');
  // 카테고리 선택
  const [selectedCategory, setSelectedCategory] =
    useState('');
  const placeholder = {
    label: '선택',
    value: null,
  };
  // 선택 사항
  const [options, setOptions] = useState(['', '']);

  // 선택 사항 추가
  const addOption = () => {
    if (options.length < 4) {
      setOptions([...options, '']);
    } else {
      Alert.alert(
        '알림',
        '투표항목은 최대 4개까지 등록 가능합니다.'
      );
    }
  };
  // 선택 사항 삭제
  const removeOption = (indexToRemove) => {
    if (options.length > 2) {
      const newOptions = options.filter(
        (_, index) => index !== indexToRemove
      );
      setOptions(newOptions);
    } else {
      Alert.alert(
        '알림',
        '투표항목은 최소 2개 이상이어야 합니다.'
      );
    }
  };
  const categories = [
    { label: '정치', value: '정치' },
    { label: '경제', value: '경제' },
    { label: '스포츠', value: '스포츠' },
    { label: '문화와예술', value: '문화와예술' },
    { label: '시사', value: '시사' },
    { label: '게임', value: '게임' },
    { label: '반려동물', value: '반려동물' },
    { label: '음식', value: '음식' },
  ];

  const [selectedMedia, setSelectedMedia] = useState(null);
  // 사진 고른거 삭제
  const cancelImage = () => {
    setSelectedMedia(null);
    console.log(jwtToken);
  };

  // 수정된 코드
  const handleMediaPick = (result) => {
    const selectedAssets = result.assets;
    if (selectedAssets.length > 0) {
      const selectedMediaUri = selectedAssets[0].uri;
      console.log('Selected Image URI:', selectedMediaUri);
      setSelectedMedia(selectedMediaUri);
    }
  };

  // pickMedia 함수에서도 수정이 필요합니다.
  const pickMedia = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      result.fileName = '1'; // 파일 이름 설정

      // 선택한 미디어의 타입 확인
      if (result.assets[0].type.startsWith('image')) {
        // 이미지인 경우에만 handleMediaPick 호출
        handleMediaPick(result);
      } else {
        // 동영상인 경우에 대한 처리 (현재는 로그만 출력)
        console.log(
          'Selected Media is a video:',
          result.assets[0].uri
        );
      }
    }
  };

  // 투표 생성
  const goVoteMake2 = async () => {
    try {
      const formData = new FormData();

      if (titleInput.trim() === '') {
        Alert.alert('알림', '제목을 입력하세요.');
      } else if (
        selectedCategory.trim() === '' ||
        selectedCategory === '선택'
      ) {
        Alert.alert('알림', '카테고리를 선택해주세요.');
      } else if (description.trim() === '') {
        Alert.alert('알림', '본문 내용을 입력해주세요.');
      } else if (
        options.some((option) => option.trim() === '')
      ) {
        Alert.alert('알림', '투표항목내용을 입력해주세요.');
      } else {
        formData.append(
          'user',
          JSON.stringify({ user: nickname })
        );
        formData.append(
          'title',
          JSON.stringify({ title: titleInput })
        );
        formData.append(
          'question',
          JSON.stringify({ question: description })
        );

        if (selectedMedia) {
          const localUri = selectedMedia;
          const filename = localUri.split('/').pop();
          const match = /\.(\w+)$/.exec(filename ?? '');
          const type = match
            ? `image/${match[1]}`
            : 'image';

          const response = await fetch(localUri);
          const blob = await response.blob();

          formData.append('mediaData', {
            uri: localUri,
            name: filename,
            type: type, // Use the actual Content-Type from the result
            blob: blob,
          });
        }
      }
      console.log('formData ', formData);

      const response = await fetch(
        'https://port-0-capstone-project-gj8u2llon19kg3.sel5.cloudtype.app/polls/upload/' +
          // titleInput +
          // '/' +
          // description +
          // '/' +
          selectedCategory,
        {
          method: 'POST',
          headers: {
            'AUTH-TOKEN': jwtToken,
          },
          body: formData,
        }
      );

      if (response.ok) {
        const contentType =
          response.headers.get('content-type');
        setSelectedMedia(null);
        console.log('투표 생성 성공');

        let parsedData;
        if (
          contentType &&
          contentType.includes('application/json')
        ) {
          parsedData = await response.json();
          console.log('투표 작성 성공:', parsedData);
        } else {
          console.log('투표 작성 성공');
        }
        // navigation.navigate('VoteMake2', {
        //   isLoggedIn: true,
        //   userId,
        //   jwtToken,
        //   nickname,
        //   updateDM2,
        //   pollId: parsedData.pollId,
        // });
        try {
          const data = {
            choiceDtos: options.map((option, index) => ({
              text: option.trim(),
            })),
          };

          const response = await axios.post(
            'https://port-0-capstone-project-gj8u2llon19kg3.sel5.cloudtype.app/choices/create/' +
              parsedData.pollId,
            data
          );

          if (response.status === 201) {
            console.log('투표 항목 성공:', response.data);
            navigation.navigate('HomeScreen', {
              isLoggedIn: true,
              userId,
              jwtToken,
              nickname,
              updateDM2: updateDM2 + 1,
            });
          } else {
            console.error(
              '투표항목 생성 실패:',
              response.data
            );
          }
        } catch (error) {
          console.error('투표항목 생성 오류:', error);
        }
      } else {
        const errorData = await response.text();
        console.error(
          '투표 오류 응답:',
          response.status,
          errorData
        );
      }
    } catch (error) {
      console.error('투표 오류 응답:', error);
    }
  };

  return (
    <View style={styles.status_x}>
      <View>
        <View style={styles.main_Row12}>
          <View style={styles.back_view12}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('HomeScreen', {
                  userId,
                  isLoggedIn,
                  jwtToken,
                  nickname,
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
            <Text style={styles.VoteMake_View1_title_View}>
              투표생성하기
            </Text>
          </View>
        </View>
        <ScrollView>
          {/* 뒤로가기 버튼 */}
          <View style={styles.VoteMake_View1}>
            <View style={styles.VoteMake_View1_inputfield}>
              <Text
                style={styles.VoteMake_View1_title_input}
              >
                제목:
              </Text>
              <TextInput
                style={[
                  styles.VoteMake_View1_title_text,
                  titleInput,
                ]}
                placeholder="제목을 입력하세요"
                onChangeText={(text) => setTitleInput(text)}
              />
            </View>
            {/* 제목입력칸 */}

            <View
              style={styles.VoteMake_View1_category_View}
            >
              <View>
                <Text
                  style={styles.VoteMake_View_category_}
                >
                  카테고리
                </Text>
              </View>
              {/* 카테고리 문구 */}

              <View
                style={
                  styles.VoteMake_View1_category_Picker_View
                }
              >
                <RNPickerSelect
                  placeholder={placeholder}
                  value={selectedCategory}
                  onValueChange={(itemValue) =>
                    setSelectedCategory(itemValue)
                  }
                  items={categories}
                  style={{
                    inputIOS:
                      styles.VoteMake_View1_category_Picker2,
                    inputAndroid:
                      styles.VoteMake_View1_category_Picker, // iOS 및 Android 스타일을 동일하게 유지
                  }}
                />
              </View>
            </View>
            {/* 카테고리 피커 */}

            <View style={styles.VoteMake_View2_content}>
              <Text
                style={styles.VoteMake_View2_titlename}
              ></Text>

              {/* 본문글씨 */}
              <TouchableOpacity
                style={styles.VoteMake_View2_content_View}
                onPress={pickMedia}
              >
                {/* 버튼 근처를 눌러도 터치가능 */}
                <AntDesign
                  name="picture"
                  size={28}
                  color="black"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.VoteMake_View2_cancel}
                onPress={cancelImage}
              >
                <Text style={styles.xtext}>x</Text>
              </TouchableOpacity>
            </View>
            {/* 사진첨부버튼 */}
          </View>

          <View style={styles.VoteMake_View2_textcontent1}>
            <TextInput
              placeholder="본문 내용을 입력하세요"
              style={styles.VoteMake_View2_textcontent}
              multiline={true}
              onChangeText={(text) => setDescription(text)}
              value={description}
            />
          </View>

          <View>
            {selectedMedia && (
              <Image
                source={{ uri: selectedMedia }}
                style={styles.VoteMake_View2_image}
              />
            )}
          </View>

          {/*본문 내용 입력}*/}
          <View>
            {options.map((item, index) => (
              <View
                key={index}
                style={
                  styles.VoteMake_View3_content_interval
                }
              >
                <View
                  style={styles.VoteMake_View3_Votecontent}
                >
                  <TextInput
                    style={
                      styles.VoteMake_View3_Votecontent1
                    }
                    placeholder={`투표항목 내용을 입력하세요`}
                    value={item}
                    onChangeText={(text) => {
                      const newOptions = [...options];
                      newOptions[index] = text;
                      setOptions(newOptions);
                    }}
                  />
                </View>

                {/* 투표항목 추가 및 입력 버튼 */}

                <TouchableOpacity
                  onPress={() => removeOption(index)}
                >
                  <AntDesign
                    name="minus"
                    size={28}
                    color="#4B89DC"
                  />
                </TouchableOpacity>
                {/* 투표항목 추가 및 입력 버튼 */}
              </View>
            ))}
          </View>
          {/*추가된 투표항목}*/}

          <View style={styles.VoteMake_View3_Addcontent}>
            <View
              style={styles.VoteMake_View3_contentbotton}
            >
              <Text
                style={styles.VoteMake_View3_contenttext}
              >
                투표항목을 추가하려면 + 버튼을 누르세요
              </Text>
            </View>
            {/*투표항목 추가문구버튼}*/}

            <TouchableOpacity
              style={styles.VoteMake_View3_contentaddbotton}
              onPress={addOption} // 플러스 버튼을 눌렀을 때만 addOption 함수 호출
            >
              <AntDesign
                name="plus"
                size={25}
                color="#4B89DC"
              />
            </TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity
              style={styles.VoteMake_View3_Makebotton}
              onPress={goVoteMake2}
            >
              <Text
                style={styles.VoteMake_View3_Makebottonname}
              >
                투표 항목 생성하러 가기
              </Text>
            </TouchableOpacity>
            {/* 투표생성하기버튼 */}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};
