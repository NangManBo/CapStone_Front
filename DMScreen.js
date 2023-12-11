import React, { useState } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { styles } from './styles';
import { Entypo } from '@expo/vector-icons';

export const DMScreen = ({ navigation, route }) => {
  const {
    isLoggedIn,
    userId,
    isRead,
    nickname,
    jwtToken,
    messageId,
    item,
    setUnreadMessageCount,
    updateDM2,
  } = route.params;

  const unreadMessageCount =
    route.params.unreadMessageCount;

  const hi = () => {
    navigation.navigate('DMboxScreen', {
      isLoggedIn: true,
      userId,
      isRead,
      nickname,
      jwtToken,
      unreadMessageCount,
      updateDM2: updateDM2 + 1,
    });
    console.log('messageId', item.username);
    console.log('DMbox로 간다 : ', updateDM2);
    console.log('보낸 시간 :', item.time);
    console.log('item 전체 :', item);
  };
  return (
    <View style={styles.main_page}>
      <View style={styles.main_Row15}>
        <View style={styles.back_view14}>
          <TouchableOpacity onPress={hi}>
            <AntDesign
              name="arrowleft"
              size={24}
              color="black"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.dm_username}>
          {/* 상단에 item.username의 값을 표시 */}
          <View style={styles.dm_username_view}>
            <Text style={styles.dm_username_text}>
              {item.username}의 쪽지
            </Text>
          </View>
          <View style={styles.dm_send_view}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('DMAutoSendScreen', {
                  isLoggedIn: true,
                  userId,
                  nickname,
                  jwtToken,
                  item,
                  unreadMessageCount, // 숫자를 DMboxScreen으로 전달
                  updateDM2,
                })
              }
            >
              <Entypo
                name="pencil"
                size={24}
                color="black"
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.dm_sendtime}>
          {/* 상단에 item.username의 값을 표시 */}
          <Text>전송일시 {item.time}</Text>
        </View>
      </View>

      <View style={styles.dm_content}>
        {/* 중간 부분에 item.title의 값을 표시 */}
        <Text style={styles.dm_content_text}>
          {item.title}
        </Text>

        {/* 그 외 DMScreen의 내용을 추가할 수 있습니다. */}
      </View>
    </View>
  );
};
