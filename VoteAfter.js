import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Video } from 'expo-av';
import { AntDesign, Entypo } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { TextInput } from 'react-native';
import { styles } from './styles';
import axios from 'axios'; // Import axios for HTTP requests
import { KeyboardAvoidingView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; // import
import { MaterialIcons } from '@expo/vector-icons';
import RNPickerSelect from 'react-native-picker-select';

export const VoteAfter = ({ navigation, route }) => {
  const { vote, userId, isLoggedIn, jwtToken, nickname, userVotes, updateDM2 } =
    route.params;

  const [updateDM5, setUpdateDM5] = useState(1); // 이동 변수
  const [comments, setComments] = useState([]); // 댓글
  const [pollOptions, setPollOptions] = useState([]);
  const newChoices = vote.choice.map((choice) => ({
    id: choice.id,
    text: choice.text,
    votes: 0, // 초기 투표 수를 0으로 설정
  }));
  const [commentText, setCommentText] = useState('');
  const [commentError, setCommentError] = useState('');
  const [heartType, setHeartType] = useState('empty');
  const [isReplyMode, setIsReplyMode] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyingIndex, setReplyingIndex] = useState(null);

  const [sameOption, setSameOption] = useState([]);
  const placeholder = {
    label: '댓글 보기',
    value: null,
  };

  const standards = [
    { label: '최신 순', value: '시간' },
    { label: '인기 순', value: '인기' },
  ];
  const [standard, setStandard] = useState('');
  const [sortedComments, setSortedComments] = useState([]);

  const sortComments = (sortingStandard) => {
    if (comments && comments.length > 0) {
      let sorted = [...comments];

      if (sortingStandard === '시간') {
        sorted.sort((a, b) => new Date(a.time) - new Date(b.time));
        setSortedComments(sorted.reverse());
      } else if (sortingStandard === '인기') {
        sorted.sort((a, b) => b.likes - a.likes);
        setSortedComments(sorted);
      }
    }
  };

  useEffect(() => {
    sortComments(standard);
  }, [comments, standard]);

  // Check if the current user's nickname is in the likedUsers array
  useEffect(() => {
    if (vote.likedUsers && vote.likedUsers.includes(nickname)) {
      setHeartType('filled');
    }
  }, [vote, nickname]);

  //게시글 좋아요
  const handleHeartClick = async () => {
    const data = {
      pollId: vote.id,
      nickname: nickname,
    };

    console.log(data);

    try {
      const response = await axios.post(
        'https://port-0-capstone-project-gj8u2llon19kg3.sel5.cloudtype.app/polls/likes',
        data,
        {
          headers: {
            'AUTH-TOKEN': jwtToken,
          },
        }
      );

      if (response.status === 200) {
        console.log(response.data);

        setHeartType((prev) => (prev === 'empty' ? 'filled' : 'empty'));
      } else {
        console.error('Failed to likes:', response.data);
      }
    } catch (error) {
      console.error('게시글 좋아요 :', error);
    }

    console.log('userVotes : ', userVotes);
    console.log('vote : ', vote);
  };

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

          const formattedComments = parentComments.map((parentComment) => {
            parentComment.childrenComment = childComments.filter(
              (childComment) =>
                childComment.parentComment.id === parentComment.id
            );
            return parentComment;
          });

          setComments(formattedComments);
          sortComments(standard);
        } else {
        }
      } catch (error) {
        console.error('댓글 조회하기 가져오기:', error);
      }
    };
    fetchcommentData();
  }, [updateDM5, standard]);

  // 같은 투표 한 사람
  useEffect(() => {
    const groupData = async () => {
      const isSelectedByUserArray = [];

      vote.choice.map((choice) => {
        const isSelectedByUser = userVotes.some(
          (userVote) => userVote.choiceId === choice.id
        );

        isSelectedByUserArray.push({
          choiceId: choice.id,
          isSelectedByUser: isSelectedByUser,
        });
      });

      const newSameOption = []; // 새로운 배열을 만듭니다.

      isSelectedByUserArray.forEach(async (item) => {
        const customValue = item.isSelectedByUser ? item.choiceId : 0;

        try {
          const response = await axios.get(
            'https://port-0-capstone-project-gj8u2llon19kg3.sel5.cloudtype.app/votes/user-nicknames/' +
              vote.id +
              '/' +
              customValue +
              '/' +
              nickname,
            {
              headers: {
                'AUTH-TOKEN': jwtToken,
              },
            }
          );

          if (response.status === 200) {
            const userNames = response.data;

            // 가져온 데이터를 newSameOption에 추가합니다.
            newSameOption.push({
              choiceId: item.choiceId,
              userNames: userNames,
            });
          } else {
          }
        } catch (error) {
          console.error('댓글 조회하기 가져오기:', error);
        }
      });

      // 모든 작업이 끝난 후 state를 업데이트합니다.
      setSameOption(newSameOption);
      console.log(sameOption);
    };

    groupData();
  }, [updateDM5]);

  // 이미지 또는 동영상 선택 시 처리
  const handleMediaPick = (result) => {
    const selectedAssets = result.assets;
    if (selectedAssets.length > 0) {
      const selectedMediaUri = selectedAssets[0].uri;
      console.log('Selected Image URI:', selectedMediaUri);
      setSelectedMedia(selectedMediaUri);
    }
  };

  // 사진 고른거 삭제
  const cancelImage = () => {
    setSelectedImage(null);
  };

  // 사진 및 동영상 선택
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
        console.log('Selected Media is a video:', result.assets[0].uri);
      }
    }
  };

  // 댓글 작성
  const handleCommentSubmit = async () => {
    try {
      if (!commentText.trim()) {
        alert('댓글 내용을 입력하세요.');
        return;
      }

      let formData = new FormData();

      // Add comment content as a string

      formData.append('content', JSON.stringify({ content: commentText }));
      formData.append('uid', JSON.stringify({ uid: userId }));
      formData.append('pollId', JSON.stringify({ pollId: vote.id }));

      if (selectedMedia) {
        const localUri = selectedMedia;
        const filename = localUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename ?? '');
        const type = match ? `image/${match[1]}` : 'image';

        const response = await fetch(localUri);
        const blob = await response.blob();

        // Append the image data to FormData with the key "mediaData"
        formData.append('mediaData', {
          uri: localUri,
          name: filename,
          type: type,
          blob: blob,
        });
      }

      const response = await fetch(
        'https://port-0-capstone-project-gj8u2llon19kg3.sel5.cloudtype.app/api/comments/' +
          userId +
          '/' +
          vote.id,
        {
          method: 'POST',
          headers: {
            //'Content-Type': 'multipart/form-data',
            'AUTH-TOKEN': jwtToken,
          },
          body: formData,
        }
      );

      const responseBody = await response.text();

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        setSelectedMedia(null);
        if (contentType && contentType.includes('application/json')) {
          const data = JSON.parse(responseBody);

          console.log('댓글 작성 성공:', data);
        } else {
          console.log('댓글 작성 성공');
        }

        setUpdateDM5(updateDM5 + 1);
        setCommentText('');
      } else {
        console.error('댓글 작성 실패:', response.status);
      }
    } catch (error) {
      console.error('댓글 작성 오류:', error);
    }
  };

  //댓글 출력 창
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
      <View key={index} style={styles.VoteAfter_View3_comment_all_view}>
        <View style={styles.VoteAfter_View3_comment_view1}>
          <View style={styles.VoteAfter_View3_comment}>
            <Text style={styles.VoteAfter_View3_nickname}>
              작성자 : {comment.nickname}
            </Text>
            <Text style={styles.VoteAfter_View3_commenttime}>
              작성시간: {comment.time}
            </Text>
          </View>

          <View>
            <View>
              <Text style={styles.VoteAfter_View3_text}>{comment.content}</Text>
            </View>

            {comment.mediaUrl && (
              <View style={styles.ivstyle}>
                {comment.mediaUrl.endsWith('.mp4') ? (
                  <TouchableOpacity onPress={handlePlayPause}>
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
            <TouchableOpacity onPress={() => commentLike(comment, index)}>
              <AntDesign name="like2" size={18} color="blue" />
            </TouchableOpacity>
            <Text style={styles.VoteAfter_View3_totalLikenumber}>
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
                    <TouchableOpacity onPress={showReplyPress}>
                      <MaterialIcons
                        name="comment"
                        size={24}
                        color="black"
                        style={styles.send_mesage_btn1}
                      />
                    </TouchableOpacity>
                  )}
                <TouchableOpacity
                  onPress={() => handleReplyPress(comment, index)}
                >
                  <MaterialIcons
                    name="add-comment"
                    size={24}
                    color="black"
                    style={styles.send_mesage_btn2}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handlemessge(comment)}>
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
          comment.childrenComment.map((childComment, childIndex) => (
            <View key={childIndex} style={styles.VoteAfter_View3_reply_comment}>
              <View style={styles.VoteAfter_View3_comment}>
                <Text style={styles.VoteAfter_View3_nickname}>
                  작성자 : {childComment.nickname}
                </Text>
                <Text style={styles.VoteAfter_View3_commenttime}>
                  작성시간: {childComment.time}
                </Text>
              </View>
              <View>
                <Text style={styles.VoteAfter_View3_text}>
                  {childComment.content}
                </Text>
                {childComment.mediaUrl && (
                  <>
                    {childComment.mediaUrl.endsWith('.mp4') ? (
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
              <View style={styles.VoteAfter_View3_totalLike}>
                <TouchableOpacity
                  onPress={() => commentLike(childComment, index, childIndex)}
                >
                  <AntDesign name="like2" size={18} color="blue" />
                </TouchableOpacity>

                <Text style={styles.VoteAfter_View3_totalLikenumber}>
                  {childComment.likes}
                </Text>
                {sameOption.some((option) =>
                  option.userNames.includes(childComment.nickname)
                ) && (
                  <Text style={styles.sameVoteText}>
                    (나와 동일한 선택지를 골랐습니다)
                  </Text>
                )}
                <TouchableOpacity onPress={() => handlemessge1(childComment)}>
                  <Feather
                    style={styles.send_mesage_btn4}
                    name="send"
                    size={22}
                    color="black"
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))}
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
        console.log('댓글 좋아요 성공', JSON.stringify(response.data, null, 2));
      } else {
        console.error('댓글 좋아요 실패', response.data);
      }
    } catch (error) {
      console.error('댓글 좋아요 보내기:', error);
    }
  };

  // 대댓글
  const handleReplyPress = (comment, index) => {
    if (replyingIndex === index) {
      // If the reply button is pressed again, reset to a regular comment
      setReplyingIndex(null);
      setReplyText('');
      setIsReplyMode(false); // Turn off reply mode
    } else {
      // Set the replying index and pre-fill the reply input with the username
      setReplyingIndex(index);
      setReplyText(`@${comment.nickname} `);
      setIsReplyMode(true); // Turn on reply mode
    }
    setShowReplyInput(true);
    setCommentText(''); // Reset regular comment text
  };

  // 대댓글 작성
  const handleAddReplySubmit = async () => {
    try {
      if (replyText.trim() === '') {
        setCommentError('답글 내용을 입력하세요.');
        return;
      }
      if (!isReplyMode || replyingIndex === null) {
        console.error('Invalid reply mode or replying index.');
        return;
      }
      let formData = new FormData();
      const parentCommentId = comments[replyingIndex].id; // Get the parent comment ID

      formData.append('content', JSON.stringify({ content: replyText }));
      if (selectedMedia) {
        const localUri = selectedMedia;
        const filename = localUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename ?? '');
        const type = match ? `image/${match[1]}` : 'image';

        const response = await fetch(localUri);
        const blob = await response.blob();

        // Append the image data to FormData with the key "mediaData"
        formData.append('mediaData', {
          uri: localUri,
          name: filename,
          type: type,
          blob: blob,
        });
      }
      const response = await fetch(
        `https://port-0-capstone-project-gj8u2llon19kg3.sel5.cloudtype.app/api/comments/${userId}/${vote.id}/${parentCommentId}`,
        {
          method: 'POST',
          headers: {
            //'Content-Type': 'multipart/form-data',
            'AUTH-TOKEN': jwtToken,
          },
          body: formData,
        }
      );

      const responseBody = await response.text();

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        setSelectedMedia(null);
        if (contentType && contentType.includes('application/json')) {
          const data = JSON.parse(responseBody);

          console.log('댓글 작성 성공:', data);
        } else {
          console.log('댓글 작성 성공');
        }

        setUpdateDM5(updateDM5 + 1);
        setIsReplyMode(false);
        setCommentText('');
      } else {
        console.error('댓글 작성 실패:', response.status);
      }
    } catch (error) {
      console.error('댓글 작성 오류:', error);
    }

    setShowReplyInput(false);
    setReplyingIndex(null);
    setCommentError('');
  };
  // 뒤로 돌아가기
  const handleGoBack = () => {
    // navigation.goBack()을 호출하여 이전 화면으로 이동
    navigation.goBack({});
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={
        Platform.OS === 'ios'
          ? styles.keyboardVerticalOffsetIOS.marginTop
          : styles.keyboardVerticalOffsetAndroid.marginTop
      }
      style={styles.status_x}
    >
      <View style={styles.main_Row12}>
        <View style={styles.back_view12}>
          <TouchableOpacity onPress={handleGoBack}>
            <AntDesign name="arrowleft" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <View style={styles.btns}>
          <TouchableOpacity
            onPress={handleHeartClick}
            style={styles.VoteBefore_View1_heart}
          >
            {heartType === 'empty' ? (
              <Entypo name="heart-outlined" size={30} color="black" />
            ) : (
              <Entypo name="heart" size={30} color="red" />
            )}
          </TouchableOpacity>
          {/* 좋아요 버튼: 클릭시 색상변경 */}
        </View>
      </View>
      <ScrollView>
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
            <Text style={styles.VoteCreatedUser_View2_Content}>
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
          {/* 본문내용 표시 */}

          {vote.choice.map((choice) => {
            const isSelectedByUser = userVotes.some(
              (userVote) => userVote.choiceId === choice.id
            );

            return (
              <View
                key={choice.id}
                style={[
                  styles.VoteBefore_View2_Votebotton2,
                  {
                    backgroundColor: isSelectedByUser
                      ? '#4B89DC'
                      : 'transparent',
                  },
                ]}
              >
                <Text
                  style={{
                    color: isSelectedByUser ? 'white' : 'black',
                  }}
                >
                  {choice.text}
                </Text>
              </View>
            );
          })}

          <View style={styles.comment_count}>
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
                onValueChange={(itemValue) => setStandard(itemValue)}
                items={standards}
                style={{
                  inputIOS: styles.standard_select_ios,
                  inputAndroid: styles.standard_select_and,
                }}
              />
            </View>
          </View>
          {/* 댓글수 표시 */}

          {/* 댓글정렬버튼 */}
          <View style={styles.VoteBefore_View2_Row1}></View>
          {/* 댓글창 경계선 */}

          <View>
            {sortedComments.map((comment, index) => (
              <Comment key={index} comment={comment} index={index} />
            ))}
          </View>
          {/* 댓글출력창 */}

          <View>
            {commentError !== '' && (
              <Text style={styles.VoteAfter_View3_error}>{commentError}</Text>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.VoteAfter_View3_comment_View}>
        <View style={styles.VoteAfter_View3_comment}>
          {selectedMedia && (
            <Image
              source={{ uri: selectedMedia }}
              style={{
                marginLeft: 10,
                width: 50,
                height: 50,
              }}
            />
          )}
          {/* 댓글입력창 */}
          <TouchableOpacity
            onPress={() => {
              setComments([...comments, commentText]);
              setCommentText('');
            }}
          ></TouchableOpacity>
        </View>
        <View style={styles.VoteAfter_View3_commenttext_View}>
          <View>
            <TextInput
              style={styles.VoteAfter_View3_commenttext}
              placeholder={
                isReplyMode ? '답글을 입력하세요.' : '댓글을 입력하세요.'
              }
              value={isReplyMode ? replyText : commentText}
              onChangeText={(text) => {
                isReplyMode ? setReplyText(text) : setCommentText(text);
                setCommentError('');
              }}
            />
          </View>
          <View style={styles.main_Row}>
            <TouchableOpacity
              style={styles.VoteAfter_View3_textinput}
              onPress={isReplyMode ? handleAddReplySubmit : handleCommentSubmit}
            >
              <Entypo name="direction" size={24} color="#4B89DC" />
            </TouchableOpacity>
            {/* 댓글 입력버튼 */}
            <TouchableOpacity
              style={styles.VoteAfter_View3_comment_image}
              onPress={pickMedia}
            >
              <AntDesign name="picture" size={28} color="black" />
            </TouchableOpacity>
            {/* 댓글사진추가버튼 */}

            <TouchableOpacity
              style={styles.VoteAfter_View3_comment_image1}
              onPress={cancelImage}
            >
              <Text style={styles.xtext}>x</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {/* 댓글입력창 텍스트 */}
    </KeyboardAvoidingView>
  );
};
