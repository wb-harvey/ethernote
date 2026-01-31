import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../lib/supabase';

export default function NoteDetailScreen({ route, navigation }) {
    const { noteId, isNew = false } = route.params;
    const [note, setNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(isNew); // Start in edit mode if new note
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState(null);
    const contentInputRef = useRef(null);

    useEffect(() => {
        fetchNote();
    }, [noteId]);

    const fetchNote = async () => {
        try {
            setError(null);
            const { data, error } = await supabase
                .from('notes')
                .select('*')
                .eq('id', noteId)
                .single();

            if (error) throw error;

            setNote(data);
            setTitle(data.title || '');
            setContent(data.content || '');
        } catch (err) {
            console.error('Error fetching note:', err);
            setError('Failed to load note. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Auto-focus content input when new note is loaded
    useEffect(() => {
        if (isNew && !loading && contentInputRef.current) {
            // Small delay to ensure the input is rendered
            setTimeout(() => {
                contentInputRef.current?.focus();
            }, 100);
        }
    }, [isNew, loading]);

    const handleSave = async () => {
        if (!title.trim()) {
            Alert.alert('Error', 'Title cannot be empty');
            return;
        }

        try {
            setSaving(true);
            setError(null);

            const { error } = await supabase
                .from('notes')
                .update({
                    title: title.trim(),
                    content: content.trim(),
                    updated_at: new Date().toISOString(),
                })
                .eq('id', noteId);

            if (error) throw error;

            setNote({ ...note, title: title.trim(), content: content.trim() });
            setIsEditing(false);
            Alert.alert('Success', 'Note saved successfully');
        } catch (err) {
            console.error('Error saving note:', err);
            setError('Failed to save note. Please try again.');
            Alert.alert('Error', 'Failed to save note. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = () => {
        // Use native confirm for web, Alert for mobile
        if (Platform.OS === 'web') {
            const confirmed = window.confirm(
                'Are you sure you want to delete this note? This action cannot be undone.'
            );
            if (confirmed) {
                confirmDelete();
            }
        } else {
            Alert.alert(
                'Delete Note',
                'Are you sure you want to delete this note? This action cannot be undone.',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                    },
                    {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: confirmDelete,
                    },
                ]
            );
        }
    };

    const confirmDelete = async () => {
        try {
            setSaving(true);
            setError(null);

            const { error } = await supabase
                .from('notes')
                .delete()
                .eq('id', noteId);

            if (error) throw error;

            navigation.goBack();
        } catch (err) {
            console.error('Error deleting note:', err);
            setError('Failed to delete note. Please try again.');
            Alert.alert('Error', 'Failed to delete note. Please try again.');
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setTitle(note.title || '');
        setContent(note.content || '');
        setIsEditing(false);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading note...</Text>
            </View>
        );
    }

    if (error && !note) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorTitle}>Oops!</Text>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
                    <Text style={styles.buttonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    disabled={saving}
                >
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>

                <View style={styles.headerActions}>
                    {!isEditing ? (
                        <>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.editButton]}
                                onPress={() => setIsEditing(true)}
                                disabled={saving}
                                activeOpacity={0.7}
                                accessible={true}
                                accessibilityRole="button"
                                accessibilityLabel="Edit note"
                            >
                                <Text style={styles.actionButtonText}>✏️</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.deleteButton]}
                                onPress={handleDelete}
                                disabled={saving}
                                activeOpacity={0.7}
                                accessible={true}
                                accessibilityRole="button"
                                accessibilityLabel="Delete note"
                            >
                                <Text style={styles.deleteButtonText}>🗑️</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.cancelButton]}
                                onPress={handleCancel}
                                disabled={saving}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.saveButton]}
                                onPress={handleSave}
                                disabled={saving}
                            >
                                {saving ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.saveButtonText}>Save</Text>
                                )}
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>

            {/* Content */}
            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                {isEditing ? (
                    <>
                        <Text style={styles.label}>Title</Text>
                        <TextInput
                            style={styles.titleInput}
                            value={title}
                            onChangeText={setTitle}
                            placeholder="Enter note title"
                            placeholderTextColor="#999"
                            editable={!saving}
                        />

                        <Text style={styles.label}>Content</Text>
                        <TextInput
                            ref={contentInputRef}
                            style={styles.contentInput}
                            value={content}
                            onChangeText={setContent}
                            placeholder="Enter note content"
                            placeholderTextColor="#999"
                            multiline
                            textAlignVertical="top"
                            editable={!saving}
                        />
                    </>
                ) : (
                    <>
                        <Text style={styles.titleText}>{note?.title}</Text>
                        <Text style={styles.contentText}>
                            {note?.content || 'No content'}
                        </Text>
                        <Text style={styles.dateText}>
                            Created: {new Date(note?.created_at).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </Text>
                    </>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        gap: 16,
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 40,
    },
    errorIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    errorTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    errorText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
    },
    header: {
        backgroundColor: '#fff',
        paddingTop: 30,
        paddingBottom: 8,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backButton: {
        paddingVertical: 8,
    },
    backButtonText: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '600',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        cursor: 'pointer',
        zIndex: 10,
    },
    editButton: {
        backgroundColor: '#007AFF',
    },
    deleteButton: {
        backgroundColor: '#FF3B30',
    },
    cancelButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#666',
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    saveButton: {
        backgroundColor: '#34C759',
        minWidth: 60,
        alignItems: 'center',
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
    deleteButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
    saveButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
        marginTop: 16,
    },
    titleInput: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        fontSize: 20,
        fontWeight: '600',
        color: '#1a1a1a',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    contentInput: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#1a1a1a',
        minHeight: 200,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    titleText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 16,
    },
    contentText: {
        fontSize: 16,
        color: '#333',
        lineHeight: 24,
        marginBottom: 24,
    },
    dateText: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
    },
    button: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 16,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
