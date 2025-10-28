# Quick Start Guide

Get up and running with the encrypted Hono app in 3 steps!

## Step 1: Generate RSA Keys

```bash
bun run generate-keys
```

This creates a `.env` file with your RSA public and private keys.

## Step 2: Start the Server

```bash
bun run dev
```

The server will start on http://localhost:3000

## Step 3: Test the Encryption

Open a new terminal and run the test client:

```bash
bun run src/test-client.ts
```

You should see output like this:

```
════════════════════════════════════════════════════════
  RSA Encryption Test Client
════════════════════════════════════════════════════════

🔐 Testing Encryption Endpoint

1. Original name: "Alice"
2. Encrypted name (base64): kX7vZ2...

3. Sending POST request to /encrypt-greeting...
4. Response received:
   Message: Greeting encrypted successfully
   Encrypted greeting (base64): mY8nP1...

5. Decrypted greeting: "Hello Alice"

✅ Success! The encrypted communication works correctly.
```

## How It Works

1. The client encrypts `"Alice"` using the **public key**
2. Sends the encrypted data to the server
3. Server decrypts it using the **private key** to get `"Alice"`
4. Server creates greeting `"Hello Alice"`
5. Server encrypts the greeting using the **public key**
6. Server sends encrypted response back
7. Client decrypts the response using the **private key**

## Security Note

- Your `.env` file contains the private key
- **Never commit** the `.env` file to version control
- The `.gitignore` file is already configured to exclude it

## Need Help?

See the full [README.md](./README.md) for detailed documentation.