import { getPublicKeyFromEnv } from "./src/crypto";

/**
 * Extracts RSA public key from backend environment and formats it for the frontend .env file
 * Frontend only needs the public key for encryption/decryption operations
 */
function extractPublicKeyForFrontend() {
    console.log("🔑 Extracting RSA Public Key for Frontend\n");
    console.log(
        "═══════════════════════════════════════════════════════════\n",
    );

    try {
        const publicKey = getPublicKeyFromEnv();

        console.log("✅ Public key loaded successfully!\n");
        console.log("Copy the following into your frontend/.env file:\n");
        console.log("─".repeat(60));
        console.log(
            '\nRSA_PUBLIC_KEY="' + publicKey.replace(/\n/g, "\\n") + '"',
        );
        console.log("\n" + "─".repeat(60));

        console.log("\n📋 Instructions:");
        console.log("1. Create or open frontend/.env file");
        console.log("2. Paste the line above into the file");
        console.log(
            "3. Make sure the entire key is on one line with \\n for newlines",
        );
        console.log("4. Rebuild the frontend: cd frontend && trunk build");
        console.log("\n💡 Note: The frontend ONLY has the public key!");
        console.log(
            "   This is secure - the private key stays on the backend.\n",
        );

        // Also show in multi-line format for reference
        console.log("─".repeat(60));
        console.log("\nPublic Key (formatted):\n");
        console.log(publicKey);
        console.log("\n" + "─".repeat(60));

        console.log("\n✨ Security Benefits:");
        console.log("   ✓ Frontend can encrypt data (with public key)");
        console.log(
            "   ✓ Frontend can decrypt server responses (with public key)",
        );
        console.log("   ✓ Frontend CANNOT decrypt incoming user data");
        console.log("   ✓ Only backend has private key for full decryption\n");
    } catch (error) {
        console.error("❌ Error:", error);
        console.log("\n💡 Make sure:");
        console.log('   1. You have run "bun run generate-keys" first');
        console.log("   2. The .env file exists in the backend directory");
        console.log("   3. The .env file contains RSA_PUBLIC_KEY\n");
    }
}

// Run the extraction
extractPublicKeyForFrontend();
