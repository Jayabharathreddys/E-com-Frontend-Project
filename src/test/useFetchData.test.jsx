import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import axios from 'axios';
import useFetchData from '../hooks/useFetchData';

vi.mock('axios');

// Fix #10: parameter is now named initialData (was intialData)
describe('useFetchData', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('starts with initialData and isLoading false before fetch completes', () => {
        axios.get.mockResolvedValueOnce({ data: [] });
        const { result } = renderHook(() => useFetchData('http://test.com', []));
        // Before the async fetch resolves, data equals the initialData arg
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
        // Critical: must return [] not null to prevent downstream crashes
        expect(result.current.data).toEqual([]);
        expect(result.current.error).not.toBeNull();
    });

    it('sets isLoading true during fetch', async () => {
        let resolveFn;
        axios.get.mockReturnValueOnce(
            new Promise((r) => {
                resolveFn = r;
            })
        );

        const { result } = renderHook(() => useFetchData('http://test.com', []));
        expect(result.current.isLoading).toBe(true);

        resolveFn({ data: [] });
        await waitFor(() => expect(result.current.isLoading).toBe(false));
    });

    it('re-fetches when url changes', async () => {
        const firstData = { message: [{ name: 'A' }] };
        const secondData = { message: [{ name: 'B' }] };
        axios.get
            .mockResolvedValueOnce({ data: firstData })
            .mockResolvedValueOnce({ data: secondData });

        const { result, rerender } = renderHook(({ url }) => useFetchData(url, {}), {
            initialProps: { url: 'http://test.com/one' },
        });

        await waitFor(() => expect(result.current.data).toEqual(firstData));

        rerender({ url: 'http://test.com/two' });

        await waitFor(() => expect(result.current.data).toEqual(secondData));
        expect(axios.get).toHaveBeenCalledTimes(2);
    });

    it('sets error and keeps initialData on network failure', async () => {
        const networkErr = new Error('Network Error');
        axios.get.mockRejectedValueOnce(networkErr);

        const { result } = renderHook(() => useFetchData('http://test.com', { message: [] }));

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.error).toBeTruthy();
        expect(result.current.data).toEqual({ message: [] });
    });

    it('calls AbortController.abort() when unmounted and swallows the cancel error', async () => {
        // Spy on AbortController.prototype.abort so we can assert it was called
        const abortSpy = vi.spyOn(AbortController.prototype, 'abort');

        // Make axios.get hang until we resolve it manually (simulates slow network)
        let rejectFn;
        const pending = new Promise((_, reject) => {
            rejectFn = reject;
        });
        axios.get.mockReturnValueOnce(pending);

        // Treat CanceledError as a cancellation
        const cancelError = Object.assign(new Error('canceled'), { name: 'CanceledError' });
        axios.isCancel = vi.fn((err) => err.name === 'CanceledError');

        const { result, unmount } = renderHook(() => useFetchData('http://test.com', []));

        // Unmount triggers cleanup → abort() must fire
        unmount();
        expect(abortSpy).toHaveBeenCalledTimes(1);

        // Simulate axios throwing a CanceledError after abort (as it does in real usage)
        rejectFn(cancelError);
        // Allow the microtask queue to flush
        await new Promise((r) => setTimeout(r, 0));

        // State must remain at initial values — cancel error is silently swallowed
        expect(result.current.error).toBeNull();
        expect(result.current.data).toEqual([]);

        abortSpy.mockRestore();
    });

    it('passes an AbortSignal to axios.get', () => {
        axios.get.mockResolvedValueOnce({ data: [] });
        renderHook(() => useFetchData('http://test.com', []));
        expect(axios.get).toHaveBeenCalledWith(
            'http://test.com',
            expect.objectContaining({ signal: expect.any(AbortSignal) })
        );
    });
});
