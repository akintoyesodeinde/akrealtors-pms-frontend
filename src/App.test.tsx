import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { marketplaceApi } from './api/marketplaceApi';
import { App } from './App';

describe('AkRealtors PMS Application Shell', () => {
  it('renders the public marketplace home hero and navigation accessibly', async () => {
    vi.spyOn(marketplaceApi, 'getStates').mockResolvedValue([{ code: 'LA', name: 'Lagos' }]);
    vi.spyOn(marketplaceApi, 'getFeaturedProperties').mockResolvedValue([]);

    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<App queryClient={qc} initialEntries={['/']} skipInitialSessionBootstrap />);

    expect(
      screen.getByRole('heading', {
        name: /Discover Verified Homes, Land & Commercial Properties Across Nigeria/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /Primary navigation/i })).toBeInTheDocument();
    expect(await screen.findByText(/No published property offers yet/i)).toBeInTheDocument();
  });
});
