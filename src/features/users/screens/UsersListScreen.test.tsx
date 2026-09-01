import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { HttpResponse, http } from 'msw';

import { UsersListScreen } from '@/features/users/screens/UsersListScreen';
import { API_BASE_URL } from '@/lib/httpClient';
import { testIDs } from '@/lib/testIDs';
import type { RootStackParamList } from '@/navigation/types';
import { makeUsersPage } from '@/test/mocks/users.fixtures';
import { renderWithProviders } from '@/test/renderWithProviders';
import { server } from '@/test/mocks/server';

type Props = NativeStackScreenProps<RootStackParamList, 'UsersList'>;

/**
 * Search is deliberately absent here. The field is the platform's native
 * search control, which renders outside the React tree and exposes no testID,
 * so search behaviour is covered by useUserSearch (debounce) and useUsersList
 * (list vs. search fetching) instead.
 */
function renderScreen() {
  const navigate = jest.fn();
  const setOptions = jest.fn();
  const navigation = { navigate, setOptions, goBack: jest.fn() } as unknown as Props['navigation'];
  const route = { key: 'UsersList', name: 'UsersList', params: undefined } as Props['route'];

  const utils = renderWithProviders(<UsersListScreen navigation={navigation} route={route} />);
  return { ...utils, navigate, setOptions };
}

describe('UsersListScreen', () => {
  it('shows a loading state and then renders the first page', async () => {
    renderScreen();

    expect(screen.getByTestId(testIDs.usersList.loading)).toBeOnTheScreen();

    await waitFor(() => expect(screen.getByText('First1 Last1')).toBeOnTheScreen());
    expect(screen.queryByTestId(testIDs.usersList.loading)).not.toBeOnTheScreen();
  });

  it('registers the native search bar with the navigator', async () => {
    const { setOptions } = renderScreen();
    await waitFor(() => expect(screen.getByText('First1 Last1')).toBeOnTheScreen());

    expect(setOptions).toHaveBeenCalled();
    const options = setOptions.mock.calls[0]?.[0] as {
      headerSearchBarOptions?: { placeholder?: string; hideWhenScrolling?: boolean };
    };
    expect(options.headerSearchBarOptions?.placeholder).toBe('Search users');
    expect(options.headerSearchBarOptions?.hideWhenScrolling).toBe(false);
  });

  it('surfaces an error state and recovers on retry', async () => {
    let shouldFail = true;
    server.use(
      http.get(`${API_BASE_URL}/users`, ({ request }) => {
        if (shouldFail) return HttpResponse.json({ message: 'Server exploded' }, { status: 500 });
        const url = new URL(request.url);
        return HttpResponse.json(
          makeUsersPage({
            total: 1,
            skip: Number(url.searchParams.get('skip') ?? 0),
            limit: Number(url.searchParams.get('limit') ?? 30),
          }),
        );
      }),
    );

    renderScreen();
    await waitFor(() => expect(screen.getByTestId(testIDs.usersList.error)).toBeOnTheScreen());

    shouldFail = false;
    fireEvent.press(screen.getByTestId(testIDs.usersList.errorRetry));

    await waitFor(() => expect(screen.getByText('First1 Last1')).toBeOnTheScreen());
  });

  it('renders an empty state when the API returns no users', async () => {
    server.use(
      http.get(`${API_BASE_URL}/users`, () =>
        HttpResponse.json({ users: [], total: 0, skip: 0, limit: 30 }),
      ),
    );

    renderScreen();

    await waitFor(() => expect(screen.getByTestId(testIDs.usersList.empty)).toBeOnTheScreen());
  });

  it('navigates to the detail screen with the tapped user id', async () => {
    const { navigate } = renderScreen();
    await waitFor(() => expect(screen.getByText('First3 Last3')).toBeOnTheScreen());

    fireEvent.press(screen.getByTestId(testIDs.usersList.row(3)));

    expect(navigate).toHaveBeenCalledWith('UserDetail', { userId: 3 });
  });
});
