# 🔐 Publicly Private - Encrypted Communication POC

> [!info]
> This project is written entirely by Claude Sonnet 4.5.

A proof-of-concept application demonstrating asymmetric (RSA) encryption between a Rust/Leptos frontend and a TypeScript/Hono backend running on Bun.

## Overview

This project showcases end-to-end encryption where:

1. **Frontend** (Leptos/Rust/WASM) has only the RSA **public key**
   - Encrypts user input with public key before sending to backend
   - Decrypts server responses with public key (server encrypts with private key)
2. **Backend** (Hono/Bun) has only the RSA **private key**
   - Decrypts incoming requests with private key
   - Encrypts responses with private key before sending to frontend
3. **Security**: Private key never leaves the backend - frontend cannot decrypt incoming messages!

## Project Structure

```
publicly-private/
├── backend/                 # Hono API with RSA encryption
│   ├── src/
│   │   ├── index.ts        # Main API server
│   │   ├── crypto.ts       # Encryption/decryption utilities
│   │   ├── generate-keys.ts # RSA key pair generator
│   │   └── test-client.ts  # Test client for API
│   ├── .env                # RSA keys (generated, not in git)
│   └── package.json
│
└── frontend/               # Leptos CSR app with RSA encryption
    ├── src/
    │   └── main.rs         # Main app with UI and crypto
    ├── index.html
    └── Cargo.toml
```

## Quick Start

### 1. Backend Setup

```bash
cd backend

# Install dependencies
bun install

# Generate RSA key pair
bun run generate-keys

# Start the server
bun run dev
```

The backend will run on `http://localhost:3000`

### 2. Frontend Setup

```bash
# Install Trunk (Rust WASM bundler)
cargo install trunk

# Extract public key for frontend
cd backend
bun run extract-keys

# Copy the output and create frontend/.env file
# Paste the RSA_PUBLIC_KEY line into frontend/.env
```

**Manual key setup:**
1. Open `backend/.env`
2. Copy the `RSA_PUBLIC_KEY` value (NOT the private key!)
3. Create `frontend/.env` file
4. Add: `RSA_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...-----END PUBLIC KEY-----"`

```bash
cd ../frontend

# Run the frontend
trunk serve --open
```

The frontend will open at `http://localhost:8080`

## Usage

1. Ensure backend is running (`http://localhost:3000`)
2. Open frontend in browser (`http://localhost:8080`)
3. Enter your name in the text field
4. Click "Send Encrypted Request"
5. See the encrypted greeting response displayed below

## How It Works

```
User Input: "Alice"
    ↓
[Frontend] Encrypt with PUBLIC KEY
    ↓
Encrypted: "kX7vZ2..." (Base64)
    ↓
[POST /encrypt-greeting] → Backend
    ↓
[Backend] Decrypt with PRIVATE KEY
    ↓
Decrypted: "Alice"
    ↓
[Backend] Create greeting: "Hello Alice"
    ↓
[Backend] Encrypt with PRIVATE KEY
    ↓
Encrypted Response: "mY8nP1..." (Base64)
    ↓
[Frontend] Decrypt with PUBLIC KEY
    ↓
Display: "Hello Alice"
```

## API Endpoints

### `GET /`
Health check endpoint

**Response:**
```
Hello Hono!
```

### `POST /encrypt-greeting`
Accepts encrypted name, returns encrypted greeting

**Request:**
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

## Tech Stack

### Backend
- **Runtime:** Bun
- **Framework:** Hono
- **Language:** TypeScript
- **Encryption:** Node.js crypto module (RSA-2048 with OAEP-SHA256)

### Frontend
- **Framework:** Leptos 0.8 (CSR mode)
- **Language:** Rust
- **Build Tool:** Trunk
- **Encryption:** rsa crate (RSA-2048 with OAEP-SHA256)
- **HTTP Client:** gloo-net

## Security Features

- **RSA-2048** encryption (industry standard key size)
- **OAEP padding** with SHA-256 for request encryption
- **PKCS1 padding** for response encryption (allows public key decryption)
- **Proper key separation**: Frontend has public key only, backend has private key only
- **Environment-based keys** (loaded at compile time for frontend, runtime for backend)
- **Base64 encoding** for transport
- **.gitignore** configured to exclude sensitive files

## 🔒 Security Model

**This application demonstrates proper asymmetric encryption!**

### Key Distribution

- **Frontend**: Has **public key only** (read from `.env` at build time)
  - Can encrypt outgoing data
  - Can decrypt server responses (server encrypts with private key)
  - **Cannot** decrypt incoming encrypted messages from other users

- **Backend**: Has **private key only** (read from `.env` at runtime)
  - Can decrypt incoming requests
  - Can encrypt responses
  - Private key never leaves the server

### Security Benefits

✅ **Proper separation**: Private key stays on backend
✅ **Forward security**: Frontend can't decrypt messages meant for backend
✅ **Authentic responses**: Only backend (with private key) can create valid responses
✅ **Environment-based**: Keys loaded from `.env` files, not hardcoded

### Production Recommendations

For production use, also consider:

1. **Use HTTPS/TLS** for all communications (essential!)
2. **Implement proper key management** (rotation, storage, backup)
3. **Consider hybrid encryption** (RSA + AES) for larger payloads
4. **Add authentication/authorization** for user management
5. **Implement rate limiting** and other security best practices
6. **Add request signing** to prevent replay attacks
7. **Use secure key storage** (HSM, key vaults, etc.)

## Testing

### Backend Test Client

```bash
cd backend
bun run test
```

This runs a test client that:
1. Encrypts a name
2. Sends it to the API
3. Receives encrypted response
4. Decrypts and displays the greeting

### Example Output

```
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

## CORS Configuration

If you encounter CORS errors, add CORS middleware to the backend:

```bash
cd backend
bun add hono/cors
```

Then in `backend/src/index.ts`:

```typescript
import { cors } from 'hono/cors'

app.use('/*', cors({
  origin: 'http://localhost:8080',
  credentials: true,
}))
```

## Troubleshooting

### Backend won't start
- Ensure `.env` file exists with both RSA_PUBLIC_KEY and RSA_PRIVATE_KEY
- Run `bun run generate-keys` to create keys
- Check that Bun is installed (`bun --version`)
- Verify keys are properly formatted in `.env`

### Frontend build fails
- Ensure `.env` file exists in `frontend/` directory with RSA_PUBLIC_KEY
- Run `cd backend && bun run extract-keys` to get the public key
- Ensure Rust is installed (`rustc --version`)
- Install Trunk (`cargo install trunk`)
- Check that all dependencies compile (`cargo check`)

### Encryption/Decryption errors
- Verify frontend has the correct public key from backend
- Backend must have both RSA_PUBLIC_KEY and RSA_PRIVATE_KEY in `.env`
- Frontend must have RSA_PUBLIC_KEY in `.env`
- Check keys include BEGIN/END markers
- Ensure no whitespace/formatting issues in keys
- Keys must match - generate them together with `bun run generate-keys`

### CORS errors
- Add CORS middleware to backend (see above)
- Ensure backend is running before frontend
- Check browser console for specific error messages

## File Size Limitations

RSA can only encrypt data smaller than the key size:
- **RSA-2048 with OAEP-SHA256**: ~190 bytes max

For larger data, consider:
1. **Hybrid encryption**: RSA for key exchange, AES for data encryption
2. **Chunking**: Split data into smaller pieces
3. **Compression**: Compress before encrypting

Note: Response uses PKCS1 padding (not OAEP) to allow decryption with public key.

## Contributing

This is a POC project for educational purposes. Feel free to:
- Report issues
- Suggest improvements
- Fork and experiment
- Use as a learning resource

## License

MIT License - Feel free to use this code for learning and experimentation.

## Resources

- [Hono Documentation](https://hono.dev/)
- [Leptos Documentation](https://leptos.dev/)
- [RSA Encryption Overview](https://en.wikipedia.org/wiki/RSA_(cryptosystem))
- [OAEP Padding](https://en.wikipedia.org/wiki/Optimal_asymmetric_encryption_padding)
- [Bun Runtime](https://bun.sh/)

## Acknowledgments

Built to demonstrate asymmetric encryption in a full-stack web application using modern tools and frameworks.

---

**Note:** This application demonstrates proper key separation! The private key stays on the backend, and the frontend only has the public key. This is the correct approach for asymmetric encryption.
