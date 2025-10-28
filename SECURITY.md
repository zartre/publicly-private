# 🔒 Security Model

This document explains the security architecture of the Publicly Private application.

## Overview

This application implements **proper asymmetric encryption** with correct key separation:

- **Frontend**: Has **PUBLIC KEY ONLY**
- **Backend**: Has **PRIVATE KEY ONLY**

This is the secure way to implement RSA encryption in a client-server architecture.

---

## Key Distribution

```
┌─────────────────────────────────────────────────────────────┐
│                    KEY DISTRIBUTION                         │
└─────────────────────────────────────────────────────────────┘

                    [RSA Key Pair Generated]
                             │
                             ▼
                    ┌────────────────┐
                    │  backend/.env  │
                    ├────────────────┤
                    │ RSA_PUBLIC_KEY │
                    │ RSA_PRIVATE_KEY│
                    └────────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
        [PUBLIC KEY]              [PRIVATE KEY]
       Shared with Frontend      Stays on Backend
                │                         │
                ▼                         │
        ┌────────────────┐                │
        │ frontend/.env  │                │
        ├────────────────┤                │
        │ RSA_PUBLIC_KEY │                │
        └────────────────┘                │
                │                         │
                │                         │
                ▼                         ▼
        ┌──────────────┐          ┌──────────────┐
        │   FRONTEND   │          │   BACKEND    │
        │   (Browser)  │          │   (Server)   │
        ├──────────────┤          ├──────────────┤
        │ PUBLIC KEY   │◄────────►│ PRIVATE KEY  │
        │ ONLY         │  Secure  │ ONLY         │
        └──────────────┘  Channel └──────────────┘
```

---

## Security Guarantees

### ✅ Frontend Security

```
┌─────────────────────────────────────────────────────────────┐
│                   FRONTEND CAPABILITIES                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  HAS: Public Key Only                                       │
│                                                             │
│  CAN DO:                                                    │
│  ✓ Encrypt data to send to backend                         │
│  ✓ Decrypt responses from backend (signed with private key)│
│                                                             │
│  CANNOT DO:                                                 │
│  ✗ Decrypt messages meant for backend                      │
│  ✗ Impersonate backend (no private key)                    │
│  ✗ Read encrypted data from other users                    │
│                                                             │
│  SECURITY BENEFIT:                                          │
│  Even if frontend is compromised, attacker only gets        │
│  public key - cannot decrypt sensitive incoming data!       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### ✅ Backend Security

```
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND CAPABILITIES                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  HAS: Private Key Only                                      │
│                                                             │
│  CAN DO:                                                    │
│  ✓ Decrypt incoming requests from clients                  │
│  ✓ Sign responses with private key                         │
│  ✓ Verify requests were encrypted with matching public key │
│                                                             │
│  CANNOT HAPPEN:                                             │
│  ✗ Private key never transmitted to clients                │
│  ✗ Private key never in frontend code                      │
│  ✗ Private key never exposed via API                       │
│                                                             │
│  SECURITY BENEFIT:                                          │
│  Private key stays on server - complete control over        │
│  decryption and authentic response generation.              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Encryption Flow

### Request Flow (Client → Server)

```
┌──────────────┐                              ┌──────────────┐
│   Frontend   │                              │   Backend    │
│ (Public Key) │                              │(Private Key) │
└──────────────┘                              └──────────────┘
      │                                              │
      │ 1. User enters "Alice"                       │
      │                                              │
      │ 2. Encrypt with PUBLIC KEY                   │
      │    Algorithm: RSA-OAEP-SHA256                │
      │    Input: "Alice"                            │
      │    Output: [encrypted bytes]                 │
      │                                              │
      │ 3. POST /encrypt-greeting                    │
      │    Body: { name: "kX7vZ2..." }               │
      ├─────────────────────────────────────────────>│
      │                                              │
      │                                              │ 4. Decrypt with PRIVATE KEY
      │                                              │    Algorithm: RSA-OAEP-SHA256
      │                                              │    Input: [encrypted bytes]
      │                                              │    Output: "Alice"
      │                                              │
      │                                              │ 5. Process request
      │                                              │    Create: "Hello Alice"
```

### Response Flow (Server → Client)

```
┌──────────────┐                              ┌──────────────┐
│   Frontend   │                              │   Backend    │
│ (Public Key) │                              │(Private Key) │
└──────────────┘                              └──────────────┘
      │                                              │
      │                                              │ 6. Encrypt with PRIVATE KEY
      │                                              │    Algorithm: RSA-PKCS1
      │                                              │    Input: "Hello Alice"
      │                                              │    Output: [encrypted bytes]
      │                                              │
      │ 7. HTTP Response                             │
      │    { encryptedGreeting: "mY8nP1..." }        │
      │<─────────────────────────────────────────────┤
      │                                              │
      │ 8. Decrypt with PUBLIC KEY                   │
      │    Algorithm: RSA-PKCS1                      │
      │    Input: [encrypted bytes]                  │
      │    Output: "Hello Alice"                     │
      │                                              │
      │ 9. Display to user                           │
      │                                              │
```

---

## Cryptographic Details

### Request Encryption (Client → Server)

```
Algorithm:  RSA with OAEP padding
Key Used:   Public Key (2048-bit)
Padding:    OAEP (Optimal Asymmetric Encryption Padding)
Hash:       SHA-256
Max Size:   ~190 bytes

Purpose:    Ensures only the server (with private key) can decrypt
Security:   OAEP prevents padding oracle attacks
            SHA-256 provides strong cryptographic hash
```

### Response Encryption (Server → Client)

```
Algorithm:  RSA with PKCS1 padding
Key Used:   Private Key (2048-bit)
Padding:    PKCS1 v1.5
Hash:       N/A (padding scheme doesn't use hash)
Max Size:   ~245 bytes

Purpose:    Allows client to verify response authenticity
            Only server with private key can create valid responses
Security:   Client can decrypt with public key
            Proves response came from server with private key
```

---

## Attack Resistance

### ✅ Protected Against

| Attack Type | Protection |
|-------------|------------|
| Man-in-the-Middle | Data encrypted end-to-end; attacker can't read content |
| Eavesdropping | All data encrypted; only backend can decrypt requests |
| Frontend Compromise | Attacker only gets public key; can't decrypt incoming data |
| Response Tampering | Only server with private key can create valid responses |
| Key Exposure | Private key never transmitted; stays on server |

### ⚠️ Requires Additional Protection

| Attack Type | Recommendation |
|-------------|----------------|
| Replay Attacks | Add timestamp/nonce to requests |
| Session Hijacking | Implement authentication/session management |
| DDoS | Implement rate limiting |
| TLS Stripping | Use HTTPS/TLS for transport |
| Server Compromise | Secure server infrastructure, key storage |

---

## Comparison: Secure vs Insecure

### ❌ Insecure Approach (DON'T DO THIS)

```
Frontend: Has public key + private key
Backend:  Has public key + private key

Problem: If frontend is compromised, attacker gets private key
         and can decrypt ALL messages!
```

### ✅ Secure Approach (THIS APPLICATION)

```
Frontend: Has public key ONLY
Backend:  Has private key ONLY

Benefit: Even if frontend is compromised, attacker only gets
         public key - cannot decrypt messages meant for backend!
```

---

## Security Best Practices Implemented

### ✅ Key Management
- [x] Private key only on backend
- [x] Public key freely distributed
- [x] Keys stored in environment variables
- [x] .env files excluded from version control
- [x] Keys loaded securely (runtime for backend, compile-time for frontend)

### ✅ Encryption Standards
- [x] RSA-2048 (industry standard key size)
- [x] OAEP padding for request encryption
- [x] Strong hash function (SHA-256)
- [x] Proper encoding (Base64) for transport

### ✅ Code Security
- [x] No hardcoded keys
- [x] Type-safe implementations (Rust + TypeScript)
- [x] Error handling for crypto operations
- [x] CORS configured for known origins

---

## Production Recommendations

To make this production-ready, add:

### 🔒 Transport Security
```
[ ] HTTPS/TLS for all communications
[ ] Certificate pinning (mobile apps)
[ ] HTTP Strict Transport Security (HSTS)
```

### 🔒 Request Security
```
[ ] Request signing/MAC
[ ] Timestamp/nonce to prevent replay attacks
[ ] Request rate limiting
[ ] Input validation and sanitization
```

### 🔒 Authentication & Authorization
```
[ ] User authentication (OAuth, JWT, etc.)
[ ] Session management
[ ] Role-based access control (RBAC)
[ ] API key management
```

### 🔒 Key Management
```
[ ] Key rotation policy
[ ] Secure key storage (HSM, key vault)
[ ] Key backup and recovery
[ ] Audit logging for key usage
```

### 🔒 Data Protection
```
[ ] Hybrid encryption (RSA + AES) for large payloads
[ ] Data compression before encryption
[ ] Database encryption at rest
[ ] Secure deletion of sensitive data
```

### 🔒 Monitoring & Logging
```
[ ] Security event logging
[ ] Anomaly detection
[ ] Failed decryption monitoring
[ ] Performance monitoring
```

---

## Threat Model

### Assets to Protect
1. **Private Key** (Critical) - Must never be exposed
2. **User Data** (High) - Messages, personal information
3. **Session Data** (Medium) - Temporary request/response data

### Trust Boundaries
```
┌────────────────────────────────────────────────────────┐
│  Client (Browser)                                      │
│  Trust Level: UNTRUSTED                                │
│  • User can inspect code                              │
│  • User can modify client-side data                   │
│  • Malware could compromise browser                   │
│  ✓ Only given public key - acceptable to expose       │
└────────────────────────────────────────────────────────┘
                        │
                        │ Encrypted Channel
                        │
┌────────────────────────────────────────────────────────┐
│  Server (Backend)                                      │
│  Trust Level: TRUSTED                                  │
│  • Controlled environment                             │
│  • Secure key storage                                 │
│  • Only admins have access                            │
│  ✓ Has private key - must be protected                │
└────────────────────────────────────────────────────────┘
```

### Assumptions
- Backend environment is secure
- .env files are properly protected
- No malicious code in dependencies
- OS-level crypto libraries are secure

---

## Compliance Considerations

### Data Protection
- **GDPR**: Encryption helps protect personal data
- **HIPAA**: Strong encryption for health data (if applicable)
- **PCI DSS**: Encryption of cardholder data (if applicable)

### Key Length
- **NIST**: Recommends 2048-bit minimum (✓ We use 2048-bit)
- **FIPS 140-2**: RSA key generation standards
- **Common Criteria**: Cryptographic module standards

---

## Security Audit Checklist

- [ ] Private key never appears in frontend code
- [ ] Private key never transmitted over network
- [ ] Public key properly distributed to frontend
- [ ] .env files excluded from version control
- [ ] No hardcoded keys in source code
- [ ] Proper error handling (no key leakage in errors)
- [ ] CORS properly configured
- [ ] All crypto operations use standard libraries
- [ ] Key size meets security standards (2048-bit ✓)
- [ ] Padding schemes are appropriate (OAEP ✓, PKCS1 ✓)

---

## Summary

This application demonstrates **proper asymmetric encryption** with:

✅ **Correct key separation**: Frontend has public key only, backend has private key only  
✅ **Industry standards**: RSA-2048 with proper padding  
✅ **Secure architecture**: Private key never leaves the server  
✅ **Environment-based**: No hardcoded secrets  
✅ **Type safety**: Rust and TypeScript for reliability  

For production use, add HTTPS, authentication, request signing, and proper key management.

---

**Remember**: The security of this system relies on keeping the private key secure on the backend. Never expose it to clients or commit it to version control!