import { render, screen } from '@testing-library/react';
import App from './App';

test('renders landing page heading', () => {
  render(<App />);

  expect(
    screen.getByRole('heading', { name: /welcome to vindex/i })
  ).toBeInTheDocument();
});
