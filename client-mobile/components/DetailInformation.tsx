import React from 'react';
import { Image, Text, View } from 'react-native';
import { SPACING } from '../constants/Layout';

interface DetailProps {
  imgUri: string;
  name: string;
  time?: string;
}

const DetailInformation = ({ imgUri, name }: DetailProps) => {
  return (
    <>
      <View style={{ display: 'flex', flexDirection: 'row' }}>
        <Image
          source={{ uri: imgUri }}
          style={{
            width: 50,
            height: 50,
            borderRadius: 50,
            marginRight: SPACING,
            marginBottom: SPACING,
          }}
        />
        <Text
          style={{
            marginVertical: SPACING,
            fontSize: 27,
            fontWeight: '400',
          }}
        >
          Hi, {name}
        </Text>
      </View>
    </>
  );
};

export default DetailInformation;
