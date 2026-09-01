import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { UserDetail } from '@/features/users/api/users.types';
import { UserDetailHeader } from '@/features/users/components/UserDetailHeader';
import { useUserDetail } from '@/features/users/hooks/useUserDetail';
import { testIDs } from '@/lib/testIDs';
import type { RootStackParamList } from '@/navigation/types';
import { spacing } from '@/theme/tokens';
import { DetailField } from '@/ui/DetailField';
import { DetailSection } from '@/ui/DetailSection';
import { Screen } from '@/ui/Screen';
import { ErrorState } from '@/ui/states/ErrorState';
import { LoadingState } from '@/ui/states/LoadingState';

type Props = NativeStackScreenProps<RootStackParamList, 'UserDetail'>;

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

/**
 * `1996-05-30` -> `30 May 1996`. Done by hand rather than via Intl so the
 * output is identical on both platforms regardless of locale data.
 */
function formatBirthDate(iso: string | null): string | null {
  if (!iso) return null;
  const [year, month, day] = iso.split('-').map(Number);
  if (!year || !month || !day) return null;
  return `${day} ${MONTHS[month - 1] ?? ''} ${year}`.trim();
}

function capitalise(value: string | null): string | null {
  if (!value) return null;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Street, city, state, postcode and country as one readable block. */
function formatLocation(address: UserDetail['address']): string | null {
  if (!address) return null;
  return [
    address.street,
    address.city,
    `${address.state} ${address.postalCode}`.trim(),
    address.country,
  ]
    .filter((part) => part.length > 0)
    .join(', ');
}

export function UserDetailScreen({ route, navigation }: Props) {
  const { userId } = route.params;
  const insets = useSafeAreaInsets();
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

  const { company, physical } = user;

  return (
    <Screen testID={testIDs.userDetail.screen} edges={[]}>
      <UserDetailHeader
        scrollY={scrollY}
        fullName={user.fullName}
        headline={user.headline}
        avatarUrl={user.avatarUrl}
        backTitle="Users"
        onBack={navigation.goBack}
      />

      <Animated.ScrollView
        testID={testIDs.userDetail.scroll}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
      >
        {company ? (
          <DetailSection title="Work">
            <DetailField label="Company" value={company.name} />
            <DetailField label="Title" value={company.title} />
            <DetailField label="Department" value={company.department} />
          </DetailSection>
        ) : null}

        <DetailSection title="Contact">
          <DetailField label="Email" value={user.email} />
          <DetailField label="Phone" value={user.phone} />
          <DetailField label="Username" value={user.username} />
        </DetailSection>

        {user.address ? (
          <DetailSection title="Address">
            <DetailField label="Location" value={formatLocation(user.address)} />
          </DetailSection>
        ) : null}

        <DetailSection title="Personal">
          <DetailField label="Age" value={user.age === null ? null : String(user.age)} />
          <DetailField label="Gender" value={capitalise(user.gender)} />
          <DetailField label="Born" value={formatBirthDate(user.birthDate)} />
          <DetailField label="University" value={user.university} />
          <DetailField label="Blood group" value={physical.bloodGroup} />
          <DetailField
            label="Height"
            value={physical.height === null ? null : `${physical.height} cm`}
          />
          <DetailField
            label="Weight"
            value={physical.weight === null ? null : `${physical.weight} kg`}
          />
          <DetailField label="Eye color" value={physical.eyeColor} />
        </DetailSection>
      </Animated.ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.xl },
});
