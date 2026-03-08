import React, { useState, useEffect, useRef } from 'react';
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Animated } from 'react-native';
import { useWallet, connection } from '../utils/useWallet';
import { API_URL } from '../utils/api';
import { Transaction, PublicKey, TransactionInstruction } from '@solana/web3.js';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';

import { useRouter, useLocalSearchParams } from 'expo-router';

export default function DeathScreen() {
    const router = useRouter();
    const { signAndSendTransaction, publicKey } = useWallet();

    const params = useLocalSearchParams();
    const life_id = Array.isArray(params.life_id) ? params.life_id[0] : (params.life_id || 'dummy-life-id');
    const finalStatsStr = Array.isArray(params.finalStats) ? params.finalStats[0] : params.finalStats;
    const finalStats = finalStatsStr ? JSON.parse(finalStatsStr) : { age: 85, wealth: 95, fame: 42, happiness: 10 };
    const reason = Array.isArray(params.reason) ? params.reason[0] : (params.reason || 'Dummy Death');

    const [loading, setLoading] = useState(true);
    const [finalizing, setFinalizing] = useState(false);
    const [deathData, setDeathData] = useState<any>(null);
    const [sound, setSound] = useState<Audio.Sound | null>(null);

    const fadeAnim = useRef(new Animated.Value(0)).current;

    // Call Oracle Backend to generate the Obituary and sign the death certificate
    useEffect(() => {
        const fetchDeathData = async () => {
            try {
                const res = await fetch(`${API_URL}/api/life/death`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ life_id })
                });
                const data = await res.json();
                if (data.success) {
                    setDeathData(data);
                } else {
                    console.error("Death metadata failed:", data.error);
                }
            } catch (err) {
                console.error("Failed to fetch death data:", err);
            }
            setLoading(false);

            // Fade in the tombstone
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 3000,
                useNativeDriver: true
            }).start();
        };
        fetchDeathData();
    }, [life_id]);

    // Play Funeral Bell
    useEffect(() => {
        const playDeathKnell = async () => {
            try {
                await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
                const { sound: newSound } = await Audio.Sound.createAsync(
                    { uri: 'https://s3.amazonaws.com/freecodecamp/drums/RP4_KICK_1.mp3' }, // Placeholder for bell
                    { shouldPlay: true, volume: 1.0 }
                );
                setSound(newSound);
            } catch (e) {
                console.warn("Could not play death audio");
            }
        };
        playDeathKnell();

        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, []);

    const handleFinalizeDeath = async () => {
        if (!deathData) {
            console.warn("No death data found from Oracle, simulating completion.");
            router.push('/');
            return;
        }

        setFinalizing(true);
        try {
            // 1. Build Transaction for Finalize Death
            const tx = new Transaction();

            // For MVP Demo purposes without the Anchor IDL loaded in RN, 
            // we will simulate the MWA popup by sending a Memorial Memo to the chain.
            // In production, this would be an instruction built using the `@coral-xyz/anchor` SDK 
            // pointing to our `legacy_engine` program ID, sending `deathData.signature`.
            const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

            tx.add(
                new TransactionInstruction({
                    keys: [{ pubkey: publicKey || MEMO_PROGRAM_ID, isSigner: true, isWritable: true }],
                    data: Buffer.from(deathData.message, 'utf-8'),
                    programId: MEMO_PROGRAM_ID,
                })
            );

            // Fetch latest blockhash
            const { blockhash } = await connection.getLatestBlockhash('confirmed');
            tx.recentBlockhash = blockhash;

            // 2. Transact via MWA
            console.log("Requesting MWA Signature for Death NFT...");
            const signature = await signAndSendTransaction(tx);
            console.log("Death Tx Signature:", signature);

            setFinalizing(false);
            router.push('/');

        } catch (error) {
            console.error("Death Finalization failed:", error);
            setFinalizing(false);
            router.push('/');
        }
    };

    return (
        <LinearGradient colors={['#2b0202', '#000000', '#0a0a0a']} style={styles.background}>
            <SafeAreaView style={styles.container}>
                <ScrollView contentContainerStyle={styles.scroll}>
                    <Text style={styles.title}>GAME OVER</Text>

                    <Animated.View style={[styles.tombstone, { opacity: fadeAnim }]}>
                        <Text style={styles.epitaph}>HERE LIES</Text>
                        <Text style={styles.name}>TEST SUBJECT #{life_id.substring(0, 4)}</Text>
                        <Text style={styles.dates}>Lived {finalStats.age} Years</Text>

                        <View style={styles.statsRow}>
                            <Text style={styles.statLabel}>WEALTH: {finalStats.wealth}</Text>
                            <Text style={styles.statLabel}>FAME: {finalStats.fame}</Text>
                        </View>
                    </Animated.View>

                    {loading ? (
                        <View style={styles.obituaryBox}>
                            <ActivityIndicator color="#bd0f2c" size="large" />
                            <Text style={[styles.obituaryText, { textAlign: 'center', marginTop: 10 }]}>
                                Carving your legacy into the blockchain...
                            </Text>
                        </View>
                    ) : (
                        <Animated.View style={[styles.obituaryBox, { opacity: fadeAnim }]}>
                            <Text style={styles.obituaryText}>
                                {deathData?.obituary || "They lived. Then they died. A tale as old as time."}
                            </Text>
                        </Animated.View>
                    )}

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleFinalizeDeath}
                        disabled={loading || finalizing}
                    >
                        {finalizing ? (
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <Text style={styles.actionText}>FINALIZE DEATH (Sign Transaction)</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
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
    },
    scroll: {
        padding: 20,
        alignItems: 'center',
        paddingTop: 50,
    },
    title: {
        fontFamily: 'monospace',
        fontSize: 40,
        color: '#bd0f2c', // Red
        marginBottom: 40,
        textShadowColor: 'rgba(189, 15, 44, 0.5)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 10,
    },
    tombstone: {
        width: '90%',
        borderWidth: 4,
        borderColor: '#888888',
        borderTopLeftRadius: 100,
        borderTopRightRadius: 100,
        padding: 30,
        alignItems: 'center',
        backgroundColor: '#222222',
        marginBottom: 30,
        shadowColor: '#bd0f2c',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    epitaph: {
        color: '#aaaaaa',
        fontFamily: 'monospace',
        fontSize: 14,
        marginBottom: 10,
    },
    name: {
        color: '#ffffff',
        fontFamily: 'monospace',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
        textAlign: 'center',
    },
    dates: {
        color: '#f2a20d',
        fontFamily: 'monospace',
        marginBottom: 20,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 20,
        borderTopWidth: 1,
        borderColor: '#444',
        paddingTop: 15,
    },
    statLabel: {
        color: '#0df20d',
        fontFamily: 'monospace',
    },
    obituaryBox: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#555',
        padding: 15,
        marginBottom: 40,
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    obituaryText: {
        color: '#aaaaaa',
        fontFamily: 'monospace',
        lineHeight: 22,
        fontStyle: 'italic',
    },
    actionButton: {
        backgroundColor: '#bd0f2c',
        padding: 20,
        width: '100%',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#ff0000',
    },
    actionText: {
        color: '#ffffff',
        fontFamily: 'monospace',
        fontWeight: 'bold',
    }
});
