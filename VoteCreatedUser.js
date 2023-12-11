import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Video } from 'expo-av';
//import Video from 'react-native-video';
import { AntDesign, Entypo } from '@expo/vector-icons';
import { styles } from './styles';
import axios from 'axios'; // Import axios for HTTP requests
import { Feather } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import RNPickerSelect from 'react-native-picker-select';

export const VoteCreatedUser = ({ navigation, route }) => {
  const {
    category,
    vote,
    userId,
    isLoggedIn,
    jwtToken,
    nickname,
    updateDM2,
  } = route.params;

  const [updateDM5, setUpdateDM5] = useState(1); // 이동 변수

  const placeholder = {
    label: '정렬 기준',
    value: null,
  };

  const standards = [
    { label: '최신 순', value: '시간' },
    { label: '인기 순', value: '인기' },
  ];

  const [comments, setComments] = useState([]); // 댓글
  const [sortedComments, setSortedComments] = useState([]);
  const [standard, setStandard] = useState('');
  const [pollOptions, setPollOptions] = useState([]);
  const [showReply, setShowReply] = useState(false);
  const [sameOption, setSameOption] = useState([]);

  // 투표 선택지
  useEffect(() => {
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
  useEffect(() => {
    sortComments(standard);
  }, [comments, standard]);

  // 댓글에서 쪽지 보내기
  const handlemessge = (comment) => {
    navigation.navigate('AutoSendScreen', {
      isLoggedIn: true,
      userId,
      jwtToken,
      nickname,
      updateDM2,
      commentId: comment.id,
      receiverName: comment.nickname,
    });
  };
  // 대댓글에서 쪽지 보내기
  const handlemessge1 = (childComment) => {
    navigation.navigate('AutoSendScreen', {
      isLoggedIn: true,
      userId,
      jwtToken,
      nickname,
      updateDM2,
      commentId: childComment.id,
      receiverName: childComment.nickname,
    });
  };
  // 댓글 추가될 때마다 조회
  useEffect(() => {
    // 페이지 처음 로드될 때 실행
    const fetchcommentData = async () => {
      console.log(vote);
      try {
        const response = await axios.get(
          'https://port-0-capstone-project-gj8u2llon19kg3.sel5.cloudtype.app/api/comments/poll/' +
            vote.id,
          {
            headers: {
              'AUTH-TOKEN': jwtToken,
            },
          }
        );

        if (response.status === 200) {
          const commentData = response.data;

          const parentComments = commentData.filter(
            (comment) => comment.parentComment === null
          );
          const childComments = commentData.filter(
            (comment) => comment.parentComment !== null
          );

          const formattedComments = parentComments.map(
            (parentComment) => {
              parentComment.childrenComment =
                childComments.filter(
                  (childComment) =>
                    childComment.parentComment.id ===
                    parentComment.id
                );
              return parentComment;
            }
          );

          setComments(formattedComments);
          sortComments(standard || '');
        } else {
        }
      } catch (error) {
        console.error('댓글 조회하기 가져오기:', error);
      }
    };
    fetchcommentData();
  }, []);
  // 댓글 정렬
  const sortComments = (sortingStandard) => {
    if (comments && comments.length > 0) {
      let sorted = [...comments];

      if (sortingStandard === '') {
        sorted.sort(
          (a, b) => new Date(a.time) - new Date(b.time)
        );
        setSortedComments(sorted);
      } else if (sortingStandard === '시간') {
        sorted.sort(
          (a, b) => new Date(a.time) - new Date(b.time)
        );
        setSortedComments(sorted.reverse());
      } else if (sortingStandard === '인기') {
        sorted.sort((a, b) => b.likes - a.likes);
        setSortedComments(sorted);
      }
    }
  };
  // 뒤로가기
  const handleGoBack = () => {
    // navigation.goBack()을 호출하여 이전 화면으로 이동
    navigation.goBack({});
  };
  // 댓글창
  const Comment = ({ comment, index }) => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const handlePlayPause = () => {
      if (videoRef.current) {
        if (isPlaying) {
          videoRef.current.pauseAsync();
        } else {
          videoRef.current.playAsync();
        }
        setIsPlaying(!isPlaying);
      }
    };
    const showReplyPress = () => {
      setShowReply((prevShowReply) => ({
        ...prevShowReply,
        [comment.id]: !prevShowReply[comment.id],
      }));
    };
    return (
      <View
        key={index}
        style={styles.VoteAfter_View3_comment_all_view}
      >
        <View style={styles.VoteAfter_View3_comment_view1}>
          <View style={styles.VoteAfter_View3_comment}>
            <Text style={styles.VoteAfter_View3_nickname}>
              작성자 : {comment.nickname}
            </Text>
            <Text
              style={styles.VoteAfter_View3_commenttime}
            >
              작성시간: {comment.time}
            </Text>
          </View>

          <View>
            <View>
              <Text style={styles.VoteAfter_View3_text}>
                {comment.content}
              </Text>
            </View>

            {comment.mediaUrl && (
              <View style={styles.ivstyle}>
                {comment.mediaUrl.endsWith('.mp4') ? (
                  <TouchableOpacity
                    onPress={handlePlayPause}
                  >
                    <Video
                      ref={videoRef}
                      source={{ uri: comment.mediaUrl }}
                      style={styles.videoStyle}
                      useNativeControls
                      resizeMode="contain"
                      isLooping
                      shouldPlay={isPlaying}
                    />
                  </TouchableOpacity>
                ) : (
                  <Image
                    source={{ uri: comment.mediaUrl }}
                    style={styles.imageStyle}
                  />
                )}
              </View>
            )}
          </View>
          <View style={styles.VoteAfter_View3_totalLike}>
            <TouchableOpacity
              onPress={() => commentLike(comment, index)}
            >
              <AntDesign
                name="like2"
                size={18}
                color="blue"
              />
            </TouchableOpacity>
            <Text
              style={styles.VoteAfter_View3_totalLikenumber}
            >
              {comment.likes}
            </Text>
            {/* '답글' 버튼 */}
            {sameOption.some((option) =>
              option.userNames.includes(comment.nickname)
            ) && (
              <Text style={styles.sameVoteText}>
                (나와 동일한 선택지를 골랐습니다)
              </Text>
            )}
            <View>
              <View style={styles.send_message_btn_view1}>
                {comment.childrenComment &&
                  comment.childrenComment.length > 0 && (
                    <TouchableOpacity
                      onPress={showReplyPress}
                    >
                      <MaterialIcons
                        name="comment"
                        size={24}
                        color="black"
                        style={styles.send_mesage_btn1}
                      />
                    </TouchableOpacity>
                  )}
                <TouchableOpacity
                  onPress={() => handlemessge(comment)}
                >
                  <Feather
                    name="send"
                    size={22}
                    color="black"
                    style={styles.send_mesage_btn3}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
        {/* 자식 댓글 렌더링 */}
        {showReply[comment.id] &&
          comment.childrenComment &&
          comment.childrenComment.map(
            (childComment, childIndex) => (
              <View
                key={childIndex}
                style={styles.VoteAfter_View3_reply_comment}
              >
                <View
                  style={styles.VoteAfter_View3_comment}
                >
                  <Text
                    style={styles.VoteAfter_View3_nickname}
                  >
                    작성자 : {childComment.nickname}
                  </Text>
                  <Text
                    style={
                      styles.VoteAfter_View3_commenttime
                    }
                  >
                    작성시간: {childComment.time}
                  </Text>
                </View>
                <View>
                  <Text style={styles.VoteAfter_View3_text}>
                    {childComment.content}
                  </Text>
                  {childComment.mediaUrl && (
                    <>
                      {childComment.mediaUrl.endsWith(
                        '.mp4'
                      ) ? (
                        <Video
                          source={{
                            uri: childComment.mediaUrl,
                          }}
                          style={styles.videoStyle}
                          useNativeControls
                          resizeMode="contain"
                          isLooping
                          shouldPlay
                        />
                      ) : (
                        <Image
                          source={{
                            uri: childComment.mediaUrl,
                          }}
                          style={styles.imageStyle}
                        />
                      )}
                    </>
                  )}
                </View>
                <View
                  style={styles.VoteAfter_View3_totalLike}
                >
                  <TouchableOpacity
                    onPress={() =>
                      commentLike(
                        childComment,
                        index,
                        childIndex
                      )
                    }
                  >
                    <AntDesign
                      name="like2"
                      size={18}
                      color="blue"
                    />
                  </TouchableOpacity>

                  <Text
                    style={
                      styles.VoteAfter_View3_totalLikenumber
                    }
                  >
                    {childComment.likes}
                  </Text>
                  {sameOption.some((option) =>
                    option.userNames.includes(
                      childComment.nickname
                    )
                  ) && (
                    <Text style={styles.sameVoteText}>
                      (나와 동일한 선택지를 골랐습니다)
                    </Text>
                  )}
                  <TouchableOpacity
                    onPress={() =>
                      handlemessge1(childComment)
                    }
                  >
                    <Feather
                      style={styles.send_mesage_btn4}
                      name="send"
                      size={22}
                      color="black"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )
          )}
      </View>
    );
  };
  // 댓글 좋아요
  const commentLike = async (comment, index) => {
    console.log('comment ', comment.id);
    try {
      const response = await axios.post(
        `https://port-0-capstone-project-gj8u2llon19kg3.sel5.cloudtype.app/api/comments/like/${userId}/${vote.id}/${comment.id}`,
        {}, // Empty object as the request body
        {
          headers: {
            'AUTH-TOKEN': jwtToken,
          },
        }
      );
      // Increment updateDM by 1
      setUpdateDM5(updateDM5 + 1);

      console.log('변경 전', updateDM5);
      if (response.status === 200) {
        console.log('변경 후', updateDM5);
        console.log(
          '댓글 좋아요 성공',
          JSON.stringify(response.data, null, 2)
        );
      } else {
        console.error('댓글 좋아요 실패', response.data);
      }
    } catch (error) {
      console.error('댓글 좋아요 보내기:', error);
    }
  };
  // 투표 종료시키기
  const handleEndVote = async () => {
    console.log('pollId', vote.id, 'nickname', nickname);
    const Data = {
      pollId: vote.id,
      nickname: nickname,
    };
    try {
      const response = await axios.post(
        'https://port-0-capstone-project-gj8u2llon19kg3.sel5.cloudtype.app/polls/popularpoint',
        Data
      );
      if (response.status === 200) {
        console.log('포인트 성공');
      } else {
        console.error('포인트 실패!', response.data);
      }
    } catch (error) {}
    try {
      const response = await axios.post(
        'https://port-0-capstone-project-gj8u2llon19kg3.sel5.cloudtype.app/polls/close',
        Data,
        {
          headers: {
            'AUTH-TOKEN': jwtToken,
          },
        }
      );

      if (response.status === 200) {
        console.log('투표 종료!');
      } else {
        console.error('투표 종료 실패!', response.data);
      }
    } catch (error) {
      console.error('투표 종료 오류', error);
    }
    navigation.navigate('HomeScreen', {
      isLoggedIn: true,
      userId,
      nickname,
      jwtToken,
      updateDM2: updateDM2 + 1,
    });
    console.log('Home으로 간다~ : ', updateDM2);
  };

  return (
    <View style={styles.VoteCreatedUser_View1_Top}>
      <View style={styles.VoteCreatedUser_View1_Mainrow}>
        <View style={styles.VoteCreatedUser_View1_Backview}>
          <TouchableOpacity onPress={handleGoBack}>
            <AntDesign
              name="arrowleft"
              size={24}
              color="black"
            />
          </TouchableOpacity>
        </View>
        {/* 뒤로가기 버튼 */}
      </View>
      <ScrollView style={styles.VoteCreatedUser}>
        <View style={styles.VoteCreatedUser_View1_All}>
          <View>
            <Text
              style={styles.VoteCreatedUser_View1_Title}
            >
              {JSON.parse(vote.title).title}
            </Text>
            {/* 투표제목 */}
          </View>
          <View style={styles.text_box1}>
            <Text style={styles.VoteBefore_View1_day}>
              투표 기간 설정: {vote.createdAt}
            </Text>

            <Text style={styles.VoteBefore_View1_host}>
              주최자 : {vote.createdBy}
            </Text>
          </View>
          {/* 투표기간,주최자 */}

          <View style={styles.VoteEnd_View1_Row}></View>
          {/* 본문경계선 */}

          <View>
            {vote.mediaUrl && (
              <View style={styles.ivstyle}>
                <Image
                  source={{ uri: vote.mediaUrl }}
                  style={styles.Vote_Main_image}
                />
              </View>
            )}
            <Text
              style={styles.VoteCreatedUser_View2_Content}
            >
              {JSON.parse(vote.question).question}
            </Text>
          </View>
          {/* 본문내용 표시 */}

          <View>
            {pollOptions.map((option) => (
              <View
                key={option.id}
                style={[
                  styles.VoteCreatedUser_View2_Votebotton,
                ]}
              >
                <Text style={'dimgray'}>{option.text}</Text>
              </View>
            ))}
          </View>
          {/* 투표항목 생성버튼 */}

          <View
            style={styles.VoteCreatedUser_View2_Row}
          ></View>
          {/* 댓글창 경계선 */}

          <View>
            <Text style={styles.VoteBefore_View3_comment}>
              댓글{' '}
              {comments.reduce(
                (total, comment) =>
                  total +
                  1 +
                  (comment.childrenComment
                    ? comment.childrenComment.length
                    : 0),
                0
              )}
            </Text>
            <View style={styles.standard_view1}>
              <RNPickerSelect
                placeholder={placeholder}
                value={standard}
                onValueChange={(itemValue) =>
                  setStandard(itemValue)
                }
                items={standards}
                style={{
                  inputIOS: styles.standard_select_ios,
                  inputAndroid:
                    styles.VoteAfter_View3_Select,
                }}
              />
            </View>
          </View>
          {/* 댓글수 표시 */}

          <View>
            <TouchableOpacity
              style={
                styles.VoteCreatedUser_View3_Stopbotton
              }
              onPress={handleEndVote}
            >
              <Text
                style={
                  styles.VoteCreatedUser_View3_Stopbottontext
                }
              >
                투표 종료시키기
              </Text>
            </TouchableOpacity>
          </View>

          <View>
            {sortedComments.map((comment, index) => (
              <Comment
                key={index}
                comment={comment}
                index={index}
              />
            ))}
          </View>
          {/* 댓글출력창 */}
        </View>
      </ScrollView>
    </View>
  );
};
