import React from "react";
import { Modal, View, Button, Dimensions, StyleSheet } from "react-native";
import Pdf from "react-native-pdf";

const PDFViewerModal = ({ pdfUri, visible, onClose }) => {
  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        <Button title="Close" onPress={onClose} />
        <Pdf
          source={{ uri: pdfUri }}
          style={styles.pdf}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
  },
  pdf: {
    flex: 1,
    width: Dimensions.get("window").width,
  },
});

export default PDFViewerModal;
