# Leptos Frontend with RSA Encryption

This is a client-side rendered (CSR) Leptos application that communicates with the encrypted Hono backend.

## Features

- **Text Input**: Enter your name
- **RSA Encryption**: Uses public key to encrypt data before sending to server
- **Decryption**: Uses public key to decrypt server responses (server encrypts with private key)
- **Real-time Feedback**: Shows loading states, errors, and success messages
- **Secure**: Only has public key - cannot decrypt incoming messages from other users

## Prerequisites

- Rust (latest stable version)
- Trunk (for serving the Leptos app)
- Backend server running on `http://localhost:3000`

## Setup

### 1. Install Trunk

```bash
cargo install trunk
```

### 2. Configure RSA Public Key

After generating keys in the backend, you need to copy the **public key only** to the frontend:

```bash
# In the backend directory
cd ../backend
bun run extract-keys

# Copy the RSA_PUBLIC_KEY line from the output
```

You'll see output like:
```
RSA_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQ...\n-----END PUBLIC KEY-----"
```

**Create frontend/.env file:**

1. Navigate to the `frontend` directory
2. Create a new file called `.env`
3. Paste the `RSA_PUBLIC_KEY` line into the file
4. Save the file

**Example `frontend/.env`:**
```env
RSA_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END PUBLIC KEY-----"
```

**Important**: 
- Only the **public key** goes in the frontend
- The **private key** stays on the backend only
- This is the secure way to implement asymmetric encryption!

### 3. Run the Frontend

```bash
trunk serve --open
```

This will:
- Build the Rust/WASM application
- Start a development server (usually on `http://localhost:8080`)
- Open your browser automatically

## Usage

1. Make sure the backend server is running (`cd ../backend && bun run dev`)
2. Open the frontend in your browser (`http://localhost:8080`)
3. Enter your name in the text field
4. Click "Send Encrypted Request"
5. See the decrypted greeting appear below the button

## How It Works

```
┌─────────────┐                      ┌─────────────┐
│   Browser   │                      │   Backend   │
│  (Leptos)   │                      │   (Hono)    │
│ PUBLIC KEY  │                      │ PRIVATE KEY │
└─────────────┘                      └─────────────┘
       │                                    │
       │ 1. User enters "Alice"             │
       ├────────────────────────────────────┤
       │                                    │
       │ 2. Encrypt "Alice" with public key │
       │    → "kX7vZ2..."                   │
       ├────────────────────────────────────┤
       │                                    │
       │ 3. POST /encrypt-greeting          │
       │    { name: "kX7vZ2..." }           │
       ├───────────────────────────────────>│
       │                                    │
       │                                    │ 4. Decrypt with private key
       │                                    │    → "Alice"
       │                                    │
       │                                    │ 5. Create greeting
       │                                    │    → "Hello Alice"
       │                                    │
       │                                    │ 6. Encrypt with PRIVATE key
       │                                    │    → "mY8nP1..."
       │                                    │
       │ 7. Response                        │
       │    { encryptedGreeting: "mY8..." } │
       │<───────────────────────────────────┤
       │                                    │
       │ 8. Decrypt with PUBLIC key         │
       │    → "Hello Alice"                 │
       │                                    │
       │ 9. Display to user                 │
       └────────────────────────────────────┘
```

## Project Structure

```
frontend/
├── src/
│   └── main.rs           # Main application with encryption logic
├── .env                  # RSA public key (create this!)
├── .env.example          # Example .env file
├── index.html            # HTML template
├── Cargo.toml            # Rust dependencies
└── README.md             # This file
```

## Dependencies

- **leptos** - Reactive web framework
- **rsa** - RSA encryption/decryption (includes BigUint for operations)
- **sha2** - SHA-256 hashing for OAEP padding
- **base64** - Base64 encoding/decoding
- **gloo-net** - HTTP requests in WASM
- **serde** / **serde_json** - JSON serialization
- **wasm-bindgen** - Rust/WASM/JS interop
- **dotenv-codegen** - Load .env at compile time

## Security Considerations

✅ **This application implements proper asymmetric encryption!**

### Key Distribution

- **Frontend**: Has **public key only** (from `.env` file, loaded at compile time)
  - Can encrypt outgoing data
  - Can decrypt server responses (server encrypts with private key)
  - **Cannot** decrypt incoming messages from other users
  
- **Backend**: Has **private key only** (from `.env` file)
  - Can decrypt incoming requests
  - Can encrypt responses
  - Private key never leaves the server

### Security Benefits

✅ **Proper key separation**: Frontend only has public key, backend only uses private key  
✅ **Forward security**: Frontend can't decrypt messages intended for backend  
✅ **Authentic responses**: Only backend (with private key) can create valid responses  
✅ **Environment-based**: Keys loaded from `.env` files, not hardcoded  
✅ **No exposure**: Private key never transmitted to client

### Production Recommendations

For production use, also add:

1. **HTTPS/TLS** for all communications (essential!)
2. **Request signing** to prevent replay attacks
3. **Authentication/authorization** for user management
4. **Hybrid encryption** (RSA + AES) for larger payloads
5. **Proper key management** (rotation, secure storage, backup)
6. **Rate limiting** and DDoS protection

## CORS Configuration

If you encounter CORS errors, update the backend to allow requests from `http://localhost:8080`:

```typescript
// In backend/src/index.ts
import { cors } from 'hono/cors'

app.use('/*', cors({
  origin: 'http://localhost:8080',
  credentials: true,
}))
```

## Building for Production

```bash
trunk build --release
```

The output will be in the `dist/` directory.

## Troubleshooting

### "Failed to parse public key"

- Make sure you've created the `frontend/.env` file
- Ensure the public key includes the `-----BEGIN PUBLIC KEY-----` and `-----END PUBLIC KEY-----` markers
- Check the format: `RSA_PUBLIC_KEY="-----BEGIN...-----END..."`
- Verify newlines are escaped as `\n` in the .env file
- Run `bun run extract-keys` in the backend to get the correct format

### "Failed to send request: NetworkError"

- Ensure the backend server is running on `http://localhost:3000`
- Check browser console for CORS errors
- Verify the API endpoint is accessible

### "Failed to decrypt"

- Make sure the frontend has the correct public key from the backend
- Verify the backend has both public and private keys in its `.env`
- Keys must be from the same key pair (generated together)
- Check that keys haven't been modified or corrupted

## Development Tips

- Use browser DevTools Network tab to inspect encrypted payloads
- Check browser console for detailed error messages
- The backend logs will show decryption attempts
- Test with the backend test client first to verify keys work

## Next Steps

This application already follows proper asymmetric encryption practices! To enhance further:

1. ✅ Key separation is already implemented correctly
2. Add HTTPS/TLS for production deployment
3. Implement request signing to prevent replay attacks
4. Add hybrid encryption (RSA + AES) for larger payloads
5. Add authentication/authorization for user management
6. Implement proper key rotation and management
7. Add rate limiting and monitoring