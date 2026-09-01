import { fireEvent, screen } from '@testing-library/react-native';

import { renderWithProviders } from '@/test/renderWithProviders';
import { Button } from '@/ui/Button';

describe('Button', () => {
  it('renders its label and fires onPress', () => {
    const onPress = jest.fn();
    renderWithProviders(<Button testID="btn" label="Save" onPress={onPress} />);

    expect(screen.getByText('Save')).toBeOnTheScreen();

    fireEvent.press(screen.getByTestId('btn'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire onPress when disabled', () => {
    const onPress = jest.fn();
    renderWithProviders(<Button testID="btn" label="Save" onPress={onPress} disabled />);

    fireEvent.press(screen.getByTestId('btn'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('swaps the label for a spinner while loading and blocks presses', () => {
    const onPress = jest.fn();
    renderWithProviders(<Button testID="btn" label="Save" onPress={onPress} loading />);

    // Guards against double submission while a request is in flight.
    expect(screen.queryByText('Save')).not.toBeOnTheScreen();
    expect(screen.getByTestId('btn-spinner')).toBeOnTheScreen();

    fireEvent.press(screen.getByTestId('btn'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('exposes accessibility state for disabled and loading', () => {
    renderWithProviders(<Button testID="btn" label="Save" loading />);

    const button = screen.getByTestId('btn');
    expect(button).toBeDisabled();
    expect(button).toBeBusy();
  });

  it.each(['primary', 'secondary', 'ghost'] as const)('renders the %s variant', (variant) => {
    renderWithProviders(<Button testID="btn" label="Save" variant={variant} />);
    expect(screen.getByTestId('btn')).toBeOnTheScreen();
  });
});
