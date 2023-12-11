import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import {
  FontAwesome,
  Feather,
  AntDesign,
} from '@expo/vector-icons';
import { styles } from './styles';
import axios from 'axios';
import moment from 'moment';
import { useFocusEffect } from '@react-navigation/native';

export const SearchScreen = ({ navigation, route }) => {
  const {
    userId,
    isLoggedIn,
    jwtToken,
    nickname,
    updateDM2,
  } = route.params;

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `https://port-0-capstone-project-gj8u2llon19kg3.sel5.cloudtype.app/polls/search?title=${searchQuery}`,
        {
          headers: {
            'AUTH-TOKEN': jwtToken,
          },
        }
      );

      if (response.status === 200) {
        const formattedVotes = response.data.map(
          (vote) => ({
            id: vote.id,
            mediaUrl: vote.mediaUrl,
            createdBy: vote.createdBy,
            voteStatus: vote.voteStatus,
            createdAt: moment
              .utc(vote.createdAt, 'YYYY.MM.DD HH:mm:ss')
              .format('YYYY-MM-DD HH:mm'),
            category: vote.category,
            title: vote.title,
            question: vote.question,
            likesCount: vote.likesCount,
            likedUsers: vote.likedUsernames,
            choice: Array.isArray(vote.choice)
              ? vote.choice.map((choice) => ({
                  id: choice.id,
                  text: choice.text,
                }))
              : [],
          })
        );
        setSearchResults(formattedVotes);
        console.log('검색 결과', searchResults);
      } else {
        console.error(
          'Failed to fetch messages:',
          response.data
        );
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    const hours = `${date.getHours()}`.padStart(2, '0');
    const minutes = `${date.getMinutes()}`.padStart(2, '0');
    const seconds = `${date.getSeconds()}`.padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  useFocusEffect(
    useCallback(() => {
      handleSearch1(); // Call your fetchData function when the screen is focused
    }, [searchQuery])
  );

  const handleSearch = () => {
    if (searchQuery.length >= 2) {
      fetchData();
    } else {
      Alert.alert(
        '검색 오류',
        '검색어는 최소 2글자 이상이어야 합니다.',
        [{ text: '확인' }],
        { cancelable: false }
      );
    }
  };
  const handleSearch1 = () => {
    if (searchQuery.length >= 2) {
      fetchData();
    }
  };

  const handleVotePress = async (vote) => {
    console.log('Vote object:', vote); // Vote 객체 확인
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
        console.log('응답 데이터', response.data);

        const userVotes = response.data;
        console.log(userVotes);

        console.log('그래서 보내는 vote는 ? ', vote);
        // Check if userVotes is null or empty
        if (!userVotes || userVotes.length === 0) {
          const isCreatedByUser =
            vote.createdBy === nickname;
          console.log('만든 사람', vote.createdBy);
          // Check if the vote is closed
          const isVoteEnd = vote.voteStatus === 'CLOSED';

          // Navigate to the appropriate screen based on voting status, createdBy, and voteStatus
          if (isVoteEnd) {
            console.log('end 간다');
            // If the vote is closed, navigate to 'VoteEnd'
            navigation.navigate('VoteEnd', {
              vote,
              isLoggedIn,
              userId,
              jwtToken,
              nickname,
              updateDM2,
              userVotes,
            });
          } else if (isCreatedByUser) {
            console.log('created 간다');
            // If the user created the vote, navigate to 'VoteCreatedUser'
            navigation.navigate('VoteCreatedUser', {
              vote,
              isLoggedIn,
              userId,
              jwtToken,
              nickname,
              updateDM2,
              userVotes,
            });
          } else {
            console.log('before 간다');
            console.log('검색 페이지에서 보내는 ', vote);
            // If userVotes is null or empty, navigate to 'VoteBefore'
            navigation.navigate('VoteBefore', {
              initialPage: 3,
              vote,
              isLoggedIn,
              userId,
              jwtToken,
              nickname,
              updateDM2,
            });
          }
        } else {
          const isCreatedByUser =
            vote.createdBy === nickname;
          const isVoteEnd = vote.voteStatus === 'CLOSED';

          const hasVoted = userVotes.some(
            (userVote) => userVote.pollId === vote.id
          );

          if (isVoteEnd) {
            console.log('end 간다2');
            // If the vote is closed, navigate to 'VoteEnd'
            navigation.navigate('VoteEnd', {
              vote,
              isLoggedIn,
              userId,
              jwtToken,
              nickname,
              updateDM2,
              userVotes,
            });
          } else if (isCreatedByUser) {
            console.log('created 간다2');
            // If the user created the vote, navigate to 'VoteCreatedUser'
            navigation.navigate('VoteCreatedUser', {
              vote,
              isLoggedIn,
              userId,
              jwtToken,
              nickname,
              updateDM2,
              userVotes,
            });
          } else if (hasVoted) {
            console.log('created 간다2');
            // If the user created the vote, navigate to 'VoteCreatedUser'
            navigation.navigate('VoteAfter', {
              initialPage: 3,
              vote,
              isLoggedIn,
              userId,
              jwtToken,
              nickname,
              updateDM2,
              userVotes,
            });
          } else {
            console.log('before 간다2');
            // If userVotes is null or empty, navigate to 'VoteBefore'
            navigation.navigate('VoteBefore', {
              initialPage: 3,
              vote,
              isLoggedIn,
              userId,
              jwtToken,
              nickname,
              updateDM2,
            });
          }
        }
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

  return (
    <View style={styles.main_page}>
      <View style={styles.main_Row14}>
        <View style={styles.back_btn}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('HomeScreen', {
                isLoggedIn: true,
                userId,
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
        <View style={styles.back_view3}>
          <Text style={styles.back_text}>
            투표 게시글 검색
          </Text>
        </View>
      </View>
      <View style={styles.search_input_View}>
        <TextInput
          style={styles.search_input_box}
          placeholder="두 글자 이상 입력해주세요!"
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
        <TouchableOpacity onPress={handleSearch}>
          <Feather
            style={styles.search_btn}
            name="search"
            size={30}
            color="black"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.serach_result_view}>
        <FontAwesome
          name="th-list"
          size={22}
          color="#007BFF"
        />
        <Text style={styles.search_result_text}>
          검색결과
        </Text>
      </View>
      {searchResults.length > 0 && (
        <ScrollView style={styles.serach_result_view2}>
          {searchResults.map((result) => (
            <TouchableOpacity
              key={result.id}
              style={styles.serach_result_view3}
              onPress={() => handleVotePress(result)}
            >
              <View
                key={result.id}
                style={styles.serach_result_view3}
              >
                <Text style={styles.serach_result_title}>
                  {JSON.parse(result.title).title}
                </Text>
                <Text
                  style={styles.serach_result_sub}
                  numberOfLines={2}
                >
                  {JSON.parse(result.question).question}
                </Text>
                <View style={styles.search_result_row}>
                  <AntDesign
                    name="like2"
                    size={20}
                    color="#007BFF"
                  />
                  <Text
                    style={styles.category_post_like_text}
                  >
                    {result.likesCount}
                  </Text>
                  <Text
                    style={styles.category_post_like_text1}
                  >
                    {result.createdAt}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      {searchResults.length === 0 &&
        searchQuery.trim() !== '' && (
          <View style={styles.serach_result_view2}>
            <Text style={styles.serach_result_title}></Text>
          </View>
        )}
    </View>
  );
};
