import { useCallback, useEffect, useState } from 'react';

type Settings = {
  callOnMount: boolean; // [true] // whether call fetching on Mounting
  rethrowError: boolean; // [false] // whether to rethrow on catch or isError is enough
};

const defaultSettings: Settings = {
  callOnMount: true,
  rethrowError: false,
};

/**
 *
 * @param apiCall the raw function fetching the data which needs to wrapped up
 * @param settings customizable settings
 * @description wrap up isLoading, isError states when fetching asynchronous data
 */
export function useAsyncData<T>(apiCall: () => Promise<T>, settings = defaultSettings) {
  const [data, setData] = useState<T>();
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedData = await apiCall();
      setData(fetchedData);
    } catch (err) {
      setIsError(true);
      if (settings.rethrowError) throw err;
    } finally {
      setIsLoading(false);
    }
  }, [settings.rethrowError]);

  useEffect(() => {
    if (!settings.callOnMount) return;
    fetchData();
  }, [settings.callOnMount, fetchData]);

  return {
    data,
    setData, // use this if you want to set data directly
    fetchData, // use it if you want to refetch data
    isLoading,
    isError,
  };
}
