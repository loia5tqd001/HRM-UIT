import React, { useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity } from 'react-native';
import { SPACING } from '../constants/Layout';

type Props = {
  title: string;
  onSubmit: () => Promise<void>;
  successMsg?: string;
  errorMsg?: string;
  destroyOnSubmit?: { success: boolean; error: boolean };
  [key: string]: any;
};

export const AsyncButton: React.FC<Props> = (props) => {
  const { title, onSubmit, successMsg, errorMsg, destroyOnSubmit, ...anotherProps } = props;
  const [isLoading, setIsLoading] = useState(false);

  const onPress = async () => {
    try {
      setIsLoading(true);
      await onSubmit();
      successMsg && Alert.alert(successMsg);
      // if it'll be destroyed on submit, not need to set state or it will lead to the "Perform update on an unmounted component" error
      if (destroyOnSubmit === undefined || destroyOnSubmit.success === false) {
        setIsLoading(false);
      }
    } catch {
      errorMsg && Alert.alert(errorMsg);
      if (destroyOnSubmit === undefined || destroyOnSubmit.error === false) {
        setIsLoading(false);
      }
    }
  };

  return (
    <TouchableOpacity
      {...anotherProps}
      style={{
        ...anotherProps.style,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        padding: SPACING,
      }}
      onPress={onPress}
    >
      <Text style={{ color: 'white' }}>{title}</Text>
      {isLoading ? <ActivityIndicator style={{ marginLeft: 6 }} /> : null}
    </TouchableOpacity>
  );
};

export default AsyncButton;
