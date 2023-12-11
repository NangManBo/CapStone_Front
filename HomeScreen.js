import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { styles, SCREEN_WIDTH } from './styles';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import axios from 'axios';
import moment from 'moment';
import { useFocusEffect } from '@react-navigation/native';
// 페이지 인디케이터(점)

export function PageIndicator({ currentPage, totalPages }) {
  const indicators = [];

  for (let i = 1; i <= totalPages; i++) {
    indicators.push(
      <View
        key={i}
        style={[
          styles.indicator,
          i === currentPage ? styles.activeIndicator : null,
        ]}
      >
        <Text
          style={[
            styles.indicatorText,
            i === currentPage,
            //</View> ? styles.activeIndicatorText
            // : styles.activeIndicatorText, //null,
          ]}
        ></Text>
      </View>
    );
  }

  return (
    <View style={styles.pageIndicatorContainer}>
      {indicators}
    </View>
  );
}

export const HomeScreen = ({ navigation, route }) => {
  const {
    isLoggedIn,
    userId,
    jwtToken,
    nickname,
    updateDM2,
  } = route.params;

  const [updateDM, setUpdateDM] = useState(updateDM2);
  const [currentPage, setCurrentPage] = useState(1);
  const [messages, setMessages] = useState([]);
  const [votes, setVotes] = useState([]);
  const totalPages = 3; // 총 페이지 수
  const [formattedVotes, setFormattedVotes] = useState([]);
  const [unreadMessageCount, setUnreadMessageCount] =
    useState(0);
  const handleScroll = (event) => {
    const contentOffsetX =
      event.nativeEvent.contentOffset.x;
    const page = Math.ceil(
      contentOffsetX / SCREEN_WIDTH + 1
    ); // 스크롤 위치에 따라 페이지 계산
    setCurrentPage(page);
  };

  // 이 부분에 상수 정의
  const categories = [
    '시사',
    '정치',
    '게임',
    '스포츠',
    '음식',
    '반려동물',
  ];

  useEffect(() => {
    setUpdateDM(updateDM2);
  }, [updateDM2]);

  useEffect(() => {
    socket = new WebSocket(
      'wss://port-0-capstone-project-gj8u2llon19kg3.sel5.cloudtype.app/test?uid=' +
        userId
    );

    socket.onmessage = (event) => {
      const receivedMessage = event.data;
      console.log(
        '서버로부터 받은 메시지 :',
        receivedMessage
      );
      console.log('u1 :', updateDM);
      // 메시지를 화면에 출력
      setMessages((prevMessages) => [
        ...prevMessages,
        receivedMessage,
      ]);
      // Check if the message contains "새로운 쪽지가 도착했습니다."
      const isNewMessage = receivedMessage.includes(
        '새로운 쪽지가 도착했습니다.'
      );
      console.log('isNewMessage:', isNewMessage);

      if (isNewMessage) {
        // Increment updateDM by 1
        setUpdateDM(updateDM + 1);
      }
      console.log('u2 :', updateDM);

      // 여긴 숫자 구하는거
      //숫자를 추출하여 상태로 저장
      const match = receivedMessage.match(
        /읽지 않은 쪽지의 개수: (\d+)/
      );

      if (match) {
        const count = parseInt(match[1], 10);
        setUnreadMessageCount(count);
      }
    };
  }, [updateDM]);

  // 쪽지 받아오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          'https://port-0-capstone-project-gj8u2llon19kg3.sel5.cloudtype.app/message/read/all/' +
            nickname,
          {
            headers: {
              'AUTH-TOKEN': jwtToken,
            },
          }
        );

        if (response.status === 200) {
          // Assuming the response data is an array of messages
          const messagesData = response.data;
          console.log(
            JSON.stringify(response.data, null, 2)
          );
          // Extracting and mapping relevant data from the response
          const formattedMessages = messagesData.map(
            (message) => ({
              username: message.sender,
              time: message.sendTime,
              title: message.content,
              isRead: message.readStatus,
              commentId: message.commentId || null,
            })
          );

          setMessages(formattedMessages);
        } else {
          console.error(
            'Failed to fetch messages:',
            response.data
          );
        }
      } catch (error) {
        console.error('쪽지 데이터 가져오기:', error);
      }
    };
    // Call the fetchData function to fetch messages when the component mounts
    fetchData();
  }, [updateDM]);

  // 투표 데이터 받아오기
  useFocusEffect(
    React.useCallback(() => {
      console.log('닉변 ', nickname);
      const voteData = async () => {
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
            console.log(
              JSON.stringify(response.data, null, 2)
            );

            if (Array.isArray(votesData)) {
              const formattedVotes = votesData.map(
                (vote) => ({
                  id: vote.id,
                  mediaUrl: vote.mediaUrl,
                  createdBy: vote.createdBy,
                  voteStatus: vote.voteStatus,
                  createdAt: moment
                    .utc(
                      vote.createdAt,
                      'YYYY.MM.DD HH:mm:ss'
                    )
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

              // Set votes only if there is data
              if (formattedVotes.length > 0) {
                setVotes(formattedVotes);
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
          //console.error('투표 데이터 가져오기:', error);
        }
      };

      // Call the voteData function to fetch votes when the screen is focused
      voteData();
    }, [jwtToken]) // Add any dependencies that should trigger a re-fetch
  );

  const handleProfilePress = () => {
    if (isLoggedIn) {
      // 이미 로그인된 상태에서 이미지 클릭 시 ProfileScreen으로 넘어가기
      navigation.navigate('ProfileScreen', {
        isLoggedIn,
        userId,
        jwtToken,
        nickname,
        updateDM2: updateDM,
      });
      console.log('유저 페이지 이동:', userId);
      console.log('유저 페이지 이동:', isLoggedIn);
      console.log('nickname:', nickname);
      console.log('jwtToken:', jwtToken);
    }
  };
  const handlePress = () => {
    if (isLoggedIn) {
      navigation.navigate('DMboxScreen', {
        isLoggedIn: true,
        userId,
        jwtToken,
        nickname,
        updateDM2: updateDM + 1,
      });
      console.log('쪽지함으로 간다', updateDM);
      console.log('유저 페이지 이동:', userId);
      console.log('유저 페이지 이동:', isLoggedIn);
      console.log('nickname:', nickname);
      console.log('jwtToken:', jwtToken);
    }
  };

  const renderPostPress = async (
    category,
    firstMatchingVote
  ) => {
    try {
      // Fetch user votes from the backend
      const response = await axios.get(
        'https://port-0-capstone-project-gj8u2llon19kg3.sel5.cloudtype.app/votes/ok/' +
          nickname,
        {
          headers: {
            'AUTH-TOKEN': jwtToken,
          },
        }
      );

      if (response.status === 200) {
        //console.log('내가 투표한 데이터', response.data);
        const userVotes = response.data;

        // Check if userVotes is null or empty
        if (!userVotes || userVotes.length === 0) {
          const isCreatedByUser =
            firstMatchingVote.createdBy === nickname;

          // Check if the vote is closed
          const isVoteEnd =
            firstMatchingVote.voteStatus === 'CLOSED';

          // Navigate to the appropriate screen based on voting status, createdBy, and voteStatus
          if (isVoteEnd) {
            // If the vote is closed, navigate to 'VoteEnd'
            navigation.navigate('VoteEnd', {
              vote: firstMatchingVote,
              isLoggedIn,
              userId,
              jwtToken,
              nickname,
              updateDM2,
              userVotes,
            });
          } else if (isCreatedByUser) {
            // If the user created the vote, navigate to 'VoteCreatedUser'
            navigation.navigate('VoteCreatedUser', {
              vote: firstMatchingVote,
              isLoggedIn,
              userId,
              jwtToken,
              nickname,
              updateDM2,
              userVotes,
            });
          } else {
            // If userVotes is null or empty, navigate to 'VoteBefore'
            navigation.navigate('VoteBefore', {
              initialPage: 1,
              vote: firstMatchingVote,
              isLoggedIn,
              userId,
              jwtToken,
              nickname,
              updateDM2,
            });
          }
        } else {
          // Continue with the existing logic for non-empty userVotes
          const isCreatedByUser =
            firstMatchingVote.createdBy === nickname;

          // Check if the vote is closed
          const isVoteEnd =
            firstMatchingVote.voteStatus === 'CLOSED';
          // Ensure vote.category is defined
          const category = firstMatchingVote.category || '';
          // Check if the user has voted for the selected poll
          const hasVoted = userVotes.some(
            (userVote) =>
              userVote.pollId === firstMatchingVote.id
          );
          // Navigate to the appropriate screen based on voting status, createdBy, and voteStatus
          navigation.navigate(
            isVoteEnd
              ? 'VoteEnd'
              : isCreatedByUser
              ? 'VoteCreatedUser'
              : hasVoted
              ? 'VoteAfter'
              : 'VoteBefore',
            {
              initialPage: 1,
              category,
              vote: firstMatchingVote,
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
  const renderPost = (
    category,
    title,
    likesCount,
    index
  ) => {
    // Filter out votes without likesCount
    const filteredVotes = votes.filter(
      (vote) => vote.likesCount !== undefined
    );

    // Sort votes based on likesCount in descending order, then by createdAt in descending order
    const sortedVotes = filteredVotes.sort((a, b) => {
      if (b.likesCount !== a.likesCount) {
        return b.likesCount - a.likesCount;
      } else {
        return (
          new Date(b.createdAt) - new Date(a.createdAt)
        );
      }
    });

    // Render only the top three votes
    if (index < 3 && index < sortedVotes.length) {
      const vote = sortedVotes[index];

      if (vote) {
        return (
          <TouchableOpacity
            key={`${category}-${title}-${index}`}
            onPress={() => renderPostPress(category, vote)}
          >
            <View>
              <Image
                source={require('./assets/box.png')}
                style={styles.box}
              />
              <View style={styles.boxinbox}>
                <View>
                  <Text style={styles.boxintitle}>
                    {vote.category}
                  </Text>
                  <Text style={styles.boxintext}>
                    {JSON.parse(vote.title).title}
                  </Text>
                </View>
                <View style={styles.boxinbox2}>
                  <Image
                    source={require('./assets/good.png')}
                    style={styles.goodbtn}
                  />
                  <Text style={styles.goodnum}>
                    {vote.likesCount}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        );
      } else {
        // Display "없음" when there are no votes for the current index
        return (
          <View key={`no-votes-${index}`}>
            <Image
              source={require('./assets/box.png')}
              style={styles.box}
            />
            <View style={styles.boxinbox}>
              <View>
                <Text style={styles.boxintitle}>없음</Text>
                <Text style={styles.boxintext}>없음</Text>
              </View>
              <View style={styles.boxinbox2}>
                <Image
                  source={require('./assets/good.png')}
                  style={styles.goodbtn}
                />
                <Text style={styles.goodnum}></Text>
              </View>
            </View>
          </View>
        );
      }
    } else {
      // If index is outside the valid range
      return null;
    }
  };

  const handleCategoryPress = (selectedCategory) => {
    // Filter votes for the selected category
    const filteredVotes = votes.filter(
      (vote) => vote.category === selectedCategory
    );

    // Navigate to CategoryScreen with category and filteredVotes
    navigation.navigate('CategoryScreen', {
      category: selectedCategory,
      isLoggedIn,
      userId,
      jwtToken,
      nickname,
      updateDM2,
      filteredVotes,
      votes,
    });
  };

  return (
    <View>
      <ScrollView vertical={true}>
        <View style={styles.main_Page}>
          <View style={styles.main_Row}>
            <Text style={styles.main_title}>
              투표는 DO표
            </Text>
            <View style={styles.after_login_view}>
              <TouchableOpacity onPress={handlePress}>
                <FontAwesome5
                  name="bell"
                  size={24}
                  color="black"
                  style={styles.alarm_btn}
                />
                <Text style={styles.alarm_text}>
                  {unreadMessageCount}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleProfilePress}
              >
                <Feather
                  name="user"
                  size={28}
                  color="black"
                  style={styles.profile_btn}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.main_Row}>
            <Text style={styles.popular_vote_title}>
              인기 투표
            </Text>
          </View>
          <ScrollView
            horizontal={true}
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollViewContent}
            onScroll={handleScroll}
          >
            {votes.map(
              ({ category, title, likesCount }, index) =>
                renderPost(
                  category,
                  title,
                  likesCount,
                  index
                )
            )}
          </ScrollView>
          <PageIndicator
            currentPage={currentPage}
            totalPages={totalPages}
          />
          <View style={styles.main_Row}>
            <Text style={styles.category_}>
              카테고리별 투표
            </Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('AllCategoryScreen', {
                  isLoggedIn,
                  userId,
                  jwtToken,
                  nickname,
                  updateDM2: updateDM2 + 1,
                  categories: [
                    '정치',
                    '경제',
                    '스포츠',
                    '문화와예술',
                    '시사',
                    '게임',
                    '반려동물',
                    '음식',
                  ],
                })
              }
            >
              <View style={styles.main_Row}>
                <Text style={styles.category_plus}>
                  더보기
                </Text>
                <AntDesign
                  name="right"
                  size={10}
                  color="#BDBDBD"
                  style={styles.category_arrow}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('SearchScreen', {
                  isLoggedIn,
                  userId,
                  jwtToken,
                  nickname,
                  updateDM2,
                })
              }
            >
              <MaterialCommunityIcons
                name="text-search"
                size={22}
                color="black"
                style={styles.category_search}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.category_box}>
            <View style={styles.category_title_box}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  onPress={() =>
                    handleCategoryPress(category)
                  }
                >
                  <View style={styles.category_sub_box}>
                    <Text
                      style={styles.category_title_text}
                    >
                      {category}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.category_sub_title_box}>
              {categories.map((category) => {
                // Filter votes that match the current category
                const matchingVotes = votes.filter(
                  (vote) => vote.category === category
                );

                // Sort matching votes by createdAt in descending order
                matchingVotes.sort(
                  (a, b) =>
                    new Date(b.createdAt) -
                    new Date(a.createdAt)
                );

                // Use a Set to keep track of shown titles
                const shownTitles = new Set();

                // Find the first matching vote that has not been shown yet
                const firstMatchingVote =
                  matchingVotes.find((vote) => {
                    if (!shownTitles.has(vote.title)) {
                      shownTitles.add(vote.title);
                      return true;
                    }
                    return false;
                  });

                return (
                  <TouchableOpacity
                    key={`${category}-${
                      firstMatchingVote?.title || nickname
                    }`}
                    onPress={async () => {
                      try {
                        // Fetch user votes from the backend
                        const response = await axios.get(
                          'https://port-0-capstone-project-gj8u2llon19kg3.sel5.cloudtype.app/votes/ok/' +
                            nickname,
                          {
                            headers: {
                              'AUTH-TOKEN': jwtToken,
                            },
                          }
                        );

                        if (response.status === 200) {
                          console.log(
                            '응답 데이터',
                            response.data
                          );
                          const userVotes = response.data;

                          // Check if userVotes is null or empty
                          if (
                            !userVotes ||
                            userVotes.length === 0
                          ) {
                            const isCreatedByUser =
                              firstMatchingVote?.createdBy ===
                                nickname || false;

                            const isVoteEnd =
                              firstMatchingVote?.voteStatus ===
                                'CLOSED' || false;

                            // Navigate to the appropriate screen based on voting status, createdBy, and voteStatus
                            if (isVoteEnd) {
                              // If the vote is closed, navigate to 'VoteEnd'
                              navigation.navigate(
                                'VoteEnd',
                                {
                                  vote: firstMatchingVote,
                                  isLoggedIn,
                                  userId,
                                  jwtToken,
                                  nickname,
                                  updateDM2,
                                }
                              );
                            } else if (isCreatedByUser) {
                              // If the user created the vote, navigate to 'VoteCreatedUser'
                              navigation.navigate(
                                'VoteCreatedUser',
                                {
                                  vote: firstMatchingVote,
                                  isLoggedIn,
                                  userId,
                                  jwtToken,
                                  nickname,
                                  updateDM2,
                                }
                              );
                            } else {
                              // If userVotes is null or empty, navigate to 'VoteBefore'
                              navigation.navigate(
                                'VoteBefore',
                                {
                                  initialPage: 1,
                                  vote: firstMatchingVote,
                                  isLoggedIn,
                                  userId,
                                  jwtToken,
                                  nickname,
                                  updateDM2,
                                }
                              );
                            }
                          } else {
                            // Continue with the existing logic for non-empty userVotes
                            const isCreatedByUser =
                              firstMatchingVote?.createdBy ===
                                nickname || false;

                            const isVoteEnd =
                              firstMatchingVote?.voteStatus ===
                                'CLOSED' || false;
                            const category =
                              firstMatchingVote?.category ||
                              '';
                            const hasVoted = userVotes.some(
                              (userVote) =>
                                userVote.pollId ===
                                firstMatchingVote.id
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
                                initialPage: 1,
                                category,
                                vote: firstMatchingVote,
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
                        console.error(
                          '투표 들어가려는데 오류:',
                          error
                        );
                      }
                    }}
                  >
                    <View style={styles.category_sub_box}>
                      <Text
                        style={
                          styles.category_sub_title_text
                        }
                      >
                        {JSON.parse(
                          firstMatchingVote?.title || '{}'
                        ).title || ''}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>
      <TouchableOpacity
        style={styles.write_post_btn}
        onPress={() =>
          navigation.navigate('VoteMake', {
            isLoggedIn,
            userId,
            jwtToken,
            nickname,
            updateDM2: updateDM + 1,
          })
        }
      >
        <Feather
          name="plus-square"
          size={45}
          color="#007BFF"
        />
      </TouchableOpacity>
    </View>
  );
};
