import React, { useState, useEffect } from 'react';
import {Text, View, FlatList, StyleSheet, Platform , Alert} from 'react-native';
import { TextInput, Button, Card, Title, Paragraph } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import DatePicker from 'react-native-datepicker';
import { API_URL } from '../api-endpoints/API_URL';
import { makeAuthenticatedRequest, getAuthData } from '../token-data/apiutils';

export default function TodoScreen() {
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    loadUserId();
  }, []);

  const loadUserId = async () => {
    try {
      const { token, userId } = await getAuthData();
      if (!userId || !token) {
        setIsAuthenticated(false);
        return;
      }
      setUserId(userId);
      if (userId) {
        fetchTodos(userId);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const fetchTodos = async (employeeId) => {
    try {
      const response = await makeAuthenticatedRequest(
        `${API_URL}/api/employees/${employeeId}/todos`
      );
      
      if (response.ok) {
        const data = await response.json();
        setTodos(data);
      } else if (response.status === 401) {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };
  
  const addOrUpdateTodo = async () => {
    if (!newTask.trim()) return;
    
    try {
      const method = editingTask ? 'PUT' : 'POST';
      const url = editingTask
        ? `${API_URL}/api/employees/${userId}/todos/${editingTask.id}`
        : `${API_URL}/api/employees/${userId}/todos`;
  
      const response = await makeAuthenticatedRequest(url, {
        method,
        body: JSON.stringify({
          taskName: newTask,
          date: selectedDate.toISOString().split('T')[0],
          time: selectedDate.toISOString().split('T')[1].split('.')[0],
          completed: editingTask ? editingTask.completed : false,
          isDone: editingTask ? editingTask.isDone : false,
          employeeId: userId,
        }),
      });
  
      if (response.ok) {
        setNewTask('');
        setSelectedDate(new Date());
        setEditingTask(null);
        fetchTodos(userId);
      } else if (response.status === 401) {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error adding/updating todo:', error);
    }
  };
  
  const deleteTodo = async (todoId) => {
    try {
      const response = await makeAuthenticatedRequest(
        `${API_URL}/api/employees/${userId}/todos/${todoId}`,
        {
          method: 'DELETE',
        }
      );
  
      if (response.ok) {
        setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== todoId));
      } else if (response.status === 401) {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const onDateChange = (event, selected) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selected) {
      setSelectedDate(selected);
    }
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const handleAuthError = () => {
    Alert.alert(
      'Session Expired',
      'Your session has expired. Please log in again.',
      [
        {
          text: 'OK',
          onPress: () => setIsAuthenticated(false)
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          mode="outlined"
          label="New Task"
          value={newTask}
          onChangeText={setNewTask}
          style={styles.input}
          textColor='#000'
          theme={{
            colors: {
              primary: '#510ac9', // Color when focused
              text: '#000', // Text color
              placeholder: '#510ac9', // Placeholder color
            },
          }}
        />
      </View>

      <View style={styles.dateContainer}>
        <Button mode="outlined" onPress={showDatepicker} textColor='#510ac9'>
          {format(selectedDate, 'PPP')}
        </Button>
      </View>

      {showDatePicker && (
        <DatePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      <Button 
        mode="contained" 
        onPress={addOrUpdateTodo}
        style={styles.addButton}
      >
      <Text style={{color:'#fff'}}>{editingTask ? 'Update' : 'Add'}</Text>
        
      </Button>

      <FlatList
        data={todos}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.todoCard}>
            <Card.Content>
              <Title style={{color:"#000"}}>{item.taskName}</Title>
              <Paragraph style={{color:"#000"}}>Date: {format(new Date(item.date), 'PPP')}</Paragraph>
              
              <Paragraph style={{color:"#000"}}>Status: {item.isDone ? '✅ Done' : '❌ Not Done'}</Paragraph>
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => {
                setNewTask(item.taskName);
                setSelectedDate(new Date(item.date));
                setEditingTask(item);
              }} textColor='#510ac9'>
                Edit
              </Button>
              <Button onPress={() => deleteTodo(item.id)} mode="outlined" textColor='#510ac9'>
                Delete
              </Button>
            </Card.Actions>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16, 
    backgroundColor: '#f5f5f5' 
  },
  inputContainer: { 
    marginTop: 10,
    marginBottom: 12 
  },
  dateContainer: {
    marginBottom: 12
  },
  input: { 
    marginBottom: 8 ,
    backgroundColor: '#fff',
    
  },
  addButton: {
    marginBottom: 16,
    backgroundColor: '#510ac9'
  },
  todoCard: { 
    marginBottom: 12, 
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: '#fff',
    
  },
});