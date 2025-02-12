import React from "react";
import { Modal, View, Button, Dimensions, StyleSheet, Alert } from "react-native";
import Pdf from "react-native-pdf";
import { WebView } from "react-native-webview";

const PDFViewerModal = ({ pdfUri, visible, onClose }) => {
  // Check if the file is local or remote
  const isLocalFile = pdfUri?.startsWith("file://");

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        <Button title="Close" onPress={onClose} />
        
        {isLocalFile ? (
          <Pdf
            source={{ uri: pdfUri }}
            onLoadComplete={(numberOfPages, filePath) => {
              console.log(`Loaded PDF with ${numberOfPages} pages from ${filePath}`);
            }}
            onError={(error) => {
              Alert.alert("Error", `Failed to load PDF: ${error.message}`);
            }}
            style={styles.pdf}
          />
        ) : (
          <WebView
            source={{ uri: pdfUri }}
            style={styles.webview}
            onError={(error) => Alert.alert("Error", `Failed to load PDF: ${error.message}`)}
          />
        )}
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
  webview: {
    flex: 1,
  },
});

export default PDFViewerModal;
