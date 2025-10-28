import { Hono } from "hono";
import { cors } from "hono/cors";
import { encrypt, decrypt, getPrivateKeyFromEnv } from "./crypto";

const app = new Hono();

// Enable CORS for frontend
app.use(
    "/*",
    cors({
        origin: "http://localhost:8080",
        credentials: true,
    }),
);

// Load private key from environment variables
let privateKey: string;
try {
    privateKey = getPrivateKeyFromEnv();
    console.log("✅ Private key loaded successfully");
} catch (error) {
    console.error("❌ Failed to load RSA private key from environment:", error);
    process.exit(1);
}

app.get("/", (c) => {
    return c.text("Hello Hono!");
});

app.post("/encrypt-greeting", async (c) => {
    try {
        // Get the encrypted name from request body
        const body = await c.req.json();
        const encryptedName = body.name;

        if (!encryptedName) {
            return c.json(
                { error: 'Missing "name" field in request body' },
                400,
            );
        }

        // Decrypt the name using the private key (client encrypted with public key)
        const name = decrypt(encryptedName, privateKey);

        // Create the greeting message
        const greeting = `Hello ${name}`;

        // Encrypt the greeting using the private key (client will decrypt with public key)
        const encryptedGreeting = encrypt(greeting, privateKey);

        return c.json({
            encryptedGreeting,
            message: "Greeting encrypted successfully",
        });
    } catch (error) {
        console.error("Error processing request:", error);
        return c.json(
            {
                error: "Failed to process encrypted data",
                details:
                    error instanceof Error ? error.message : "Unknown error",
            },
            500,
        );
    }
});

export default app;
