import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';

import type { RootStackParamList } from '@/navigation/types';
import { DetailRow } from '@/features/users/components/DetailRow';
import { UserDetailHeader } from '@/features/users/components/UserDetailHeader';
import { useUserDetail } from '@/features/users/hooks/useUserDetail';
import { testIDs } from '@/lib/testIDs';
import { spacing } from '@/theme/tokens';
import { Card } from '@/ui/Card';
import { ExpandableSection } from '@/ui/ExpandableSection';
import { Screen } from '@/ui/Screen';
import { ErrorState } from '@/ui/states/ErrorState';
import { LoadingState } from '@/ui/states/LoadingState';
import { Text } from '@/ui/Text';

type Props = NativeStackScreenProps<RootStackParamList, 'UserDetail'>;

export function UserDetailScreen({ route, navigation }: Props) {
  const { userId } = route.params;
  const { data: user, isPending, isError, error, refetch } = useUserDetail(userId);

  // Written by the scroll handler on the UI thread and read by the header's
  // animated styles — the JS thread is never involved in the collapse.
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  if (isPending) {
    return (
      <Screen testID={testIDs.userDetail.screen} edges={['top', 'bottom']}>
        <LoadingState testID={testIDs.userDetail.loading} />
      </Screen>
    );
  }

  if (isError || !user) {
    return (
      <Screen testID={testIDs.userDetail.screen} edges={['top', 'bottom']}>
        <ErrorState
          testID={testIDs.userDetail.error}
          retryTestID={testIDs.userDetail.errorRetry}
          title="Could not load user"
          message={error instanceof Error ? error.message : undefined}
          onRetry={() => void refetch()}
        />
      </Screen>
    );
  }

  const { address, company, physical } = user;

  return (
    <Screen testID={testIDs.userDetail.screen} edges={['bottom']}>
      <UserDetailHeader
        scrollY={scrollY}
        fullName={user.fullName}
        headline={user.headline}
        avatarUrl={user.avatarUrl}
        onBack={navigation.goBack}
      />

      <Animated.ScrollView
        testID={testIDs.userDetail.scroll}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.content}
      >
        <Card style={styles.card}>
          <Text variant="label" style={styles.cardTitle}>
            Contact
          </Text>
          <DetailRow label="Email" value={user.email} />
          <DetailRow label="Phone" value={user.phone} />
          <DetailRow label="Username" value={user.username} />
        </Card>

        {company ? (
          <Card style={styles.card}>
            <Text variant="label" style={styles.cardTitle}>
              Company
            </Text>
            <DetailRow label="Name" value={company.name} />
            <DetailRow label="Title" value={company.title} />
            <DetailRow label="Department" value={company.department} />
          </Card>
        ) : null}

        {address ? (
          <Card style={styles.card}>
            <Text variant="label" style={styles.cardTitle}>
              Address
            </Text>
            <DetailRow label="Street" value={address.street} />
            <DetailRow label="City" value={address.city} />
            <DetailRow label="State" value={`${address.state} ${address.postalCode}`.trim()} />
            <DetailRow label="Country" value={address.country} />
          </Card>
        ) : null}

        <Card style={styles.card} padded={false}>
          <View style={styles.expandable}>
            <ExpandableSection
              title="More details"
              toggleTestID={testIDs.userDetail.expandToggle}
              contentTestID={testIDs.userDetail.expandContent}
            >
              <DetailRow label="Age" value={user.age === null ? null : String(user.age)} />
              <DetailRow label="Gender" value={user.gender} />
              <DetailRow label="Birth date" value={user.birthDate} />
              <DetailRow label="University" value={user.university} />
              <DetailRow label="Blood group" value={physical.bloodGroup} />
              <DetailRow
                label="Height"
                value={physical.height === null ? null : `${physical.height} cm`}
              />
              <DetailRow
                label="Weight"
                value={physical.weight === null ? null : `${physical.weight} kg`}
              />
              <DetailRow label="Eye color" value={physical.eyeColor} />
            </ExpandableSection>
          </View>
        </Card>
      </Animated.ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  card: { gap: spacing.xs },
  cardTitle: { marginBottom: spacing.xs },
  expandable: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
});
