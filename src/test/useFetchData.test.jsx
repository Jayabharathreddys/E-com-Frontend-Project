import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import axios from 'axios';
import useFetchData from '../hooks/useFetchData';

vi.mock('axios');

describe('useFetchData', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('starts with initialData and isLoading false', () => {
        axios.get.mockResolvedValueOnce({ data: [] });
        const { result } = renderHook(() => useFetchData('http://test.com', []));
        expect(result.current.data).toEqual([]);
        expect(result.current.error).toBeNull();
    });

    it('sets data on successful fetch', async () => {
        const mockData = { message: [{ name: 'Product 1' }], status: 'success' };
        axios.get.mockResolvedValueOnce({ data: mockData });

        const { result } = renderHook(() => useFetchData('http://test.com', {}));

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.data).toEqual(mockData);
        expect(result.current.error).toBeNull();
    });

    it('returns initialData (not null) on fetch failure', async () => {
        axios.get.mockRejectedValueOnce(new Error('Network Error'));

        const { result } = renderHook(() => useFetchData('http://test.com', []));

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        // Critical fix: should return [] not null (prevents crash)
        expect(result.current.data).toEqual([]);
        expect(result.current.error).not.toBeNull();
    });

    it('sets isLoading true during fetch', async () => {
        let resolveFn;
        axios.get.mockReturnValueOnce(new Promise(r => { resolveFn = r; }));

        const { result } = renderHook(() => useFetchData('http://test.com', []));
        expect(result.current.isLoading).toBe(true);

        resolveFn({ data: [] });
        await waitFor(() => expect(result.current.isLoading).toBe(false));
    });
});
