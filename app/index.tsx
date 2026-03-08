import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useRouter } from 'expo-router';

export default function HomeScreen() {
    const router = useRouter();
    return (
        <LinearGradient colors={['#1a0429', '#0d0d0d']} style={styles.background}>
            <SafeAreaView style={styles.container}>
                {/* Glitch Title */}
                <View style={styles.titleContainer}>
                    <Text style={styles.glitchText}>LEGACY</Text>
                    <Text style={styles.subtitle}>LIVE. DIE. MINT.</Text>
                </View>

                {/* 3D Pixel Avatar Placeholder */}
                <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>[3D PIXEL AVATAR HERE]</Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => router.push('/birth')}
                    >
                        <Text style={styles.primaryButtonText}>START NEW LIFE (0.01 SOL)</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => router.push('/graveyard')}
                    >
                        <Text style={styles.secondaryButtonText}>ENTER THE GRAVEYARD</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    titleContainer: {
        marginBottom: 40,
        alignItems: 'center',
    },
    glitchText: {
        fontFamily: 'monospace',
        fontSize: 48,
        color: '#0df20d', // Terminal Green
        fontWeight: 'bold',
        textShadowColor: 'rgba(13, 242, 13, 0.5)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 10,
        letterSpacing: 4,
    },
    subtitle: {
        fontFamily: 'monospace',
        fontSize: 16,
        color: '#f2a20d', // Amber
        marginTop: 10,
        letterSpacing: 2,
    },
    avatarPlaceholder: {
        width: 250,
        height: 250,
        borderWidth: 4,
        borderColor: '#1754cf', // Blue
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 50,
        backgroundColor: 'rgba(23, 84, 207, 0.1)',
        shadowColor: '#1754cf',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 8,
    },
    avatarText: {
        color: '#1754cf',
        fontFamily: 'monospace',
        textAlign: 'center',
    },
    buttonContainer: {
        width: '100%',
        gap: 20,
    },
    primaryButton: {
        backgroundColor: '#f2a20d', // Amber
        paddingVertical: 15,
        borderWidth: 2,
        borderColor: '#ffffff',
        alignItems: 'center',
        shadowColor: '#f2a20d',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 5,
    },
    primaryButtonText: {
        fontFamily: 'monospace',
        color: '#111111',
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    secondaryButton: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingVertical: 15,
        borderWidth: 2,
        borderColor: '#444444',
        alignItems: 'center',
    },
    secondaryButtonText: {
        fontFamily: 'monospace',
        color: '#888888',
        fontSize: 14,
        letterSpacing: 1,
    },
});
