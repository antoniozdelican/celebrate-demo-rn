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
 * Real timers throughout.
 *
 * Fake timers deadlock here: RNTL's `waitFor` drives the clock itself, while
 * MSW resolves responses on the microtask queue, so the two starve each other.
 * The debounce is only 350ms, so waiting it out costs almost nothing.
 */
function renderScreen() {
  const navigate = jest.fn();
  const navigation = { navigate, goBack: jest.fn() } as unknown as Props['navigation'];
  const route = { key: 'UsersList', name: 'UsersList', params: undefined } as Props['route'];

  const utils = renderWithProviders(<UsersListScreen navigation={navigation} route={route} />);
  return { ...utils, navigate };
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('UsersListScreen', () => {
  it('shows a loading state and then renders the first page', async () => {
    renderScreen();

    expect(screen.getByTestId(testIDs.usersList.loading)).toBeOnTheScreen();

    await waitFor(() => expect(screen.getByText('First1 Last1')).toBeOnTheScreen());
    expect(screen.queryByTestId(testIDs.usersList.loading)).not.toBeOnTheScreen();
  });

  it('collapses a burst of typing into a single search request', async () => {
    let searchRequests = 0;
    server.use(
      http.get(`${API_BASE_URL}/users/search`, ({ request }) => {
        searchRequests += 1;
        const url = new URL(request.url);
        return HttpResponse.json(
          makeUsersPage({
            total: url.searchParams.get('q') === 'first1' ? 1 : 0,
            skip: Number(url.searchParams.get('skip') ?? 0),
            limit: Number(url.searchParams.get('limit') ?? 30),
          }),
        );
      }),
    );

    renderScreen();
    await waitFor(() => expect(screen.getByText('First1 Last1')).toBeOnTheScreen());

    const input = screen.getByTestId(testIDs.usersList.searchInput);
    fireEvent.changeText(input, 'f');
    fireEvent.changeText(input, 'fi');
    fireEvent.changeText(input, 'first1');

    await waitFor(() => expect(searchRequests).toBe(1));

    // Give the discarded keystrokes their full debounce window to prove they
    // never fire a request of their own.
    await wait(500);
    expect(searchRequests).toBe(1);
  });

  it('replaces the list with search results and restores it on clear', async () => {
    renderScreen();
    await waitFor(() => expect(screen.getByText('First2 Last2')).toBeOnTheScreen());

    fireEvent.changeText(screen.getByTestId(testIDs.usersList.searchInput), 'first1');

    // The mock resolves 'first1' to exactly one match, so the rest fall away.
    await waitFor(() => expect(screen.queryByText('First2 Last2')).not.toBeOnTheScreen());
    expect(screen.getByText('First1 Last1')).toBeOnTheScreen();

    fireEvent.press(screen.getByTestId(testIDs.usersList.searchClear));

    await waitFor(() => expect(screen.getByText('First2 Last2')).toBeOnTheScreen());
  });

  it('shows an empty state when a search matches nothing', async () => {
    renderScreen();
    await waitFor(() => expect(screen.getByText('First1 Last1')).toBeOnTheScreen());

    fireEvent.changeText(screen.getByTestId(testIDs.usersList.searchInput), 'nobody');

    await waitFor(() => expect(screen.getByTestId(testIDs.usersList.empty)).toBeOnTheScreen());
    expect(screen.getByText(/No users match/)).toBeOnTheScreen();
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

  it('navigates to the detail screen with the tapped user id', async () => {
    const { navigate } = renderScreen();
    await waitFor(() => expect(screen.getByText('First3 Last3')).toBeOnTheScreen());

    fireEvent.press(screen.getByTestId(testIDs.usersList.row(3)));

    expect(navigate).toHaveBeenCalledWith('UserDetail', { userId: 3 });
  });
});
