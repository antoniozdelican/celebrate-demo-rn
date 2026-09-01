import { by, device, element, expect as detoxExpect, waitFor } from 'detox';

import { testIDs } from '@/lib/testIDs';

/** Generous, because a cold list fetch on a slow emulator is not instant. */
const VISIBLE_TIMEOUT_MS = 20_000;

/**
 * The search field is the platform's native control, and
 * react-native-screens' SearchBarProps exposes no testID — so this is the one
 * place the suite has to match by native type rather than by test id.
 *
 * iOS renders a UISearchBar; Android renders the SearchView's inner
 * SearchAutoComplete. If either matcher drifts with a library upgrade, this is
 * the only line to change.
 */
function searchField() {
  return device.getPlatform() === 'ios'
    ? element(by.type('UISearchBar'))
    : element(by.type('androidx.appcompat.widget.SearchView$SearchAutoComplete'));
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

    // Emily Johnson is id 1 in the DummyJSON dataset, which is deterministic.
    await waitFor(element(by.id(testIDs.usersList.row(1))))
      .toBeVisible()
      .withTimeout(VISIBLE_TIMEOUT_MS);
  });

  it('filters the list via search and resets on clear', async () => {
    await waitFor(element(by.id(testIDs.usersList.row(1))))
      .toBeVisible()
      .withTimeout(VISIBLE_TIMEOUT_MS);

    // Android collapses the SearchView to an icon until it is tapped.
    await searchField().tap();
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

  it('opens the detail screen and drives the animated section', async () => {
    await waitFor(element(by.id(testIDs.usersList.row(1))))
      .toBeVisible()
      .withTimeout(VISIBLE_TIMEOUT_MS);

    await element(by.id(testIDs.usersList.row(1))).tap();

    await waitFor(element(by.id(testIDs.userDetail.screen)))
      .toBeVisible()
      .withTimeout(VISIBLE_TIMEOUT_MS);

    // The expandable section is asserted rather than the collapsing header:
    // a tap-driven reveal produces a binary visible/not-visible outcome, while
    // asserting a header mid-collapse would depend on scroll physics.
    await detoxExpect(element(by.id(testIDs.userDetail.expandContent))).not.toBeVisible();

    await element(by.id(testIDs.userDetail.expandToggle)).tap();

    await waitFor(element(by.id(testIDs.userDetail.expandContent)))
      .toBeVisible()
      .withTimeout(VISIBLE_TIMEOUT_MS);

    await element(by.id(testIDs.userDetail.expandToggle)).tap();
    await waitFor(element(by.id(testIDs.userDetail.expandContent)))
      .not.toBeVisible()
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

    // The compact title cross-fades in only once the header has collapsed, so
    // its visibility is an observable proxy for the animation having run.
    await detoxExpect(element(by.id(testIDs.userDetail.compactTitle))).not.toBeVisible();

    await element(by.id(testIDs.userDetail.scroll)).scroll(300, 'down');

    await waitFor(element(by.id(testIDs.userDetail.compactTitle)))
      .toBeVisible()
      .withTimeout(VISIBLE_TIMEOUT_MS);
  });
});
