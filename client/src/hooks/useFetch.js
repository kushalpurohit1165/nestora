import { useState, useEffect, useCallback } from 'react';
import api, { getErrorMessage } from '../api';

// Loads data from an API url.
//  - loading: true only for the first load
//  - error: message if it failed
//  - pollMs: if given, reloads every pollMs milliseconds ("real-time" updates)
function useFetch(url, pollMs) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await api.get(url);
      setData(res.data);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    load(); // first load

    if (!pollMs) return;
    const timer = setInterval(load, pollMs); // repeat
    return () => clearInterval(timer);       // cleanup when the page closes
  }, [load, pollMs]);

  return { data, loading, error, reload: load };
}

export default useFetch;