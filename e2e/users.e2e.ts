import { by, device, element, expect as detoxExpect, waitFor } from 'detox';

import { testIDs } from '@/lib/testIDs';

const VISIBLE_TIMEOUT_MS = 20_000;

/**
 * The only place the suite matches by native type: SearchBarProps exposes no
 * testID. Android keeps its SearchView collapsed to a toolbar icon, so the
 * inner field is not visible until it is expanded.
 */
const isAndroid = () => device.getPlatform() === 'android';

function searchField() {
  return isAndroid()
    ? element(by.type('androidx.appcompat.widget.SearchView$SearchAutoComplete'))
    : element(by.type('UISearchBar'));
}

async function openSearch() {
  if (isAndroid()) {
    await element(by.type('com.swmansion.rnscreens.CustomSearchView')).tap();
  } else {
    await searchField().tap();
  }
}

describe('Users directory', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('loads the Home screen and renders users', async () => {
    await waitFor(element(by.id(testIDs.usersList.list)))
      .toBeVisible()
      .withTimeout(VISIBLE_TIMEOUT_MS);

    await waitFor(element(by.id(testIDs.usersList.row(1))))
      .toBeVisible()
      .withTimeout(VISIBLE_TIMEOUT_MS);
  });

  it('filters the list via search and resets on clear', async () => {
    await waitFor(element(by.id(testIDs.usersList.row(1))))
      .toBeVisible()
      .withTimeout(VISIBLE_TIMEOUT_MS);

    await openSearch();
    await searchField().typeText('Emily');

    // Row 1 matches "Emily"; row 2 (Michael Williams) must drop out.
    await waitFor(element(by.id(testIDs.usersList.row(2))))
      .not.toBeVisible()
      .withTimeout(VISIBLE_TIMEOUT_MS);
    await detoxExpect(element(by.id(testIDs.usersList.row(1)))).toBeVisible();

    await searchField().clearText();

    await waitFor(element(by.id(testIDs.usersList.row(2))))
      .toBeVisible()
      .withTimeout(VISIBLE_TIMEOUT_MS);
  });

  it('opens the detail screen from a row', async () => {
    await waitFor(element(by.id(testIDs.usersList.row(1))))
      .toBeVisible()
      .withTimeout(VISIBLE_TIMEOUT_MS);

    await element(by.id(testIDs.usersList.row(1))).tap();

    await waitFor(element(by.id(testIDs.userDetail.screen)))
      .toBeVisible()
      .withTimeout(VISIBLE_TIMEOUT_MS);
  });

  it('collapses the header as the detail screen scrolls', async () => {
    await waitFor(element(by.id(testIDs.usersList.row(1))))
      .toBeVisible()
      .withTimeout(VISIBLE_TIMEOUT_MS);
    await element(by.id(testIDs.usersList.row(1))).tap();

    await waitFor(element(by.id(testIDs.userDetail.scroll)))
      .toBeVisible()
      .withTimeout(VISIBLE_TIMEOUT_MS);

    // Visibility of the compact title is the observable proxy for the collapse.
    await detoxExpect(element(by.id(testIDs.userDetail.compactTitle))).not.toBeVisible();

    await element(by.id(testIDs.userDetail.scroll)).scroll(300, 'down');

    await waitFor(element(by.id(testIDs.userDetail.compactTitle)))
      .toBeVisible()
      .withTimeout(VISIBLE_TIMEOUT_MS);
  });
});
