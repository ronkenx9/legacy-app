import React from 'react';
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, FlatList } from 'react-native';

const MOCK_GRAVES = [
    { id: '1', name: 'KENN_RONIN', score: 180, dates: '2026-2099' },
    { id: '2', name: 'PIXEL_KING', score: 120, dates: '2026-2060' },
    { id: '3', name: 'POOR_PEASANT', score: 15, dates: '2026-2030' },
];

import { useRouter } from 'expo-router';

export default function GraveyardScreen() {
    const router = useRouter();

    const renderGrave = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.graveRow}>
            <View>
                <Text style={styles.graveName}>{item.name}</Text>
                <Text style={styles.graveDates}>{item.dates}</Text>
            </View>
            <View style={styles.scoreBox}>
                <Text style={styles.scoreText}>SCORE: {item.score}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backBtn}>&lt; BACK</Text>
                </TouchableOpacity>
                <Text style={styles.title}>THE GRAVEYARD</Text>
                <View style={{ width: 50 }} />
            </View>

            <View style={styles.mapPlaceholder}>
                <Text style={styles.mapText}>[ 2D PIXEL MAP RENDERING ZONE ]</Text>
                <Text style={styles.subText}>Tombstones scale by final score</Text>
            </View>

            <FlatList
                data={MOCK_GRAVES}
                keyExtractor={item => item.id}
                renderItem={renderGrave}
                contentContainerStyle={styles.list}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111111',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 2,
        borderColor: '#333',
    },
    backBtn: {
        color: '#0df20d',
        fontFamily: 'monospace',
        fontSize: 16,
    },
    title: {
        color: '#888',
        fontFamily: 'monospace',
        fontSize: 20,
    },
    mapPlaceholder: {
        height: 250,
        backgroundColor: '#0a0a0a',
        borderBottomWidth: 4,
        borderColor: '#222',
        alignItems: 'center',
        justifyContent: 'center',
    },
    mapText: {
        color: '#1754cf',
        fontFamily: 'monospace',
        marginBottom: 5,
    },
    subText: {
        color: '#555',
        fontFamily: 'monospace',
        fontSize: 10,
    },
    list: {
        padding: 15,
    },
    graveRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#444',
        padding: 15,
        marginBottom: 10,
        backgroundColor: '#1a1a1a',
    },
    graveName: {
        color: '#fff',
        fontFamily: 'monospace',
        fontSize: 16,
        marginBottom: 5,
    },
    graveDates: {
        color: '#666',
        fontFamily: 'monospace',
        fontSize: 12,
    },
    scoreBox: {
        backgroundColor: '#333',
        padding: 5,
        paddingHorizontal: 10,
        borderRadius: 4,
    },
    scoreText: {
        color: '#f2a20d',
        fontFamily: 'monospace',
        fontWeight: 'bold',
    }
});
