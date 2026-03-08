import { useCallback } from 'react';
import { Connection, PublicKey, clusterApiUrl, Transaction, VersionedTransaction } from '@solana/web3.js';
// @ts-ignore
import bs58 from 'bs58';
import { useMobileWallet } from '@wallet-ui/react-native-web3js';

export const APP_IDENTITY = {
    name: 'LEGACY',
    uri: 'https://legacy-game.com',
    icon: 'favicon.ico', // Placeholder
};

export const cluster = 'devnet';
export const CLUSTER_ENDPOINT = clusterApiUrl(cluster);
export const connection = new Connection(CLUSTER_ENDPOINT, 'confirmed');

export function useWallet() {
    const { signAndSendTransactions, accounts, connect } = useMobileWallet();

    const signAndSendTransaction = useCallback(async (transaction: Transaction | VersionedTransaction) => {
        try {
            // signAndSendTransactions from useMobileWallet returns Uint8Array or array depending on input
            const result = await signAndSendTransactions(transaction, undefined as any);
            return bs58.encode(result as any);
        } catch (err) {
            console.error('Failed to sign and send tx:', err);
            throw err;
        }
    }, [signAndSendTransactions]);

    return {
        authorizeSession: connect,
        signAndSendTransaction,
        authorization: accounts?.length ? { accounts } : null,
        publicKey: accounts?.[0]?.publicKey || (accounts?.[0]?.address ? new PublicKey(Buffer.from(accounts[0].address as unknown as string, 'base64')) : null)
    };
}
