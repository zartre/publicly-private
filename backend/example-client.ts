import { getPublicKeyFromEnv } from "./src/crypto";
import {
    createPublicKey,
    publicEncrypt,
    publicDecrypt,
    constants,
} from "crypto";

/**
 * Example client for interacting with the encrypted Hono API
 * This demonstrates how to use ONLY the public key for encryption/decryption
 *
 * Security Model:
 * - Client has PUBLIC KEY ONLY
 * - Client encrypts requests with public key
 * - Client decrypts responses with public key (server signs with private key)
 * - Client CANNOT decrypt incoming messages meant for the server
 */

// API endpoint
const API_BASE_URL = "http://localhost:3000";

/**
 * Encrypts data using RSA public key (for sending to server)
 * Uses OAEP padding with SHA-256
 */
function encryptWithPublicKey(data: string, publicKeyPem: string): string {
    const publicKey = createPublicKey(publicKeyPem);
    const buffer = Buffer.from(data, "utf8");

    const encrypted = publicEncrypt(
        {
            key: publicKey,
            padding: constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: "sha256",
        },
        buffer,
    );

    return encrypted.toString("base64");
}

/**
 * Decrypts data using RSA public key (for server responses)
 * Server encrypts with private key, we decrypt with public key
 * Uses PKCS1 padding
 */
function decryptWithPublicKey(
    encryptedData: string,
    publicKeyPem: string,
): string {
    const publicKey = createPublicKey(publicKeyPem);
    const buffer = Buffer.from(encryptedData, "base64");

    const decrypted = publicDecrypt(
        {
            key: publicKey,
            padding: constants.RSA_PKCS1_PADDING,
        },
        buffer,
    );

    return decrypted.toString("utf8");
}

/**
 * Sends an encrypted greeting request to the API
 */
async function sendEncryptedGreeting(
    name: string,
    publicKey: string,
): Promise<string> {
    try {
        // Step 1: Encrypt the name with public key
        const encryptedName = encryptWithPublicKey(name, publicKey);
        console.log(`📤 Sending encrypted name for: "${name}"`);
        console.log(
            `   Encrypted (base64): ${encryptedName.substring(0, 50)}...`,
        );

        // Step 2: Send POST request
        const response = await fetch(`${API_BASE_URL}/encrypt-greeting`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: encryptedName }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`API Error: ${error.error || "Unknown error"}`);
        }

        // Step 3: Get encrypted response
        const data = await response.json();
        console.log("📥 Received encrypted response from server");
        console.log(
            `   Encrypted greeting: ${data.encryptedGreeting.substring(0, 50)}...`,
        );

        // Step 4: Decrypt the greeting with public key
        // (Server encrypted it with private key)
        const decryptedGreeting = decryptWithPublicKey(
            data.encryptedGreeting,
            publicKey,
        );
        console.log(`🔓 Decrypted greeting: "${decryptedGreeting}"`);

        return decryptedGreeting;
    } catch (error) {
        console.error("❌ Error:", error);
        throw error;
    }
}

/**
 * Example usage
 */
async function main() {
    console.log("═══════════════════════════════════════");
    console.log("  Example Encryption Client");
    console.log("  🔒 Using PUBLIC KEY ONLY");
    console.log("═══════════════════════════════════════\n");

    try {
        // Load public key from environment
        const publicKey = getPublicKeyFromEnv();
        console.log("✅ Public key loaded from environment\n");

        // Test with different names
        const names = ["Alice", "Bob", "Charlie"];

        for (const name of names) {
            console.log(`\n🔐 Testing with name: "${name}"`);
            console.log("─".repeat(60));

            try {
                const greeting = await sendEncryptedGreeting(name, publicKey);
                console.log(`✅ Success! Got: "${greeting}"`);
            } catch (error) {
                console.log(`❌ Failed for "${name}"`);
            }

            console.log("─".repeat(60));
        }

        console.log("\n✨ All tests completed!");
        console.log("\n🔒 Security Note:");
        console.log("   This client only has the PUBLIC key.");
        console.log("   It can encrypt data and decrypt server responses,");
        console.log(
            "   but CANNOT decrypt incoming messages meant for the server.",
        );
        console.log(
            "   This is the secure way to implement asymmetric encryption!\n",
        );
    } catch (error) {
        console.error("\n❌ Error loading public key:", error);
        console.log("\n💡 Make sure:");
        console.log('   1. You have run "bun run generate-keys"');
        console.log("   2. The .env file exists with RSA_PUBLIC_KEY");
        console.log("   3. The server is running on http://localhost:3000\n");
        process.exit(1);
    }
}

// Run the example if this file is executed directly
if (import.meta.main) {
    main().catch(console.error);
}

// Export functions for use in other modules
export { encryptWithPublicKey, decryptWithPublicKey, sendEncryptedGreeting };
