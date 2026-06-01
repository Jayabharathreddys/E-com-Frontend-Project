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

describe('useFetchData – auth scoping (PR: fix/usefetchdata-auth-scope)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        sessionStorage.clear();
        // Reset any stubbed env vars after each test
        vi.unstubAllEnvs();
    });

    // --- own-backend URL with a token ---

    it('sends withCredentials and Authorization header when URL matches default BASE_URL and token exists', async () => {
        sessionStorage.setItem('auth_token', 'my-secret-token');
        axios.get.mockResolvedValueOnce({ data: {} });

        renderHook(() => useFetchData('http://localhost:3001/api/products', {}));

        await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
        expect(axios.get).toHaveBeenCalledWith(
            'http://localhost:3001/api/products',
            expect.objectContaining({
                withCredentials: true,
                headers: { Authorization: 'Bearer my-secret-token' },
            })
        );
    });

    // --- own-backend URL without a token ---

    it('sends withCredentials but empty headers when URL matches BASE_URL and no token in sessionStorage', async () => {
        // Ensure no token is stored
        sessionStorage.removeItem('auth_token');
        axios.get.mockResolvedValueOnce({ data: {} });

        renderHook(() => useFetchData('http://localhost:3001/api/orders', {}));

        await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
        expect(axios.get).toHaveBeenCalledWith(
            'http://localhost:3001/api/orders',
            expect.objectContaining({
                withCredentials: true,
                headers: {},
            })
        );
    });

    // --- external (third-party) URL ---

    it('does NOT send withCredentials or Authorization header for an external URL', async () => {
        sessionStorage.setItem('auth_token', 'should-not-be-sent');
        axios.get.mockResolvedValueOnce({ data: [] });

        renderHook(() => useFetchData('https://external-cdn.example.com/data.json', []));

        await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
        const [, config] = axios.get.mock.calls[0];
        expect(config).not.toHaveProperty('withCredentials');
        expect(config).not.toHaveProperty('headers');
    });

    it('does not read sessionStorage for external URLs', async () => {
        const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
        axios.get.mockResolvedValueOnce({ data: [] });

        renderHook(() => useFetchData('https://third-party.api.com/items', []));

        await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
        expect(getItemSpy).not.toHaveBeenCalledWith('auth_token');
        getItemSpy.mockRestore();
    });

    // --- external URL still gets the AbortSignal (regression) ---

    it('still passes an AbortSignal for external URLs', async () => {
        axios.get.mockResolvedValueOnce({ data: [] });

        renderHook(() => useFetchData('https://external.example.com/data', []));

        await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
        expect(axios.get).toHaveBeenCalledWith(
            'https://external.example.com/data',
            expect.objectContaining({ signal: expect.any(AbortSignal) })
        );
    });

    // --- VITE_BASE_URL environment variable ---

    it('uses VITE_BASE_URL env var to determine own-backend origin', async () => {
        vi.stubEnv('VITE_BASE_URL', 'https://api.myapp.com');
        sessionStorage.setItem('auth_token', 'env-token');
        axios.get.mockResolvedValueOnce({ data: {} });

        renderHook(() => useFetchData('https://api.myapp.com/v1/resource', {}));

        await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
        expect(axios.get).toHaveBeenCalledWith(
            'https://api.myapp.com/v1/resource',
            expect.objectContaining({
                withCredentials: true,
                headers: { Authorization: 'Bearer env-token' },
            })
        );
    });

    it('treats a URL as external when VITE_BASE_URL is set and URL does not match', async () => {
        vi.stubEnv('VITE_BASE_URL', 'https://api.myapp.com');
        sessionStorage.setItem('auth_token', 'should-not-leak');
        axios.get.mockResolvedValueOnce({ data: [] });

        // localhost:3001 is no longer the base; this URL is now "external"
        renderHook(() => useFetchData('http://localhost:3001/api/items', []));

        await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
        const [, config] = axios.get.mock.calls[0];
        expect(config).not.toHaveProperty('withCredentials');
        expect(config).not.toHaveProperty('headers');
    });

    // --- boundary: URL is a prefix match, not just exact host ---

    it('treats a URL whose origin matches BASE_URL prefix as own-backend', async () => {
        sessionStorage.setItem('auth_token', 'prefix-token');
        axios.get.mockResolvedValueOnce({ data: {} });

        // Deep nested path under the default base URL
        renderHook(() =>
            useFetchData('http://localhost:3001/api/v2/users/123/profile', {})
        );

        await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
        expect(axios.get).toHaveBeenCalledWith(
            'http://localhost:3001/api/v2/users/123/profile',
            expect.objectContaining({
                withCredentials: true,
                headers: { Authorization: 'Bearer prefix-token' },
            })
        );
    });
});
