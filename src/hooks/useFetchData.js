
import Axios from 'axios';
import { useEffect, useState } from 'react';

// Parameter renamed from intialData → initialData (typo fix)
const useFetchData = (url, initialData) => {
    const [data, setData] = useState(initialData);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // fetchData defined inside useEffect to satisfy exhaustive-deps rule
        // and avoid stale closure on 'url'
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const res = await Axios.get(url);
                setData(res.data);
                setError(null);
            } catch (err) {
                setError(err);
                setData(initialData);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
        // initialData is intentionally omitted: callers pass literals ([] / {})
        // and including it would cause an infinite re-fetch loop.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url]);

    return { data, error, isLoading };
};

export default useFetchData;
