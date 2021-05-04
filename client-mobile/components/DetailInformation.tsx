import React from 'react'
import {
  StyleSheet,
  Text,
  View,
  Image,
  ImageSourcePropType,
  ImageProps,
  ImageURISource,
} from 'react-native'
import { colorText } from '../constants/Colors'
import { ICON_IMG, SPACING } from '../constants/Layout'

interface DetailProps {
  imgUri: string
  name: string
  time?: string
}

const DetailInformation = ({ imgUri, name }: DetailProps) => {
  return (
    <>
      <Image
        source={{uri:imgUri}}
        style={{
          width: 100,
          height: 100,
          borderRadius: 50,
        }}
      />
      <Text
        style={{
          marginVertical: SPACING,
          fontSize: 27,
          fontWeight: '100',
          color: colorText,
        }}
      >
        Hi, {name}
      </Text>
      {/* Notify Login */}
      <Text
        style={{
          // marginVertical: SPACING ,
          fontSize: 20,
          fontWeight: '100',
          color: colorText,
        }}
      >
        You're clocked in in XX:YY PM
      </Text>
    </>
  )
}

export default DetailInformation

const styles = StyleSheet.create({})
