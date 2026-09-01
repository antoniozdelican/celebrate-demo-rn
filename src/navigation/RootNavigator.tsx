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
        // No headerStyle.backgroundColor on purpose: setting it makes
        // react-native-screens use an opaque appearance for every state,
        // losing UIKit's own blur behaviour.
        headerShadowVisible: false,
        headerTitleStyle: { ...typography.heading, color: colors.textPrimary },
        headerTintColor: colors.primary,
        // Android left-aligns by default; centre both to match.
        headerTitleAlign: 'center',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="UsersList" component={UsersListScreen} options={{ title: 'Users' }} />
      <Stack.Screen
        name="UserDetail"
        component={UserDetailScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
