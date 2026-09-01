import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { RootStackParamList } from '@/navigation/types';
import { UserDetailScreen } from '@/features/users/screens/UserDetailScreen';
import { UsersListScreen } from '@/features/users/screens/UsersListScreen';
import { colors, typography } from '@/theme/tokens';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        // Deliberately no headerStyle.backgroundColor: setting it makes
        // react-native-screens configure an opaque appearance, which applies
        // the same separator to standardAppearance and scrollEdgeAppearance.
        // Leaving it to UIKit restores the native behaviour — no hairline at
        // the top, blur and separator fading in once content scrolls under.
        headerTitleStyle: { ...typography.heading, color: colors.textPrimary },
        headerTintColor: colors.primary,
        // Android defaults to a left-aligned title; centring both keeps the
        // two platforms visually comparable.
        headerTitleAlign: 'center',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="UsersList" component={UsersListScreen} options={{ title: 'Users' }} />
      <Stack.Screen
        name="UserDetail"
        component={UserDetailScreen}
        options={{
          // The custom collapsible header supplies its own title.
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}
