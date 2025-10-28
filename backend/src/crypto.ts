import {
    createPrivateKey,
    privateDecrypt,
    privateEncrypt,
    constants,
} from "crypto";

/**
 * Decrypts data using RSA private key (from client request)
 * Client encrypts with public key, server decrypts with private key
 * @param encryptedData - Base64 encoded encrypted data
 * @param privateKeyPem - The private key in PEM format
 * @returns Decrypted string
 */
export function decrypt(encryptedData: string, privateKeyPem: string): string {
    const privateKey = createPrivateKey(privateKeyPem);

    const buffer = Buffer.from(encryptedData, "base64");
    const decrypted = privateDecrypt(
        {
            key: privateKey,
            padding: constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: "sha256",
        },
        buffer,
    );

    return decrypted.toString("utf8");
}

/**
 * Encrypts data using RSA private key (for server response)
 * Server encrypts with private key, client decrypts with public key
 * @param data - The string data to encrypt
 * @param privateKeyPem - The private key in PEM format
 * @returns Base64 encoded encrypted data
 */
export function encrypt(data: string, privateKeyPem: string): string {
    const privateKey = createPrivateKey(privateKeyPem);

    const buffer = Buffer.from(data, "utf8");
    const encrypted = privateEncrypt(
        {
            key: privateKey,
            padding: constants.RSA_PKCS1_PADDING,
        },
        buffer,
    );

    return encrypted.toString("base64");
}

/**
 * Gets the private key from environment variables
 * @returns Private key string
 * @throws Error if key is not set in environment variables
 */
export function getPrivateKeyFromEnv(): string {
    const privateKey = process.env.RSA_PRIVATE_KEY;

    if (!privateKey) {
        throw new Error("RSA_PRIVATE_KEY must be set in environment variables");
    }

    return privateKey;
}

/**
 * Gets the public key from environment variables (for export/sharing)
 * @returns Public key string
 * @throws Error if key is not set in environment variables
 */
export function getPublicKeyFromEnv(): string {
    const publicKey = process.env.RSA_PUBLIC_KEY;

    if (!publicKey) {
        throw new Error("RSA_PUBLIC_KEY must be set in environment variables");
    }

    return publicKey;
}
