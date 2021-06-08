import { useCallback, useEffect, useState, useRef } from 'react';

type SuccessCb<T> = (data: T) => void;
type ErrorCb = () => void;
type DoneCb = () => void;

type Settings<T> = {
  callOnMount?: boolean; // [true] // whether call fetching on Mounting
  rethrowError?: boolean; // [false] // whether to rethrow on catch or isError is enough
  onSuccess?: SuccessCb<T>;
  onError?: ErrorCb;
  onDone?: DoneCb;
};

const defaultSettings: Settings<unknown> = {
  callOnMount: true,
  rethrowError: false,
};

/**
 *
 * @param apiCall the raw function fetching the data which needs to wrapped up
 * @param settings customizable settings
 * @description wrap up isLoading, isError states when fetching asynchronous data
 */
export function useAsyncData<T>(
  apiCall: () => Promise<T>,
  settings: Settings<T> = defaultSettings,
) {
  const settingsRef = useRef({ ...defaultSettings, ...settings });
  const [data, setData] = useState<T>();
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const subSuccessList = useRef<SuccessCb<T>[]>([]);
  const subErrorList = useRef<ErrorCb[]>([]);
  const subDoneList = useRef<DoneCb[]>([]);

  useEffect(() => {
    if (settings.onSuccess) subSuccessList.current.push(settings.onSuccess);
    if (settings.onError) subErrorList.current.push(settings.onError);
    if (settings.onDone) subDoneList.current.push(settings.onDone);
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedData = await apiCall();
      setData(fetchedData);
      subSuccessList.current.forEach((cb) => cb(fetchedData));
    } catch (err) {
      setIsError(true);
      subErrorList.current.forEach((cb) => cb());
      if (settingsRef.current.rethrowError) throw err;
    } finally {
      setIsLoading(false);
      subDoneList.current.forEach((cb) => cb());
    }
  }, []);

  const subSuccess = (cb: SuccessCb<T>) => subSuccessList.current.push(cb);
  const subError = (cb: ErrorCb) => subErrorList.current.push(cb);
  const subDone = (cb: DoneCb) => subDoneList.current.push(cb);

  useEffect(() => {
    if (!settingsRef.current.callOnMount) return;
    fetchData();
  }, [fetchData]);

  return {
    data,
    setData, // use this if you want to set data directly
    fetchData, // use it if you want to refetch data
    isLoading,
    isError,
    subSuccess,
    subError,
    subDone,
  };
}
