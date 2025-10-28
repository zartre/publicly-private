# 🚀 Setup Guide - Publicly Private

Follow these steps to get the encrypted communication app running in under 5 minutes!

## Prerequisites

- [Bun](https://bun.sh/) installed
- [Rust](https://rustup.rs/) installed
- [Trunk](https://trunkrs.dev/) installed: `cargo install trunk`

---

## Step 1: Backend Setup ⚙️

```bash
# Navigate to backend
cd backend

# Install dependencies
bun install

# Generate RSA key pair
bun run generate-keys
```

✅ You should see output like:
```
Generating RSA key pair...
Keys generated successfully!

✓ Keys saved to .env file at: /path/to/backend/.env
```

---

## Step 2: Start the Backend 🚀

```bash
# Still in backend directory
bun run dev
```

✅ You should see:
```
Server is running on port 3000
```

**Keep this terminal window open!**

---

## Step 3: Copy Public Key to Frontend 🔑

Open a **new terminal window**:

```bash
# Navigate to backend
cd backend

# Extract public key for frontend
bun run extract-keys
```

✅ You'll see output like:
```
RSA_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQ...\n-----END PUBLIC KEY-----"
```

**Copy this line!**

---

## Step 4: Create Frontend .env File 📝

1. Navigate to the `frontend` directory
2. Create a new file called `.env`
3. Paste the `RSA_PUBLIC_KEY` line you copied
4. Save the file

**Example `frontend/.env` file:**
```env
RSA_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQ...\n-----END PUBLIC KEY-----"
```

**Important:** 
- ✅ Frontend only gets the **public key**
- ✅ Private key stays on the backend only
- ✅ This is the secure way to do asymmetric encryption!

---

## Step 5: Start the Frontend 🎨

```bash
# Navigate to frontend
cd ../frontend

# Run the frontend
trunk serve --open
```

✅ Your browser should automatically open to `http://localhost:8080`

---

## Step 6: Test It! ✨

1. You should see the "🔐 Encrypted Greeting App" page
2. Enter your name in the text field (e.g., "Alice")
3. Click "Send Encrypted Request"
4. Watch the magic happen! 🎉

You should see:
```
✅ Decrypted Response:
Hello Alice
```

---

## Verification Checklist ✓

- [ ] Backend running on `http://localhost:3000`
- [ ] Frontend running on `http://localhost:8080`
- [ ] Public key copied to `frontend/.env`
- [ ] Can enter name and receive encrypted greeting
- [ ] No CORS errors in browser console

---

## Troubleshooting 🔧

### "Failed to load RSA keys from environment"
- Make sure you ran `bun run generate-keys`
- Check that `backend/.env` file exists
- Verify the `.env` file contains `RSA_PUBLIC_KEY` and `RSA_PRIVATE_KEY`

### "Failed to parse public key"
- Double-check you copied the ENTIRE key including `-----BEGIN` and `-----END` markers
- Make sure the key is in the `frontend/.env` file
- Verify the format: `RSA_PUBLIC_KEY="-----BEGIN...-----END..."`
- Check that newlines are escaped as `\n` in the .env file

### CORS errors in browser
- The CORS middleware is already added to the backend
- Make sure backend is running on port 3000
- Make sure frontend is running on port 8080
- Check both backend and frontend are using the same keys
- Try refreshing the page

### "Failed to send request"
- Verify backend is running: visit `http://localhost:3000` in browser
- Check browser console for detailed error messages
- Make sure no firewall is blocking the requests

### Frontend won't compile
- Make sure `frontend/.env` file exists with RSA_PUBLIC_KEY
- Run `cargo check` to see detailed errors
- Make sure all dependencies are installed
- Try `cargo clean` then rebuild
- Verify the public key is properly formatted in .env

---

## Testing the Backend Only 🧪

Want to test the backend without the frontend?

```bash
cd backend
bun run test
```

This runs a test client that encrypts "Alice", sends it to the server, and decrypts the response.

---

## Architecture Overview 📐

```
┌──────────────────┐         ┌──────────────────┐
│    Frontend      │         │     Backend      │
│   (Leptos/Rust)  │         │   (Hono/Bun)     │
│  (PUBLIC KEY)    │         │  (PRIVATE KEY)   │
└──────────────────┘         └──────────────────┘
         │                            │
         │ 1. Encrypt "Alice"         │
         │    with PUBLIC KEY         │
         ├───────────────────────────>│
         │                            │
         │                            │ 2. Decrypt with
         │                            │    PRIVATE KEY
         │                            │
         │                            │ 3. Create greeting
         │                            │    "Hello Alice"
         │                            │
         │                            │ 4. Encrypt with
         │                            │    PRIVATE KEY
         │ 5. Return encrypted        │
         │<───────────────────────────┤
         │                            │
         │ 6. Decrypt with            │
         │    PUBLIC KEY              │
         │                            │
         │ 7. Display "Hello Alice"   │
         │                            │
```

---

## Next Steps 🎯

- Check out `README.md` for detailed documentation
- Read about security considerations
- Experiment with different names
- View encrypted payloads in browser DevTools
- Explore the code in `backend/src/crypto.ts` and `frontend/src/main.rs`

---

## Quick Commands Reference 📋

```bash
# Backend
cd backend
bun install              # Install dependencies
bun run generate-keys    # Generate RSA key pair
bun run dev             # Start server
bun run test            # Test the API
bun run extract-keys    # Extract public key for frontend

# Frontend
cd frontend
# First, create .env file with RSA_PUBLIC_KEY from backend
trunk serve --open      # Run development server
trunk build --release   # Build for production
```

---

**🎉 Congratulations!** You now have a working encrypted communication system!

**🔒 Security Note:** This setup follows proper asymmetric encryption:
- Frontend has **public key only** (can encrypt and decrypt responses)
- Backend has **private key only** (can decrypt requests and encrypt responses)
- Private key **never leaves the backend** - this is the secure way!