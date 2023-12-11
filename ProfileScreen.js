import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from './styles';
import axios from 'axios';
import { AntDesign } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
export const ProfileScreen = ({ navigation, route }) => {
  const {
    userId,
    isLoggedIn,
    jwtToken,
    nickname,
    updateDM2,
    password,
    mbti,
    vote,
  } = route.params;

  // const formatNumberWithCommas = (number) => {
  //   if (typeof number === 'number') {
  //     return number.toLocaleString(); // 숫자에 천 단위 구분 기호 추가
  //   } else {
  //     return 'N/A'; // 숫자가 아닌 경우 'N/A' 반환
  //   }
  // };

  const [participatedVoteCount, setParticipatedVoteCount] = useState(0);
  const [generatedVoteCount, setGeneratedVoteCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [popularPoint, setPopularPoint] = useState(0);
  const [getMbti, setGetMbti] = useState('');
  useFocusEffect(
    React.useCallback(() => {
      console.log('profile', nickname);
      getUserData();
    }, [nickname]) // Add any dependencies that should trigger a re-fetch
  );

  const getUserData = async () => {
    console.log('Nickname: ', nickname);
    console.log('JWTToken: ', jwtToken);
    try {
      // 참가한 투표 수와 생성한 투표 수를 받아오는 각각의 요청
      const participatedVotesResponse = await axios.get(
        'https://port-0-capstone-project-gj8u2llon19kg3.sel5.cloudtype.app/polls/participated-count/' +
          nickname,
        {
          headers: {
            'AUTH-TOKEN': jwtToken,
          },
        }
      );
      const generatedVotesResponse = await axios.get(
        'https://port-0-capstone-project-gj8u2llon19kg3.sel5.cloudtype.app/polls/created-count/' +
          nickname,
        {
          headers: {
            'AUTH-TOKEN': jwtToken,
          },
        }
      );
      const commentResponse = await axios.get(
        'https://port-0-capstone-project-gj8u2llon19kg3.sel5.cloudtype.app/auth/profile/' +
          userId,
        {
          headers: {
            'AUTH-TOKEN': jwtToken,
          },
        }
      );

      const popularPointResponse = await axios.get(
        'https://port-0-capstone-project-gj8u2llon19kg3.sel5.cloudtype.app/polls/popular-point/' +
          nickname,
        {
          headers: {
            'AUTH-TOKEN': jwtToken,
          },
        }
      );
      const get_mbti = await axios.get(
        'https://port-0-capstone-project-gj8u2llon19kg3.sel5.cloudtype.app/auth/mbti/' +
          nickname
      );

      //두 요청을 동시에 처리
      // const [participatedVotesResponse, generatedVotesResponse] =
      //   await Promise.all([participatedVotesRequest, generatedVotesRequest]);
      if (get_mbti.status === 200) {
        setGetMbti(get_mbti.data);
      } else {
        console.log('Mbti 실패했습니다');
      }

      if (participatedVotesResponse.status === 200) {
        setParticipatedVoteCount(participatedVotesResponse.data);
      } else {
        console.log('참가한 투표 수를 가져오는 데 실패했습니다');
      }

      console.log('Generated Votes Response:', generatedVotesResponse);
      if (generatedVotesResponse.status === 200) {
        setGeneratedVoteCount(generatedVotesResponse.data);
      } else {
        console.log('생성한 투표 수를 가져오는 데 실패했습니다');
      }

      if (commentResponse.status === 200) {
        setCommentCount(commentResponse.data.commentCount);
      } else {
        console.log('참가한 투표 수를 가져오는 데 실패했습니다');
      }

      if (popularPointResponse.status === 200) {
        setPopularPoint(popularPointResponse.data);
      } else {
        console.log('포인트를 가져오는 데 실패했습니다');
      }
    } catch (error) {
      console.error('사용자 데이터를 가져오는 데 실패했습니다:', error);
    }
  };

  const handleLogout = () => {
    console.log(mbti);
    // Perform any additional logout actions here
    navigation.navigate('LoginScreen', {
      isLoggedIn: false,
    });
    socket.onclose = (event) => {
      console.log(
        'WebSocket 연결이 닫혔습니다. 코드:',
        event.code,
        '이유:',
        event.reason
      );
    };
    return () => {
      socket.close();
    };
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.header_left}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('HomeScreen', {
                isLoggedIn: true,
                userId,
                jwtToken,
                updateDM2: updateDM2 + 1,
                nickname: nickname,
                password: password,
                mbti: mbti,
              })
            }
          >
            <AntDesign name="arrowleft" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <View style={styles.header_center}>
          <Text style={styles.back_text}>개인 프로필</Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logout_text}>로그아웃</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profile_infos}>
        <View style={styles.image} />
        <View style={styles.name_section}>
          <Text style={styles.user_name_text}>닉네임 : {nickname}</Text>
          <View style={styles.main_Row}>
            <Text style={styles.email_text}>아이디 : {userId}</Text>
            <Text style={styles.email_text1}>MBTI : {getMbti}</Text>
          </View>
        </View>
      </View>

      <View style={styles.button_container}>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate('UserAuthenticationScreen', {
              isLoggedIn: true,
              userId,
              jwtToken,
              nickname,
              updateDM2,
              password,
            })
          }
        >
          <Text style={styles.button_text}>프로필 업데이트/확인</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.user_status_container}>
        <View style={styles.participated_vote_box}>
          <Text style={styles.status_text1}>참가한 투표</Text>
          <Text>{participatedVoteCount}</Text>
        </View>
        <View style={styles.generated_vote_box}>
          <Text style={styles.status_text1}>생성한 투표</Text>
          <Text>{generatedVoteCount}</Text>
        </View>
        <View style={styles.comment_box}>
          <Text style={styles.status_text1}>댓글</Text>
          <Text>{commentCount}</Text>
        </View>
      </View>

      <View style={styles.user_point_container}>
        <View style={styles.point_text_container1}>
          <Text style={styles.point_text1}>내가 쌓은 포인트는 </Text>
          <View style={styles.point_box}>
            <Text style={styles.point_text1}>{popularPoint} 점</Text>
          </View>
        </View>
        <View style={styles.point_text_container2}>
          <Text style={styles.point_text2}>
            포인트는 투표 종료 시점에 다수가 투표한 항목에 투표했을 시
            부여됩니다.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};
