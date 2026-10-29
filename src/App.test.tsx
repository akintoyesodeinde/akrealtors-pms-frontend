import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('AkRealtors PMS Application Shell', () => {
  it('renders the application heading accessibly', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /AkRealtors PMS/i })).toBeInTheDocument();
  });
});
