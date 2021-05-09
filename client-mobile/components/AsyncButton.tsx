import React, { useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity } from 'react-native';
import { SPACING } from '../constants/Layout';

type Props = {
  title: string;
  onSubmit: () => Promise<void>;
  successMsg?: string;
  errorMsg?: string;
  [key: string]: any;
};

export const AsyncButton: React.FC<Props> = (props) => {
  const { title, onSubmit, successMsg, errorMsg, ...anotherProps } = props;
  const [isLoading, setIsLoading] = useState(false);

  const onPress = async () => {
    try {
      setIsLoading(true);
      await onSubmit();
      successMsg && Alert.alert(successMsg);
    } catch {
      errorMsg && Alert.alert(errorMsg);
    } finally {
      setIsLoading(false);
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
      <Text style={{ color: 'white', marginRight: 6 }}>{title}</Text>
      {isLoading ? <ActivityIndicator /> : null}
    </TouchableOpacity>
  );
};

export default AsyncButton;
