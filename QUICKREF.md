# 🚀 Quick Reference Card

## Setup (First Time)

```bash
# 1. Backend Setup
cd backend
bun install
bun run generate-keys        # Creates backend/.env with both keys
bun run dev                  # Start server on port 3000

# 2. Frontend Setup (new terminal)
cd backend
bun run extract-keys         # Shows public key

# Copy the RSA_PUBLIC_KEY line, then:
cd ../frontend
# Create .env file and paste the RSA_PUBLIC_KEY line
trunk serve --open           # Start frontend on port 8080
```

---

## Key Commands

### Backend
```bash
bun install              # Install dependencies
bun run generate-keys    # Generate RSA key pair → backend/.env
bun run dev             # Start development server
bun run test            # Test the encryption
bun run example         # Run example client (public key only)
bun run extract-keys    # Get public key for frontend
bun run verify          # Verify backend setup
```

### Frontend
```bash
trunk serve --open      # Development server
trunk build --release   # Production build
cargo check            # Check for errors
```

---

## File Structure

```
backend/.env              ← Both keys (private + public)
frontend/.env             ← Public key only
```

---

## Security Model

```
┌──────────────┐         ┌──────────────┐
│   Frontend   │         │   Backend    │
│ PUBLIC KEY   │────────►│ PRIVATE KEY  │
│   ONLY       │  HTTPS  │    ONLY      │
└──────────────┘         └──────────────┘
```

**Frontend Can:**
- ✅ Encrypt data to send to server
- ✅ Decrypt server responses

**Frontend Cannot:**
- ❌ Decrypt messages meant for backend
- ❌ Impersonate the server

---

## Encryption Flow

```
1. User enters "Alice"
2. Frontend encrypts with PUBLIC key → "kX7vZ2..."
3. POST to backend
4. Backend decrypts with PRIVATE key → "Alice"
5. Backend creates "Hello Alice"
6. Backend encrypts with PRIVATE key → "mY8nP1..."
7. Frontend decrypts with PUBLIC key → "Hello Alice"
8. Display to user
```

---

## Environment Variables

### backend/.env
```env
RSA_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
RSA_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

### frontend/.env
```env
RSA_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Backend won't start | Run `bun run generate-keys` |
| Frontend won't build | Create `frontend/.env` with public key |
| "Failed to parse key" | Check `.env` format with `\n` escapes |
| CORS error | Backend CORS middleware already added |
| Wrong greeting | Verify keys match between frontend/backend |

---

## API Endpoint

**POST /encrypt-greeting**

Request:
```json
{
  "name": "<base64-encrypted-name>"
}
```

Response:
```json
{
  "encryptedGreeting": "<base64-encrypted-greeting>",
  "message": "Greeting encrypted successfully"
}
```

---

## URLs

- Backend: `http://localhost:3000`
- Frontend: `http://localhost:8080`
- Health check: `http://localhost:3000/` → "Hello Hono!"

---

## Security Checklist

- [x] Private key only on backend ✅
- [x] Public key only on frontend ✅
- [x] Keys in .env files ✅
- [x] .env excluded from git ✅
- [ ] Add HTTPS for production
- [ ] Add authentication
- [ ] Add request signing

---

## Tech Stack

**Backend:**
- Runtime: Bun
- Framework: Hono
- Language: TypeScript
- Crypto: Node.js crypto module

**Frontend:**
- Framework: Leptos 0.8 (CSR)
- Language: Rust
- Build: Trunk
- Crypto: rsa crate

---

## Key Sizes & Limits

- Key Size: RSA-2048
- Request max: ~190 bytes (OAEP-SHA256)
- Response max: ~245 bytes (PKCS1)
- For larger data: Use hybrid encryption (RSA + AES)

---

## Documentation

- `README.md` - Complete overview
- `SETUP.md` - Step-by-step setup
- `SECURITY.md` - Security model
- `FLOW.md` - Encryption flow diagrams
- `CHECKLIST.md` - Pre-flight checklist
- `CHANGES.md` - What changed
- `QUICKREF.md` - This file

---

## Quick Test

```bash
# Terminal 1: Backend
cd backend && bun run dev

# Terminal 2: Test the API
cd backend && bun run test

# Or run the example client
cd backend && bun run example

# Terminal 3: Frontend
cd frontend && trunk serve --open
```

---

**🎯 Remember**: Frontend has PUBLIC key only, Backend has PRIVATE key only. This is secure! ✅