# Hono Backend with Asymmetric Encryption

This is a Hono web application running on Bun with RSA asymmetric encryption support.

## Features

- **Asymmetric Encryption**: Uses RSA-2048 with proper key separation
- **Private Key Security**: Backend only uses the private key - public key is shared with frontend
- **Environment-based Keys**: Keys are loaded from environment variables at runtime
- **Encrypted Communication**: POST endpoint that accepts encrypted data and returns encrypted responses
- **Dual Encryption**: OAEP padding for incoming requests, PKCS1 for outgoing responses

## Setup

### 1. Install Dependencies

```bash
bun install
```

### 2. Generate RSA Keys

Run the key generation script to create your RSA key pair:

```bash
bun run generate-keys
```

This will create a `.env` file with your `RSA_PUBLIC_KEY` and `RSA_PRIVATE_KEY`.

**⚠️ WARNING**: The private key should be kept secret. Make sure `.env` is in your `.gitignore` file!

### 3. Run the Server

```bash
bun run dev
```

The server will start on port 3000 by default.

## API Endpoints

### GET /

Simple health check endpoint.

**Response:**
```
Hello Hono!
```

### POST /encrypt-greeting

Accepts an encrypted name and returns an encrypted greeting.

**Request Body:**
```json
{
  "name": "<base64-encoded-encrypted-name>"
}
```

**Response:**
```json
{
  "encryptedGreeting": "<base64-encoded-encrypted-greeting>",
  "message": "Greeting encrypted successfully"
}
```

**How it works:**
1. Client encrypts name with **public key** (OAEP-SHA256)
2. Server decrypts with **private key**
3. Server creates greeting message
4. Server encrypts response with **private key** (PKCS1)
5. Client decrypts response with **public key**

## Usage Example

See the `test-client.ts` file for a complete working example. The test client demonstrates:

1. Loading the public key from environment
2. Encrypting data with the public key (client-side operation)
3. Sending encrypted data to the server
4. Receiving encrypted response from server
5. Decrypting response with the public key (server encrypted with private key)

Run the test client:
```bash
bun run test
```

## Crypto Module

The `crypto.ts` module provides encryption/decryption functions using only the private key:

### `decrypt(encryptedData: string, privateKeyPem: string): string`

Decrypts incoming requests using the RSA private key.

- **Parameters:**
  - `encryptedData`: Base64-encoded encrypted data (encrypted with public key)
  - `privateKeyPem`: The private key in PEM format
- **Returns:** Decrypted string
- **Padding:** OAEP with SHA-256

### `encrypt(data: string, privateKeyPem: string): string`

Encrypts outgoing responses using the RSA private key.

- **Parameters:**
  - `data`: The string to encrypt
  - `privateKeyPem`: The private key in PEM format
- **Returns:** Base64-encoded encrypted data
- **Padding:** PKCS1 (allows public key decryption on client)

### `getPrivateKeyFromEnv(): string`

Retrieves the private key from environment variables.

- **Returns:** Private key string
- **Throws:** Error if RSA_PRIVATE_KEY is not set

### `getPublicKeyFromEnv(): string`

Retrieves the public key from environment variables (for sharing with frontend).

- **Returns:** Public key string
- **Throws:** Error if RSA_PUBLIC_KEY is not set

## Security Model

✅ **Proper Key Separation:**
- Backend has **private key only** (loaded from .env at runtime)
- Public key is stored in backend .env but **only for distribution** to frontend
- Backend never uses the public key for its core operations
- Private key **never leaves the backend** - not transmitted to clients

✅ **Security Features:**
1. **Private Key Storage**: Never commit your `.env` file or private key to version control
2. **Key Size**: Uses 2048-bit RSA keys (industry standard)
3. **Dual Padding**: 
   - OAEP with SHA-256 for incoming requests (enhanced security)
   - PKCS1 for outgoing responses (allows public key decryption)
4. **Environment Variables**: Keys loaded from .env, not hardcoded
5. **CORS Protection**: Configured to only accept requests from frontend origin

⚠️ **Data Size Limits:**
- Incoming data (OAEP): Max ~190 bytes
- Outgoing data (PKCS1): Max ~245 bytes
- For larger data, consider hybrid encryption (RSA + AES)

## Environment Variables

Create a `.env` file in the backend directory:

```env
RSA_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
RSA_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

**Important Notes:**
- Keys must be in PEM format with newlines escaped as `\n`
- The backend uses **only the private key** for its operations
- The public key is stored here for **distribution to the frontend**
- Run `bun run extract-keys` to get the public key in the correct format for frontend

## Scripts

### `bun run generate-keys`
Generates a new RSA key pair and saves to `.env` file.

### `bun run dev`
Starts the development server with hot reload.

### `bun run test`
Runs the test client to verify encryption/decryption works correctly.

### `bun run extract-keys`
Extracts the public key in the correct format for the frontend `.env` file.

### `bun run verify`
Verifies that the backend setup is correct and keys are loaded.

### `bun run example`
Runs the example client demonstrating proper public key only usage.

## Testing

### Test Client

Run the included test client to verify everything works:

```bash
bun run test
```

This will:
1. Encrypt a test name with the public key (simulating client behavior)
2. Send it to the server
3. Receive encrypted response
4. Decrypt with public key (simulating client behavior)
5. Verify the decrypted greeting is correct

### Example Client

Run the standalone example client:

```bash
bun run example
```

This demonstrates:
- Loading public key from environment
- Encrypting data with public key only
- Decrypting server responses with public key
- Testing with multiple names
- Proper security model (public key only)

See `example-client.ts` for the complete implementation.