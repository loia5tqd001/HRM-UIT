import React, { PropsWithChildren } from 'react';
import { Alert, Modal, StyleSheet, View } from 'react-native';

const ModalCustom = ({
  modalVisible,
  children,
  ...anotherProps
}: {
  modalVisible: boolean;
  children: JSX.Element | JSX.Element[];
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        Alert.alert('Modal has been closed.');
      }}
      {...anotherProps}
    >
      <View style={styles.container}>{children}</View>
    </Modal>
  );
};

export default ModalCustom;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,.7)',
  },
});
