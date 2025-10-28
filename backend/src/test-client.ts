import { getPublicKeyFromEnv, getPrivateKeyFromEnv } from "./crypto";
import {
    createPublicKey,
    publicEncrypt,
    publicDecrypt,
    constants,
} from "crypto";

/**
 * Test client demonstrating how to use the encryption endpoint
 */
async function testEncryptionEndpoint() {
    console.log("🔐 Testing Encryption Endpoint\n");

    try {
        // Load keys from environment
        const publicKey = getPublicKeyFromEnv();
        const privateKey = getPrivateKeyFromEnv();

        // 1. Prepare the data
        const name = "Alice";
        console.log(`1. Original name: "${name}"`);

        // 2. Encrypt the name using the public key (client-side operation)
        const publicKeyObj = createPublicKey(publicKey);
        const buffer = Buffer.from(name, "utf8");
        const encrypted = publicEncrypt(
            {
                key: publicKeyObj,
                padding: constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: "sha256",
            },
            buffer,
        );
        const encryptedName = encrypted.toString("base64");
        console.log(`2. Encrypted name (base64): ${encryptedName}\n`);

        // 3. Send request to the server
        console.log("3. Sending POST request to /encrypt-greeting...");
        const response = await fetch("http://localhost:3000/encrypt-greeting", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: encryptedName }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("❌ Request failed:", errorData);
            return;
        }

        const data = await response.json();
        console.log("4. Response received:");
        console.log(`   Message: ${data.message}`);
        console.log(
            `   Encrypted greeting (base64): ${data.encryptedGreeting}\n`,
        );

        // 5. Decrypt the response using the public key (server encrypted with private key)
        const encryptedBytes = Buffer.from(data.encryptedGreeting, "base64");
        const decryptedBytes = publicDecrypt(
            {
                key: publicKeyObj,
                padding: constants.RSA_PKCS1_PADDING,
            },
            encryptedBytes,
        );
        const decryptedGreeting = decryptedBytes.toString("utf8");
        console.log(`5. Decrypted greeting: "${decryptedGreeting}"`);

        // Verify the result
        const expectedGreeting = `Hello ${name}`;
        if (decryptedGreeting === expectedGreeting) {
            console.log(
                "\n✅ Success! The encrypted communication works correctly.",
            );
        } else {
            console.log(
                `\n❌ Error! Expected "${expectedGreeting}" but got "${decryptedGreeting}"`,
            );
        }
    } catch (error) {
        console.error("\n❌ Error:", error);
        if (error instanceof Error) {
            console.error("Details:", error.message);
        }
        console.log("\n💡 Make sure:");
        console.log(
            '   1. You have run "bun run generate-keys" to create the .env file',
        );
        console.log("   2. The server is running on http://localhost:3000");
        console.log(
            "   3. Your .env file contains RSA_PUBLIC_KEY and RSA_PRIVATE_KEY\n",
        );
    }
}

// Run the test
console.log("════════════════════════════════════════════════════════");
console.log("  RSA Encryption Test Client");
console.log("════════════════════════════════════════════════════════\n");

testEncryptionEndpoint();
