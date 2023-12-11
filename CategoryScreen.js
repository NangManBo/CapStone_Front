import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { styles } from './styles';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import RNPickerSelect from 'react-native-picker-select';
import { useFocusEffect } from '@react-navigation/native';

export const CategoryScreen = ({ navigation, route }) => {
  const {
    category,
    userId,
    isLoggedIn,
    jwtToken,
    nickname,
    updateDM2,
    filteredVotes,
  } = route.params;

  const handleGoBack = () => {
    navigation.goBack();
  };

  const [votes, setVotes] = useState([]);
  const [standard, setStandard] = useState('');
  const [sortedVotes, setSortedVotes] = useState([
    ...filteredVotes,
  ]);

  const placeholder = {
    label: '정렬 기준',
    value: null,
  };

  const standards = [
    { label: '시간 순', value: '시간' },
    { label: '인기 순', value: '인기' },
  ];

  const fetchVotes = async () => {
    try {
      const response = await axios.get(
        'https://port-0-capstone-project-gj8u2llon19kg3.sel5.cloudtype.app/polls/all',
        {
          headers: {
            'AUTH-TOKEN': jwtToken,
          },
        }
      );

      if (response.status === 200) {
        const votesData = response.data;

        if (Array.isArray(votesData)) {
          const formattedVotes = votesData.map((vote) => ({
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
          }));

          if (formattedVotes.length > 0) {
            setVotes(formattedVotes);
            handleCategoryPress(category, formattedVotes);
          }
        } else {
          console.error(
            'Invalid votes data format:',
            votesData
          );
        }
      } else {
        console.error(
          'Failed to fetch votes:',
          response.data
        );
      }
    } catch (error) {
      console.error('투표 데이터 가져오기:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchVotes();
    }, [jwtToken])
  );

  const handleCategoryPress = (
    selectedCategory,
    votesData
  ) => {
    const filteredVotes = votesData.filter(
      (vote) => vote.category === selectedCategory
    );
    setSortedVotes(filteredVotes);
  };

  useEffect(() => {
    const sortVotes = () => {
      const updatedSortedVotes = [...filteredVotes];

      if (standard === '인기') {
        updatedSortedVotes.sort(
          (a, b) => b.likesCount - a.likesCount
        );
      } else if (standard === '시간') {
        updatedSortedVotes.sort(
          (a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        );
      }
      setSortedVotes(updatedSortedVotes);
    };
    sortVotes();
  }, [standard, filteredVotes]);

  const handleVotePress = async (vote) => {
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

        if (!userVotes || userVotes.length === 0) {
          const isCreatedByUser =
            vote.createdBy === nickname;
          const isVoteEnd = vote.voteStatus === 'CLOSED';

          if (isVoteEnd) {
            navigation.navigate('VoteEnd', {
              vote,
              isLoggedIn,
              userId,
              jwtToken,
              nickname,
              updateDM2,
            });
          } else if (isCreatedByUser) {
            navigation.navigate('VoteCreatedUser', {
              vote,
              isLoggedIn,
              userId,
              jwtToken,
              nickname,
              updateDM2,
            });
          } else {
            navigation.navigate('VoteBefore', {
              category,
              filteredVotes,
              initialPage: 2,
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
          const category = vote.category || '';
          const hasVoted = userVotes.some(
            (userVote) => userVote.pollId === vote.id
          );

          navigation.navigate(
            isVoteEnd
              ? 'VoteEnd'
              : isCreatedByUser
              ? 'VoteCreatedUser'
              : hasVoted
              ? 'VoteAfter'
              : 'VoteBefore',
            {
              category,
              filteredVotes,
              initialPage: 2,
              vote,
              isLoggedIn,
              userId,
              jwtToken,
              nickname,
              updateDM2,
              userVotes,
            }
          );
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
      <View style={styles.main_Row}>
        <View style={styles.back_view}>
          <TouchableOpacity onPress={handleGoBack}>
            <AntDesign
              name="arrowleft"
              size={24}
              color="black"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.back_title_view}>
          <Text style={styles.back_text}>{category}</Text>
        </View>
        <View style={styles.standard_view}>
          <RNPickerSelect
            placeholder={placeholder}
            value={standard}
            onValueChange={(itemValue) =>
              setStandard(itemValue)
            }
            items={standards}
            style={{
              inputIOS: styles.standard_select_ios,
              inputAndroid: styles.standard_select_and,
            }}
          />
        </View>
      </View>
      <ScrollView style={styles.category_post_view}>
        {sortedVotes.map((vote, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleVotePress(vote)}
          >
            <View style={styles.category_post_box}>
              <View style={styles.category_post_text}>
                <Text style={styles.category_post_title}>
                  {JSON.parse(vote.title).title}
                </Text>
                <Text
                  style={styles.category_post_sub}
                  numberOfLines={2}
                >
                  {JSON.parse(vote.question).question}
                </Text>
              </View>
              <View style={styles.category_post_like}>
                <AntDesign
                  name="like2"
                  size={20}
                  color="#007BFF"
                />
                <Text
                  style={styles.category_post_like_text}
                >
                  {vote.likesCount}
                </Text>
                <Text
                  style={styles.category_post_like_text1}
                >
                  {vote.createdAt}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};
