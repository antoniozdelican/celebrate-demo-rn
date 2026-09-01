import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { HttpResponse, http } from 'msw';

import { UserDetailScreen } from '@/features/users/screens/UserDetailScreen';
import { API_BASE_URL } from '@/lib/httpClient';
import { testIDs } from '@/lib/testIDs';
import type { RootStackParamList } from '@/navigation/types';
import { makeUserDetail } from '@/test/mocks/users.fixtures';
import { renderWithProviders } from '@/test/renderWithProviders';
import { server } from '@/test/mocks/server';

type Props = NativeStackScreenProps<RootStackParamList, 'UserDetail'>;

function renderScreen(userId = 1) {
  const goBack = jest.fn();
  const navigation = { goBack, navigate: jest.fn(), setOptions: jest.fn() } as unknown as Props['navigation'];
  const route = { key: 'UserDetail', name: 'UserDetail', params: { userId } } as Props['route'];

  const utils = renderWithProviders(<UserDetailScreen navigation={navigation} route={route} />);
  return { ...utils, goBack };
}

describe('UserDetailScreen', () => {
  it('shows a loading state, then renders the user', async () => {
    renderScreen(1);

    expect(screen.getByTestId(testIDs.userDetail.loading)).toBeOnTheScreen();

    await waitFor(() => expect(screen.getByText('user1@example.com')).toBeOnTheScreen());
    expect(screen.queryByTestId(testIDs.userDetail.loading)).not.toBeOnTheScreen();
  });

  it('groups details into the sections the design calls for', async () => {
    renderScreen(1);
    await waitFor(() => expect(screen.getByText('user1@example.com')).toBeOnTheScreen());

    for (const caption of ['WORK', 'CONTACT', 'ADDRESS', 'PERSONAL']) {
      expect(screen.getByText(caption)).toBeOnTheScreen();
    }
  });

  it('formats the birth date and capitalises gender', async () => {
    server.use(
      http.get(`${API_BASE_URL}/users/:id`, () =>
        HttpResponse.json(makeUserDetail(1, { birthDate: '1996-05-30', gender: 'female' })),
      ),
    );

    renderScreen(1);

    await waitFor(() => expect(screen.getByText('30 May 1996')).toBeOnTheScreen());
    expect(screen.getByText('Female')).toBeOnTheScreen();
  });

  it('renders the address as a single readable line', async () => {
    renderScreen(1);

    await waitFor(() =>
      expect(
        screen.getByText('1 Test Street, Testville, Teststate 12345, United States'),
      ).toBeOnTheScreen(),
    );
  });

  it('surfaces an error state and recovers on retry', async () => {
    let shouldFail = true;
    server.use(
      http.get(`${API_BASE_URL}/users/:id`, () => {
        if (shouldFail) return HttpResponse.json({ message: 'Server exploded' }, { status: 500 });
        return HttpResponse.json(makeUserDetail(1));
      }),
    );

    renderScreen(1);
    await waitFor(() => expect(screen.getByTestId(testIDs.userDetail.error)).toBeOnTheScreen());

    shouldFail = false;
    fireEvent.press(screen.getByTestId(testIDs.userDetail.errorRetry));

    await waitFor(() => expect(screen.getByText('user1@example.com')).toBeOnTheScreen());
  });

  it('shows the error state for a user that does not exist', async () => {
    renderScreen(99999);

    await waitFor(() => expect(screen.getByTestId(testIDs.userDetail.error)).toBeOnTheScreen());
    // A 404 is not retried, so the message surfaces immediately.
    expect(screen.getByText(/not found/i)).toBeOnTheScreen();
  });

  it('omits fields the API did not return rather than rendering blanks', async () => {
    server.use(
      http.get(`${API_BASE_URL}/users/:id`, () =>
        HttpResponse.json(makeUserDetail(1, { university: undefined, phone: undefined })),
      ),
    );

    renderScreen(1);
    await waitFor(() => expect(screen.getByText('user1@example.com')).toBeOnTheScreen());

    expect(screen.queryByText('University')).not.toBeOnTheScreen();
    expect(screen.queryByText('Phone')).not.toBeOnTheScreen();
  });
});
