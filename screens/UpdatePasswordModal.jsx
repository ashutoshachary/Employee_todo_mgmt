import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../api-endpoints/API_URL';
import { getAuthData } from '../token-data/apiutils';

export default function UpdatePasswordModal({ visible, onClose }) {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordVisibility, setPasswordVisibility] = useState({
        old: false,
        new: false,
        confirm: false
    });

    // Consolidated password visibility toggle
    const handleTogglePasswordVisibility = (field) => {
        setPasswordVisibility(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    // Enhanced password validation
    const validatePassword = (password) => {
        const validationRules = [
            { 
                test: (p) => p.length >= 8, 
                message: 'Password must be at least 8 characters long.' 
            },
            { 
                test: (p) => /[A-Z]/.test(p), 
                message: 'Password must contain at least one uppercase letter.' 
            },
            { 
                test: (p) => /[a-z]/.test(p), 
                message: 'Password must contain at least one lowercase letter.' 
            },
            { 
                test: (p) => /[0-9]/.test(p), 
                message: 'Password must contain at least one number.' 
            },
            { 
                test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p), 
                message: 'Password must contain at least one special character.' 
            },
            { 
                test: (p) => !/\s/.test(p), 
                message: 'Password cannot contain spaces.' 
            }
        ];

        for (let rule of validationRules) {
            if (!rule.test(password)) {
                setErrors(prev => ({ ...prev, newPassword: rule.message }));
                return false;
            }
        }

        setErrors(prev => ({ ...prev, newPassword: '' }));
        return true;
    };

    // Validate confirm password
    const validateConfirmPassword = (confirm) => {
        const isValid = confirm === newPassword;
        setErrors(prev => ({ 
            ...prev, 
            confirmPassword: isValid ? '' : 'Passwords do not match.' 
        }));
        return isValid;
    };

    const notSameAsCurrentPassword = (confirm) => {
        const isValid = confirm === oldPassword;
        setErrors(prev => ({ 
            ...prev, 
            newPassword: isValid ? 'Passwords Should not match with old Password.' : '' 
        }));
        return isValid;
    };

    const handleUpdatePassword = async () => {
        // Validation checks remain the same
        if (!oldPassword) {
            setErrors(prev => ({ ...prev, oldPassword: 'Current password is required' }));
            return;
        }
    
        if (!validatePassword(newPassword)) {
            return;
        }
    
        if (!validateConfirmPassword(confirmPassword)) {
            return;
        }
    
        try {
            setLoading(true);
            const { token, userId } = await getAuthData();
    
            const url = `${API_URL}/api/employees/${userId}/updatePassword?oldPassword=${encodeURIComponent(oldPassword)}&newPassword=${encodeURIComponent(newPassword)}`;
            
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
    
            if (response.ok) {
                Alert.alert('Success', 'Password updated successfully');
                handleClose();
            } else {
                const errorText = await response.text();
                if (errorText.includes('Current password is incorrect')) {
                    setErrors(prev => ({ ...prev, oldPassword: 'Current password is incorrect' }));
                } else {
                    Alert.alert('Error', errorText || 'Failed to update password');
                }
            }
        } catch (error) {
            Alert.alert('Error', 'Network error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Reset form and close modal
    const handleClose = () => {
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setErrors({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordVisibility({ old: false, new: false, confirm: false });
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleClose}
        >
            <View style={styles.centeredView}>
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Update Password</Text>

                        <TextInput
                            style={[styles.input, errors.oldPassword && styles.inputError]}
                            placeholder="Current Password"
                            secureTextEntry={!passwordVisibility.old}
                            value={oldPassword}
                            onChangeText={setOldPassword}
                            right={
                                <TextInput.Icon
                                    icon={!passwordVisibility.old ? "eye-off" : "eye"}
                                    onPress={() => handleTogglePasswordVisibility('old')}
                                    forceTextInputFocus={false}
                                />
                            }
                        />
                        {errors.oldPassword ? (
                            <Text style={styles.errorText}>{errors.oldPassword}</Text>
                        ) : null}

                        <TextInput
                            style={[styles.input, errors.newPassword && styles.inputError]}
                            placeholder="New Password"
                            secureTextEntry={!passwordVisibility.new}
                            value={newPassword}
                            onChangeText={(text) => {
                                setNewPassword(text);
                                validatePassword(text);
                                
                            }}
                            right={
                                <TextInput.Icon
                                    icon={!passwordVisibility.new ? "eye-off" : "eye"}
                                    onPress={() => handleTogglePasswordVisibility('new')}
                                    forceTextInputFocus={false}
                                />
                            }
                        />
                        {errors.newPassword ? (
                            <Text style={styles.errorText}>{errors.newPassword}</Text>
                        ) : null}

                        <TextInput
                            style={[styles.input, errors.confirmPassword && styles.inputError]}
                            placeholder="Confirm New Password"
                            secureTextEntry={!passwordVisibility.confirm}
                            value={confirmPassword}
                            onChangeText={(text) => {
                                setConfirmPassword(text);
                                validateConfirmPassword(text);
                            }}
                            right={
                                <TextInput.Icon
                                    icon={!passwordVisibility.confirm ? "eye-off" : "eye"}
                                    onPress={() => handleTogglePasswordVisibility('confirm')}
                                    forceTextInputFocus={false}
                                />
                            }
                        />
                        {errors.confirmPassword ? (
                            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                        ) : null}

                        <Text style={styles.passwordRequirements}>
                            Password must contain:{'\n'}
                            • At least 8 characters{'\n'}
                            • One uppercase letter{'\n'}
                            • One lowercase letter{'\n'}
                            • One number{'\n'}
                            • One special character{'\n'}
                            • No spaces
                        </Text>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonCancel]}
                                onPress={handleClose}
                                disabled={loading}
                            >
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, styles.buttonUpdate]}
                                onPress={handleUpdatePassword}
                                disabled={loading}
                            >
                                <Text style={styles.buttonText}>
                                    {loading ? 'Updating...' : 'Update Password'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
}


const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    modalView: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        height: 40,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 5,
        // backgroundColor: '#d3d3d3',
    },
    inputError: {
        borderColor: 'red',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginBottom: 10,
        alignSelf: 'flex-start',
    },
    passwordRequirements: {
        fontSize: 12,
        color: '#666',
        marginVertical: 10,
        alignSelf: 'flex-start',
        lineHeight: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 10,
    },
    button: {
        borderRadius: 5,
        padding: 10,
        elevation: 2,
        minWidth: 100,
        alignItems: 'center',
    },
    buttonUpdate: {
        backgroundColor: '#6699cc',
    },
    buttonCancel: {
        backgroundColor: '#da1d1d',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});