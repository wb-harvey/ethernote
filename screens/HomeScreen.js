import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    RefreshControl,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../lib/supabase';
import NoteItem from '../components/NoteItem';


export default function HomeScreen({ navigation }) {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const fetchNotes = async () => {
        try {
            setError(null);
            const { data, error } = await supabase
                .from('notes')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setNotes(data || []);
        } catch (err) {
            console.error('Error fetching notes:', err);
            setError('Failed to load notes. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, []);

    // Refresh notes when screen comes into focus (e.g., after deleting a note)
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchNotes();
        });

        return unsubscribe;
    }, [navigation]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchNotes();
    }, []);

    const handleCreateNote = async () => {
        try {
            // Create a new note with default values
            const { data, error } = await supabase
                .from('notes')
                .insert([
                    {
                        title: 'Untitled Note',
                        content: '',
                        created_at: new Date().toISOString(),
                    }
                ])
                .select()
                .single();

            if (error) throw error;

            // Navigate to the new note's detail page in edit mode
            navigation.navigate('NoteDetail', { noteId: data.id, isNew: true });
        } catch (err) {
            console.error('Error creating note:', err);
            setError('Failed to create note. Please try again.');
        }
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyTitle}>No notes yet</Text>
            <Text style={styles.emptySubtitle}>
                Pull down to refresh or add notes to your database
            </Text>
        </View>
    );

    const renderError = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>⚠️</Text>
            <Text style={styles.emptyTitle}>Oops!</Text>
            <Text style={styles.emptySubtitle}>{error}</Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading notes...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Ethernote</Text>
                    <Text style={styles.headerSubtitle}>
                        {notes.length} {notes.length === 1 ? 'note' : 'notes'}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.newButton}
                    onPress={handleCreateNote}
                    activeOpacity={0.7}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Create new note"
                >
                    <Text style={styles.newButtonText}>+ New</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={notes}
                renderItem={({ item }) => (
                    <NoteItem
                        note={item}
                        onPress={() => navigation.navigate('NoteDetail', { noteId: item.id })}
                    />
                )}
                keyExtractor={(item) => item.id}
                contentContainerStyle={[
                    styles.listContent,
                    notes.length === 0 && styles.listContentEmpty,
                ]}
                ListEmptyComponent={error ? renderError() : renderEmptyState()}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#007AFF"
                    />
                }
            />
        </View>
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
    header: {
        backgroundColor: '#fff',
        paddingTop: 30,
        paddingBottom: 10,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerContent: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#666',
    },
    newButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        cursor: 'pointer',
    },
    newButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    listContent: {
        paddingVertical: 8,
    },
    listContentEmpty: {
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingVertical: 60,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
    },
});
