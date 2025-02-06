import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet
} from 'react-native';

const DEPARTMENTS = [
    'FINANCE', 'HUMAN_RESOURCES', 'MARKETING', 'RESEARCH_AND_DEVELOPMENT',
    'IT', 'CUSTOMER_SERVICE', 'OPERATIONS_MANAGEMENT', 'ADMINISTRATION',
    'PURCHASING', 'PRODUCTION', 'SALES', 'ACCOUNTING', 'MAINTENANCE_DEPARTMENT',
    'DESIGN', 'QUALITY_MANAGEMENT', 'BUSINESS_DEVELOPMENT', 'LAW',
    'PRODUCT_DEVELOPMENT', 'HUMAN_RESOURCE_DEVELOPMENT', 'DISTRIBUTION',
    'DISPATCH_DEPARTMENT', 'STORE_DEPARTMENT', 'MANAGEMENT'
  ];

const SearchableDepartmentPicker = ({ 
  value,
  onValueChange,
  departments = DEPARTMENTS
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredDepartments = departments.filter(dept =>
    dept.toLowerCase().replace(/_/g, ' ')
      .includes(searchQuery.toLowerCase())
  );

  const handleSelect = (dept) => {
    onValueChange(dept);
    setModalVisible(false);
    setSearchQuery('');
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => handleSelect(item)}
    >
      <Text style={[
        styles.itemText,
        item === value && styles.selectedItem
      ]}>
        {item.replace(/_/g, ' ')}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text>Department</Text>
      <TouchableOpacity 
        style={styles.pickerButton}
        onPress={() => setModalVisible(true)}
      >
        <Text>{value ? value.replace(/_/g, ' ') : 'Select Department'}</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search departments..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => {
                  setModalVisible(false);
                  setSearchQuery('');
                }}
              >
                <Text>Close</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={filteredDepartments}
              renderItem={renderItem}
              keyExtractor={item => item}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  pickerButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginRight: 8,
  },
  closeButton: {
    padding: 8,
  },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemText: {
    fontSize: 16,
  },
  selectedItem: {
    fontWeight: 'bold',
    color: '#007AFF',
  },
});

export default SearchableDepartmentPicker;