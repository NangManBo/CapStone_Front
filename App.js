import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from './HomeScreen'; // 메인 페이지
import { CategoryScreen } from './CategoryScreen'; // 세부 카테고리 페이지
import { LoginScreen } from './LoginScreen'; // 로그인 페이지
import { SignUpScreen } from './SignUpScreen'; // 회원가입 페이지
import { SearchScreen } from './SearchScreen'; // 게시글 검색 페이지
import { AllCategoryScreen } from './AllCategoryScreen'; // 모든 카테고리 종류 페이지
import { DMboxScreen } from './DMboxScreen'; // 쪽지함 임시 페이지
import { DMScreen } from './DMScreen'; // 쪽지 내용 임시 페이지
import { DMSendScreen } from './DMSendScreen'; // 쪽지 보내기 페이지
import { DMAutoSendScreen } from './DMAutoSendScreen'; // 쪽지 보내기 페이지
import { AutoSendScreen } from './AutoSendScreen'; // 쪽지 보내기 페이지
import { ProfileScreen } from './ProfileScreen'; // 유저 프로필 페이지 -
import { UserAuthenticationScreen } from './UserAuthenticationScreen'; // 유저 인증 페이지
import { ProfileUpdateScreen } from './ProfileUpdateScreen'; // 유저 프로필 업데이트 페이지
import { VoteBefore } from './VoteBefore'; // 투표 수행하기 전에 보여주는 페이지
import { VoteCreatedUser } from './VoteCreatedUser'; // 투표 수행하기 전에 보여주는 페이지
import { VoteEnd } from './VoteEnd'; // 투표 수행하기 전에 보여주는 페이지
import { VoteAfter } from './VoteAfter'; // 투표 수행하고 나서 보여주는 페이지
import { VoteMake } from './VoteMake'; // 투표 생성페이지

// 상태 표시줄의 글씨를 어둡게 만듭니다.
StatusBar.setBarStyle('dark-content');
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="LoginScreen"
          component={LoginScreen}
          options={{
            headerShown: false, // 화면 상단에 헤더를 숨김
            gestureEnabled: false,
          }}
        />

        <Stack.Screen
          name="VoteBefore"
          component={VoteBefore}
          options={{
            headerShown: false, // 화면 상단에 헤더를 숨김
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="VoteEnd"
          component={VoteEnd}
          options={{
            headerShown: false, // 화면 상단에 헤더를 숨김
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="VoteCreatedUser"
          component={VoteCreatedUser}
          options={{
            headerShown: false, // 화면 상단에 헤더를 숨김
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="VoteAfter"
          component={VoteAfter}
          options={{
            headerShown: false, // 화면 상단에 헤더를 숨김
            gestureEnabled: false,
          }}
        />

        <Stack.Screen
          name="VoteMake"
          component={VoteMake}
          options={{
            headerShown: false, // 화면 상단에 헤더를 숨김
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{
            headerShown: false, // 화면 상단에 헤더를 숨김
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="AllCategoryScreen"
          component={AllCategoryScreen}
          options={{
            headerShown: false, // 화면 상단에 헤더를 숨김
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="ProfileScreen"
          component={ProfileScreen}
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="UserAuthenticationScreen"
          component={UserAuthenticationScreen}
          options={{
            headerShown: false, // 화면 상단에 헤더를 숨김
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="ProfileUpdateScreen"
          component={ProfileUpdateScreen}
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="SearchScreen"
          component={SearchScreen}
          options={{
            headerShown: false, // 화면 상단에 헤더를 숨김
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="DMboxScreen"
          component={DMboxScreen}
          options={{
            headerShown: false, // 화면 상단에 헤더를 숨김
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="DMScreen"
          component={DMScreen}
          options={{
            headerShown: false, // 화면 상단에 헤더를 숨김
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="DMSendScreen"
          component={DMSendScreen}
          options={{
            headerShown: false, // 화면 상단에 헤더를 숨김
          }}
        />
        <Stack.Screen
          name="DMAutoSendScreen"
          component={DMAutoSendScreen}
          options={{
            headerShown: false, // 화면 상단에 헤더를 숨김
          }}
        />
        <Stack.Screen
          name="AutoSendScreen"
          component={AutoSendScreen}
          options={{
            headerShown: false, // 화면 상단에 헤더를 숨김
          }}
        />
        <Stack.Screen
          name="SignUpScreen"
          component={SignUpScreen}
          options={{
            headerShown: false, // 화면 상단에 헤더를 숨김
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="CategoryScreen"
          component={CategoryScreen}
          options={{
            headerShown: false, // 화면 상단에 헤더를 숨김
            gestureEnabled: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
