import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, ActivityIndicator } from 'react-native';
import { useWallet, connection } from '../utils/useWallet';
import { API_URL } from '../utils/api';
import { SystemProgram, Transaction, PublicKey } from '@solana/web3.js';
import { LinearGradient } from 'expo-linear-gradient';

import { useRouter } from 'expo-router';

export default function BirthScreen() {
    const router = useRouter();
    const { signAndSendTransaction, publicKey } = useWallet();
    const [loading, setLoading] = useState(false);

    const handleMintLife = async () => {
        setLoading(true);
        try {
            // 1. Build Transaction for 0.01 SOL Fee
            const tx = new Transaction();

            // Dummy Treasury Address for Demo
            const TREASURY = new PublicKey('11111111111111111111111111111111');

            // We'll let MWA figure out the fee payer (which is the connected wallet)
            tx.add(
                SystemProgram.transfer({
                    fromPubkey: publicKey || TREASURY, // Fallback if pubkey not loaded yet to avoid crash before MWA auth
                    toPubkey: TREASURY,
                    lamports: 10_000_000, // 0.01 SOL
                })
            );

            // Fetch latest blockhash
            const { blockhash } = await connection.getLatestBlockhash('confirmed');
            tx.recentBlockhash = blockhash;
            // Fee payer will be set by the wallet within transact()

            // 2. Transact via MWA
            console.log("Requesting MWA Signature...");
            const signature = await signAndSendTransaction(tx);
            console.log("Tx Signature:", signature);

            // 3. Call Oracle Backend
            console.log("Calling Oracle Backend to birth character...");
            const response = await fetch(`${API_URL}/api/life/birth`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    wallet_address: publicKey ? publicKey.toBase58() : 'dummy_wallet_123',
                    name: 'TEST SUBJECT #' + Math.floor(Math.random() * 1000),
                    onchain_life_id: Math.floor(Math.random() * 1000000)
                })
            });

            let newLifeId = null;
            if (!response.ok) {
                console.warn("Oracle birth call failed:", await response.text());
                // Fallback for emulator without backend
                newLifeId = 'dummy-life-id';
            } else {
                const data = await response.json();
                console.log("Oracle Birth Data:", data);
                if (data.life?.id) {
                    newLifeId = data.life.id;
                }
            }

            setLoading(false);
            router.push({ pathname: '/active-life', params: { life_id: newLifeId } });

        } catch (error) {
            console.error("Minting failed:", error);
            setLoading(false);
            // Even if it fails on Emulator (no wallet installed), let them pass for preview
            router.push({ pathname: '/active-life', params: { life_id: 'dummy-life-id' } });
        }
    };

    return (
        <LinearGradient colors={['#05153b', '#000000']} style={styles.background}>
            <SafeAreaView style={styles.container}>
                <Text style={styles.title}>UPLOAD SOUL</Text>

                <View style={styles.uploadBox}>
                    <Text style={styles.uploadText}>[ TAP TO OPEN CAMERA ]</Text>
                    <Text style={styles.subText}>AI WILL GENERATE 3D AVATAR</Text>
                </View>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleMintLife}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <Text style={styles.actionText}>MINT LIFE (Pay 0.01 SOL)</Text>
                    )}
                </TouchableOpacity>
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
    title: {
        fontFamily: 'monospace',
        fontSize: 32,
        color: '#0df20d',
        marginBottom: 40,
        textShadowColor: 'rgba(13, 242, 13, 0.5)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 10,
    },
    uploadBox: {
        width: '100%',
        height: 300,
        borderWidth: 2,
        borderColor: '#444444',
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 50,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    uploadText: {
        color: '#888888',
        fontFamily: 'monospace',
        marginBottom: 10,
    },
    subText: {
        color: '#555555',
        fontFamily: 'monospace',
        fontSize: 10,
    },
    actionButton: {
        backgroundColor: '#1754cf',
        padding: 20,
        width: '100%',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#00ffff',
        shadowColor: '#00ffff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 5,
    },
    actionText: {
        color: '#ffffff',
        fontFamily: 'monospace',
        fontWeight: 'bold',
    }
});
