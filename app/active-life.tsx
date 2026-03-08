import React, { useState, useEffect, useRef } from 'react';
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Animated } from 'react-native';
import { API_URL } from '../utils/api';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';

const SCENE_GRADIENTS: Record<string, readonly [string, string]> = {
    'void': ['#000000', '#111111'],
    'sunset_tree': ['#6b2d05', '#1a0800'],
    'neon_city': ['#120136', '#36096b'],
    'hospital': ['#ffffff', '#dbe8e6'],
    'tavern': ['#261105', '#4a2610'],
    'battlefield': ['#2b0202', '#4a0b0b'],
    'graveyard': ['#040a07', '#0f1f18'],
};

// Demo Audio URLs (Royalty Free Placeholders)
const SCENE_AUDIO: Record<string, string> = {
    'sunset_tree': 'https://s3.amazonaws.com/freecodecamp/drums/Heater-1.mp3', // Placeholder
    'neon_city': 'https://s3.amazonaws.com/freecodecamp/drums/Heater-2.mp3', // Placeholder
    'hospital': 'https://s3.amazonaws.com/freecodecamp/drums/Heater-3.mp3', // Placeholder
    'tavern': 'https://s3.amazonaws.com/freecodecamp/drums/Heater-4.mp3', // Placeholder
    'battlefield': 'https://s3.amazonaws.com/freecodecamp/drums/Kick_n_Hat.mp3', // Placeholder
    'graveyard': 'https://s3.amazonaws.com/freecodecamp/drums/Cev_H2.mp3', // Placeholder
};

import { useRouter, useLocalSearchParams } from 'expo-router';

export default function ActiveLifeScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const life_id = Array.isArray(params.life_id) ? params.life_id[0] : (params.life_id || 'dummy-life-id');

    const [currentScene, setCurrentScene] = useState('void');
    const [loading, setLoading] = useState(true);

    // Audio State
    const [sound, setSound] = useState<Audio.Sound | null>(null);

    // Animation State
    const pulseAnim = useRef(new Animated.Value(0.8)).current;

    // Core state
    const [lifeState, setLifeState] = useState({ age: 0, health: 100, wealth: 20, fame: 0, happiness: 100 });
    const [event, setEvent] = useState<any>(null);

    // Audio Player logic
    const playSceneMusic = async (scene: string) => {
        if (sound) {
            await sound.unloadAsync();
            setSound(null);
        }

        const uri = SCENE_AUDIO[scene];
        if (uri) {
            try {
                await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
                const { sound: newSound } = await Audio.Sound.createAsync(
                    { uri },
                    { shouldPlay: true, isLooping: true, volume: 0.3 }
                );
                setSound(newSound);
            } catch (e) {
                console.warn("Audio load failed for scene:", scene);
            }
        }
    };

    // Watch for scene changes and play new music
    useEffect(() => {
        playSceneMusic(currentScene);
        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, [currentScene]);

    // Start pulsing animation
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1, duration: 2500, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 0.8, duration: 2500, useNativeDriver: true })
            ])
        ).start();
    }, [pulseAnim]);

    const fetchNextEvent = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/life/generate-event`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ life_id })
            });
            const data = await res.json();
            if (data.event) {
                setEvent(data.event);
                if (data.event.scene_type) {
                    setCurrentScene(data.event.scene_type);
                }
            }
        } catch (err) {
            console.error("Failed to fetch event:", err);
        }
        setLoading(false);
    };

    const handleChoice = async (choiceIdx: number) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/life/make-choice`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ life_id, choice_id: choiceIdx })
            });
            const data = await res.json();

            if (data.success) {
                setLifeState({
                    age: data.life_state.age,
                    health: data.life_state.health,
                    wealth: data.life_state.wealth,
                    fame: data.life_state.fame,
                    happiness: data.life_state.happiness,
                });

                if (data.is_dead) {
                    router.push({
                        pathname: '/death',
                        params: {
                            life_id,
                            finalStats: JSON.stringify(data.life_state),
                            reason: data.death_reason
                        }
                    });
                } else {
                    await fetchNextEvent();
                }
            } else {
                console.error("Choice failed:", data.error);
                setLoading(false);
            }
        } catch (err) {
            console.error("Failed to make choice:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNextEvent();
    }, []);

    const gradientColors = SCENE_GRADIENTS[currentScene] || SCENE_GRADIENTS['void'];
    const textColor = currentScene === 'hospital' ? '#111111' : '#ffffff';

    const renderBar = (val: number) => {
        const blocks = Math.floor(val / 10);
        return '█'.repeat(blocks) + '-'.repeat(10 - blocks);
    };

    return (
        <LinearGradient colors={gradientColors} style={styles.background}>
            <SafeAreaView style={styles.container}>
                {/* Dynamic Scenery Indicator */}
                <View style={styles.sceneIndicator}>
                    <Text style={styles.sceneText}>[ SCENE: {currentScene.toUpperCase()} ]</Text>
                </View>

                {/* HUD Map / Top Bar */}
                <View style={[styles.hud, currentScene === 'hospital' && { borderColor: '#111', backgroundColor: 'rgba(255,255,255,0.8)' }]}>
                    <Text style={styles.stat}>HP: [{renderBar(lifeState.health)}] {lifeState.health}/100</Text>
                    <Text style={styles.stat}>G:  [{renderBar(lifeState.wealth)}] {lifeState.wealth}/100</Text>
                    <Text style={[styles.age, currentScene === 'hospital' && { color: '#111' }]}>AGE: {lifeState.age}</Text>
                </View>

                <View style={{ flex: 1 }} />

                {/* 3D Pixel Avatar Placeholder inside Scene */}
                <Animated.View style={[styles.avatarContainer, { transform: [{ scale: pulseAnim }], opacity: pulseAnim }]}>
                    <Text style={[styles.avatarText, { color: textColor }]}>
                        [ {currentScene === 'sunset_tree' ? 'Sitting under an Oak Tree' : 'Standing Firm'} ]
                    </Text>
                    <Text style={[styles.avatarSubText, { color: textColor }]}>
                        ( 3D AVATAR RENDER )
                    </Text>
                </Animated.View>

                <View style={{ flex: 1 }} />

                {/* Main Event Area */}
                {loading ? (
                    <View style={styles.eventBox}>
                        <ActivityIndicator size="large" color="#00ffff" />
                        <Text style={[styles.eventDesc, { textAlign: 'center', marginTop: 10 }]}>Wait... The Overseer is writing your fate...</Text>
                    </View>
                ) : event && (
                    <>
                        <View style={styles.eventBox}>
                            <Text style={styles.eventTitle}>&gt; {event.title.toUpperCase()}</Text>
                            <Text style={styles.eventDesc}>{event.description}</Text>
                        </View>

                        {/* Choices Area */}
                        <ScrollView style={styles.choicesContainer}>
                            {event.choices.map((choice: any, idx: number) => (
                                <TouchableOpacity
                                    key={idx}
                                    style={styles.choiceBtn}
                                    onPress={() => handleChoice(idx)}
                                    disabled={loading}
                                >
                                    <Text style={styles.choiceText}>&gt; [{String.fromCharCode(65 + idx)}] {choice.text}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </>
                )}
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
        padding: 20,
    },
    sceneIndicator: {
        position: 'absolute',
        top: 50,
        right: 20,
        opacity: 0.5,
    },
    sceneText: {
        color: '#fff',
        fontFamily: 'monospace',
        fontSize: 10,
    },
    hud: {
        borderWidth: 2,
        borderColor: '#444444',
        padding: 15,
        marginTop: 40,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    stat: {
        color: '#bd0f2c', // HP Red
        fontFamily: 'monospace',
        marginBottom: 5,
    },
    age: {
        color: '#f2a20d', // Amber
        fontFamily: 'monospace',
        marginTop: 10,
        textAlign: 'right',
    },
    avatarContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 150,
    },
    avatarText: {
        fontFamily: 'monospace',
        fontSize: 16,
        opacity: 0.9,
    },
    avatarSubText: {
        fontFamily: 'monospace',
        fontSize: 10,
        opacity: 0.5,
        marginTop: 10,
    },
    eventBox: {
        borderWidth: 2,
        borderColor: '#1754cf', // Blue frame
        padding: 20,
        backgroundColor: 'rgba(10, 29, 66, 0.9)',
        minHeight: 150,
        marginBottom: 20,
    },
    eventTitle: {
        color: '#00ffff',
        fontFamily: 'monospace',
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 10,
    },
    eventDesc: {
        color: '#ffffff',
        fontFamily: 'monospace',
        lineHeight: 22,
    },
    choicesContainer: {
        gap: 15,
    },
    choiceBtn: {
        borderWidth: 1,
        borderColor: '#0df20d',
        padding: 15,
        backgroundColor: 'rgba(13, 242, 13, 0.1)',
    },
    choiceText: {
        color: '#0df20d',
        fontFamily: 'monospace',
    }
});
