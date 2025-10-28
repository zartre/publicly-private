# 🔄 Encryption Flow Diagram

## Complete Request/Response Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER INTERACTION                                 │
└─────────────────────────────────────────────────────────────────────────┘

User enters "Alice" in text field
         │
         ▼
    [Submit Button]
         │
         ▼

┌─────────────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Leptos/Rust/WASM)                        │
│                         http://localhost:8080                            │
│                      🔑 Has: PUBLIC KEY ONLY                             │
└─────────────────────────────────────────────────────────────────────────┘

Step 1: Encrypt the name
┌──────────────────────────────────────────────────────────────┐
│  Input: "Alice"                                              │
│  Key: RSA Public Key (2048-bit)                             │
│  Padding: OAEP with SHA-256                                 │
│  ↓                                                           │
│  Output: [encrypted bytes]                                  │
│  ↓                                                           │
│  Encode: Base64                                             │
│  ↓                                                           │
│  Result: "kX7vZ2J8mN3qR9sT1uV5wY0zA..."                    │
└──────────────────────────────────────────────────────────────┘
         │
         ▼

Step 2: Create HTTP request
┌──────────────────────────────────────────────────────────────┐
│  POST http://localhost:3000/encrypt-greeting                │
│  Headers:                                                    │
│    Content-Type: application/json                           │
│  Body:                                                       │
│    {                                                         │
│      "name": "kX7vZ2J8mN3qR9sT1uV5wY0zA..."               │
│    }                                                         │
└──────────────────────────────────────────────────────────────┘
         │
         │ HTTP POST
         ▼

┌─────────────────────────────────────────────────────────────────────────┐
│                      BACKEND (Hono/TypeScript/Bun)                      │
│                         http://localhost:3000                            │
│                      🔑 Has: PRIVATE KEY ONLY                            │
└─────────────────────────────────────────────────────────────────────────┘

Step 3: Receive encrypted request
┌──────────────────────────────────────────────────────────────┐
│  Received: { name: "kX7vZ2J8mN3qR9sT1uV5wY0zA..." }        │
└──────────────────────────────────────────────────────────────┘
         │
         ▼

Step 4: Decrypt the name
┌──────────────────────────────────────────────────────────────┐
│  Input: "kX7vZ2J8mN3qR9sT1uV5wY0zA..."                     │
│  ↓                                                           │
│  Decode: Base64 → [encrypted bytes]                        │
│  ↓                                                           │
│  Key: RSA Private Key (2048-bit)                           │
│  Padding: OAEP with SHA-256                                 │
│  ↓                                                           │
│  Decrypt: [encrypted bytes] → [decrypted bytes]            │
│  ↓                                                           │
│  Output: "Alice"                                            │
└──────────────────────────────────────────────────────────────┘
         │
         ▼

Step 5: Process the data
┌──────────────────────────────────────────────────────────────┐
│  const name = "Alice";                                       │
│  const greeting = `Hello ${name}`;                          │
│  ↓                                                           │
│  Result: "Hello Alice"                                       │
└──────────────────────────────────────────────────────────────┘
         │
         ▼

Step 6: Encrypt the response
┌──────────────────────────────────────────────────────────────┐
│  Input: "Hello Alice"                                        │
│  Key: RSA Private Key (2048-bit)                            │
│  Padding: PKCS1 (allows public key decryption)              │
│  ↓                                                           │
│  Output: [encrypted bytes]                                  │
│  ↓                                                           │
│  Encode: Base64                                             │
│  ↓                                                           │
│  Result: "mY8nP1qS3tU7vW9xZ0aB2cD4eF..."                   │
└──────────────────────────────────────────────────────────────┘
         │
         ▼

Step 7: Send HTTP response
┌──────────────────────────────────────────────────────────────┐
│  Status: 200 OK                                              │
│  Headers:                                                    │
│    Content-Type: application/json                           │
│  Body:                                                       │
│    {                                                         │
│      "encryptedGreeting": "mY8nP1qS3tU7vW9xZ0aB2cD4eF...", │
│      "message": "Greeting encrypted successfully"           │
│    }                                                         │
└──────────────────────────────────────────────────────────────┘
         │
         │ HTTP Response
         ▼

┌─────────────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Leptos/Rust/WASM)                        │
│                      🔑 Has: PUBLIC KEY ONLY                             │
└─────────────────────────────────────────────────────────────────────────┘

Step 8: Receive encrypted response
┌──────────────────────────────────────────────────────────────┐
│  Received: { encryptedGreeting: "mY8nP1qS3tU7vW9..." }      │
└──────────────────────────────────────────────────────────────┘
         │
         ▼

Step 9: Decrypt the response
┌──────────────────────────────────────────────────────────────┐
│  Input: "mY8nP1qS3tU7vW9xZ0aB2cD4eF..."                     │
│  ↓                                                           │
│  Decode: Base64 → [encrypted bytes]                        │
│  ↓                                                           │
│  Key: RSA Public Key (2048-bit)                            │
│  Padding: PKCS1 (decrypt data encrypted with private key)   │
│  ↓                                                           │
│  Decrypt: [encrypted bytes] → [decrypted bytes]            │
│  ↓                                                           │
│  Output: "Hello Alice"                                      │
└──────────────────────────────────────────────────────────────┘
         │
         ▼

Step 10: Display to user
┌──────────────────────────────────────────────────────────────┐
│  ✅ Decrypted Response:                                     │
│  Hello Alice                                                 │
└──────────────────────────────────────────────────────────────┘
```

---

## Data Transformation Timeline

```
TIME  │  LOCATION       │  DATA STATE                    │  ENCODING
──────┼─────────────────┼────────────────────────────────┼──────────────
  T0  │  User Input     │  "Alice"                       │  Plain text
  ↓   │                 │                                │
  T1  │  Frontend       │  [Encrypt with Public Key]     │  
  ↓   │                 │                                │
  T2  │  Frontend       │  kX7vZ2...                     │  Base64
  ↓   │                 │                                │
  T3  │  HTTP Request   │  {"name":"kX7vZ2..."}          │  JSON
  ↓   │                 │                                │
──────┼─────────────────┼────────────────────────────────┼──────────────
  T4  │  Backend        │  {"name":"kX7vZ2..."}          │  JSON
  ↓   │                 │                                │
  T5  │  Backend        │  [Decrypt with Private Key]    │
  ↓   │                 │                                │
  T6  │  Backend        │  "Alice"                       │  Plain text
  ↓   │                 │                                │
  T7  │  Backend        │  "Hello Alice"                 │  Plain text
  ↓   │                 │                                │
  T8  │  Backend        │  [Encrypt with Private Key]    │
  ↓   │                 │                                │
  T9  │  Backend        │  mY8nP1...                     │  Base64
  ↓   │                 │                                │
  T10 │  HTTP Response  │  {"encryptedGreeting":"mY..."}│  JSON
  ↓   │                 │                                │
──────┼─────────────────┼────────────────────────────────┼──────────────
  T11 │  Frontend       │  {"encryptedGreeting":"mY..."}│  JSON
  ↓   │                 │                                │
  T12 │  Frontend       │  [Decrypt with Public Key]     │
  ↓   │                 │                                │
  T13 │  Frontend       │  "Hello Alice"                 │  Plain text
  ↓   │                 │                                │
  T14 │  UI Display     │  Hello Alice                   │  Rendered
```

---

## Key Usage Map

```
┌────────────────────────────────────────────────────────────────┐
│                        RSA KEY PAIR                            │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  PUBLIC KEY (RSA-2048)                                        │
│  • Used for ENCRYPTION (request)                              │
│  • Used for DECRYPTION (response from server)                 │
│  • Can be shared publicly                                     │
│  • Present in: Frontend (.env) - loaded at compile time       │
│  • Also stored in: Backend (.env) - for distribution          │
│                                                                │
│  PRIVATE KEY (RSA-2048)                                       │
│  • Used for DECRYPTION (request)                              │
│  • Used for ENCRYPTION (response)                             │
│  • Must be kept secret                                        │
│  • Present in: Backend (.env) ONLY - never leaves server!     │
│                                                                │
│  ✅ SECURE: Private key stays on backend, frontend only has   │
│             public key - frontend cannot decrypt incoming data!│
└────────────────────────────────────────────────────────────────┘

ENCRYPTION OPERATIONS:
┌──────────────┬─────────────┬──────────────┬─────────────────┐
│  Location    │  Operation  │  Key Used    │  Data           │
├──────────────┼─────────────┼──────────────┼─────────────────┤
│  Frontend    │  Encrypt    │  PUBLIC      │  "Alice"        │
│  Backend     │  Decrypt    │  PRIVATE     │  "Alice"        │
│  Backend     │  Encrypt    │  PRIVATE     │  "Hello Alice"  │
│  Frontend    │  Decrypt    │  PUBLIC      │  "Hello Alice"  │
└──────────────┴─────────────┴──────────────┴─────────────────┘
```

---

## Network Traffic

```
CLIENT (Frontend)                           SERVER (Backend)
http://localhost:8080                       http://localhost:3000

      │                                            │
      │  POST /encrypt-greeting                   │
      │  Content-Type: application/json           │
      │  {                                         │
      │    "name": "kX7vZ2J8mN3qR9sT1uV5wY..."  │
      │  }                                         │
      ├───────────────────────────────────────────>│
      │                                            │
      │                                    [Process Request]
      │                                            │
      │                                    • Parse JSON
      │                                    • Extract encrypted name
      │                                    • Decrypt with private key
      │                                    • Get "Alice"
      │                                    • Create "Hello Alice"
      │                                    • Encrypt with public key
      │                                    • Prepare response
      │                                            │
      │  HTTP 200 OK                              │
      │  Content-Type: application/json           │
      │  {                                         │
      │    "encryptedGreeting": "mY8nP1qS3...",  │
      │    "message": "Greeting encrypted..."     │
      │  }                                         │
      │<───────────────────────────────────────────┤
      │                                            │
[Process Response]                                 │
      │                                            │
• Parse JSON                                       │
• Extract encrypted greeting                       │
• Decrypt with private key                         │
• Get "Hello Alice"                                │
• Display to user                                  │
```

---

## Cryptographic Details

```
┌─────────────────────────────────────────────────────────────┐
│                   RSA ENCRYPTION DETAILS                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Algorithm:     RSA (Rivest-Shamir-Adleman)               │
│  Key Size:      2048 bits                                  │
│                                                             │
│  REQUEST (Frontend → Backend):                             │
│  • Padding:       OAEP with SHA-256                        │
│  • Encrypt with:  Public Key                               │
│  • Decrypt with:  Private Key                              │
│  • Max Plaintext: ~190 bytes                               │
│                                                             │
│  RESPONSE (Backend → Frontend):                            │
│  • Padding:       PKCS1                                    │
│  • Encrypt with:  Private Key                              │
│  • Decrypt with:  Public Key                               │
│  • Max Plaintext: ~245 bytes                               │
│                                                             │
│  Encoding:      Base64 (for transport)                     │
│  Ciphertext:    256 bytes (always, regardless of input)    │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                   ENCRYPTION FORMULAS                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  REQUEST:                                                   │
│    Encryption: C = E(M, PubKey)   [Client]                │
│    Decryption: M = D(C, PrivKey)  [Server]                │
│                                                             │
│  RESPONSE:                                                  │
│    Encryption: C = E(M, PrivKey)  [Server]                │
│    Decryption: M = D(C, PubKey)   [Client]                │
│                                                             │
│  where:                                                     │
│    • C = Ciphertext                                        │
│    • M = Message (plaintext)                               │
│    • E = Encryption function                               │
│    • D = Decryption function                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Error Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    POTENTIAL ERROR POINTS                   │
└─────────────────────────────────────────────────────────────┘

Frontend:
  ❌ Invalid key format
     → "Failed to parse public/private key"
     
  ❌ Encryption failure
     → "Failed to encrypt"
     
  ❌ Network error
     → "Failed to send request: NetworkError"
     
  ❌ CORS error
     → "Access-Control-Allow-Origin"
     
  ❌ Decryption failure
     → "Failed to decrypt"

Backend:
  ❌ Missing .env file
     → "RSA_PUBLIC_KEY and RSA_PRIVATE_KEY must be set"
     
  ❌ Invalid request format
     → 'Missing "name" field in request body'
     
  ❌ Decryption failure
     → "Failed to process encrypted data"
     
  ❌ Server error
     → HTTP 500
```

---

## Security Considerations

```
┌─────────────────────────────────────────────────────────────┐
│                     SECURITY ANALYSIS                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ✅ SECURE ASPECTS:                                        │
│     • RSA-2048 (industry standard)                         │
│     • OAEP padding for request encryption                  │
│     • SHA-256 cryptographic hash                           │
│     • Proper key separation:                               │
│       - Frontend: PUBLIC KEY ONLY                          │
│       - Backend: PRIVATE KEY ONLY                          │
│     • Private key never leaves backend                     │
│     • Frontend cannot decrypt incoming messages            │
│     • Keys in environment variables                        │
│     • .env excluded from version control                   │
│                                                             │
│  ⚠️  ADDITIONAL PRODUCTION NEEDS:                          │
│     • No TLS/HTTPS (add for production!)                   │
│     • No authentication/authorization                      │
│     • No rate limiting                                     │
│     • No key rotation                                      │
│     • Data size limited (~190 bytes request, ~245 response)│
│     • No request signing (prevent replay attacks)          │
│                                                             │
│  🔒 PRODUCTION ENHANCEMENTS:                               │
│     • Add HTTPS/TLS for all communication                  │
│     • Implement proper key management system               │
│     • Add authentication & authorization                   │
│     • Implement rate limiting & DDoS protection            │
│     • Add monitoring & logging                             │
│     • Regular security audits                              │
│     • Hybrid encryption (RSA+AES) for large data           │
│     • Request signing to prevent replay attacks            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```
