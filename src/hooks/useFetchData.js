import Axios from 'axios';
import { useEffect, useState } from 'react';

/**
 * Fetch data from a URL and return { data, error, isLoading }.
 *
 * Uses an AbortController to cancel in-flight requests when the component
 * unmounts or the URL changes, preventing state updates on unmounted components.
 *
 * @param {string} url - Endpoint to GET.
 * @param {*} initialData - Fallback value before the first successful response.
 */
const useFetchData = (url, initialData) => {
    const [data, setData] = useState(initialData);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const controller = new AbortController();

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const token = sessionStorage.getItem('auth_token');
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const res = await Axios.get(url, {
                    signal: controller.signal,
                    withCredentials: true,
                    headers,
                });
                setData(res.data);
                setError(null);
            } catch (err) {
                // Ignore cancellation errors — they are expected on unmount / URL change
                if (Axios.isCancel(err) || err.name === 'CanceledError') return;
                setError(err);
                setData(initialData);
            } finally {
                // Guard: don't call setState after unmount / abort
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        };

        fetchData();

        // Cleanup: cancel the request when the component unmounts or url changes.
        // initialData is intentionally omitted — callers pass literals ([] / {})
        // and including it would cause an infinite re-fetch loop.
        return () => controller.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url]);

    return { data, error, isLoading };
};

export default useFetchData;
