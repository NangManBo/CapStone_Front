import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { AntDesign, Entypo } from '@expo/vector-icons';
import { styles } from './styles';
import { Alert } from 'react-native';
import axios from 'axios'; // Import axios for HTTP requests

export const VoteBefore = ({ navigation, route }) => {
  const {
    category,
    filteredVotes,
    initialPage,
    vote,
    userId,
    isLoggedIn,
    jwtToken,
    nickname,
    updateDM2,
  } = route.params;

  const [pollOptions, setPollOptions] = useState([]);

  useEffect(() => {
    console.log('함 보자', initialPage);
    // Assuming vote.choices is an array of choice objects received from the server
    if (vote.choice && Array.isArray(vote.choice)) {
      setPollOptions(
        vote.choice.map((choice) => ({
          id: choice.id,
          text: choice.text,
          votes: 0,
          isSelected: false,
        }))
      );
    } else {
      // Handle the case where vote.choices is not an array or is undefined
      console.error(
        'ERROR: vote.choices is not an array or is undefined'
      );
      // You might want to set a default value for pollOptions or handle it accordingly
    }
  }, [vote]);

  const handleVoteOption = (optionId) => {
    const updatedOptions = pollOptions.map((option) => ({
      ...option,
      isSelected: option.id === optionId,
    }));
    setPollOptions(updatedOptions);
  };

  const handleVote = async () => {
    const selectedOption = pollOptions.find(
      (option) => option.isSelected
    );

    if (!selectedOption) {
      Alert.alert('알림', '투표항목을 선택해주세요');
      return;
    }
    // Send vote data to the server
    const VoteDto = {
      pollId: vote.id, // Replace with the actual poll ID
      choiceId: selectedOption.id, // Replace with the actual choice ID
      nickname: nickname,
    };
    console.log(VoteDto);

    try {
      const response = await axios.post(
        'https://port-0-capstone-project-gj8u2llon19kg3.sel5.cloudtype.app/votes',
        VoteDto,
        {
          headers: {
            'AUTH-TOKEN': jwtToken,
          },
        }
      );
      if (response.status === 201) {
        console.log('투표 성공:', response.data);
      } else {
        console.error('투표 실패:', response.data);
      }
    } catch (error) {
      console.error('서버랑 오류 :', error);
    }
    try {
      const response = await axios.get(
        `https://port-0-capstone-project-gj8u2llon19kg3.sel5.cloudtype.app/votes/ok/${nickname}`,
        {
          headers: {
            'AUTH-TOKEN': jwtToken,
          },
        }
      );

      if (response.status === 200) {
        const userVotes = response.data;

        navigation.navigate('VoteAfter', {
          initialPage: initialPage,
          category,
          filteredVotes,
          vote,
          userId,
          isLoggedIn,
          jwtToken,
          nickname,
          updateDM2,
          userVotes,
        });
      } else {
        console.error(
          '투표 들어가려는데 실패:',
          response.data
        );
      }
    } catch (error) {
      console.error('투표 들어가려는데 오류:', error);
    }
  };

  const handleGoBack = () => {
    // navigation.goBack()을 호출하여 이전 화면으로 이동
    navigation.goBack();
  };

  return (
    <View style={styles.status_x}>
      <View style={styles.main_Row12}>
        <View style={styles.back_view12}>
          <TouchableOpacity onPress={handleGoBack}>
            <AntDesign
              name="arrowleft"
              size={24}
              color="black"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.btns}></View>
      </View>
      <ScrollView style={styles.VoteCreatedUser}>
        <View style={styles.VoteBefore_View1_All}>
          <View>
            <Text style={styles.VoteBefore_View1_title}>
              {JSON.parse(vote.title).title}
            </Text>
          </View>

          <View style={styles.text_box1}>
            <Text style={styles.VoteBefore_View1_day}>
              투표 기간 설정: {vote.createdAt}
            </Text>

            <Text style={styles.VoteBefore_View1_host}>
              주최자 : {vote.createdBy}
            </Text>
          </View>

          <View style={styles.VoteBefore_View1_row}></View>

          <View>
            <Text
              style={styles.VoteCreatedUser_View2_Content}
            >
              {JSON.parse(vote.question).question}
            </Text>
            {vote.mediaUrl && (
              <View style={styles.ivstyle}>
                <Image
                  source={{ uri: vote.mediaUrl }}
                  style={styles.Vote_Main_image}
                />
              </View>
            )}
          </View>
          <View></View>
          {pollOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.VoteBefore_View2_Votebotton,
                {
                  backgroundColor: option.isSelected
                    ? '#4B89DC'
                    : 'transparent',
                },
              ]}
              onPress={() => handleVoteOption(option.id)}
            >
              {option.isSelected && (
                <Entypo
                  name="check"
                  size={20}
                  color={
                    option.isSelected ? 'white' : 'dimgray'
                  }
                  style={{ marginRight: 5 }}
                />
              )}
              <Text
                style={{
                  color: option.isSelected
                    ? 'white'
                    : 'dimgray',
                }}
              >
                {option.text}
              </Text>
            </TouchableOpacity>
          ))}

          <View style={styles.VoteBefore_View2_Row}></View>

          <Text style={styles.VoteBefore_View3_comment}>
            댓글
          </Text>

          <View style={styles.VoteBefore_View3_warning}>
            <Text>
              투표 후 댓글 작성 및 보기가 가능합니다
            </Text>
          </View>

          <View>
            <TouchableOpacity
              onPress={handleVote}
              style={styles.VoteBefore_View3_Votebotton}
            >
              <Text
                style={
                  styles.VoteBefore_View3_Votebottontext
                }
              >
                선택한 버튼으로 투표하기
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
