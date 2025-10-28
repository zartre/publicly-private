# ✅ Pre-Flight Checklist

Use this checklist to ensure everything is set up correctly before running the app.

## Prerequisites ✓

- [ ] Bun installed and working (`bun --version`)
- [ ] Rust installed and working (`rustc --version`)
- [ ] Cargo installed and working (`cargo --version`)
- [ ] Trunk installed (`trunk --version`)
  - If not: `cargo install trunk`

---

## Backend Setup ✓

### 1. Dependencies
- [ ] Navigated to `backend` directory
- [ ] Ran `bun install`
- [ ] No errors during installation

### 2. Key Generation
- [ ] Ran `bun run generate-keys`
- [ ] `.env` file created in `backend/` directory
- [ ] `.env` file contains `RSA_PUBLIC_KEY`
- [ ] `.env` file contains `RSA_PRIVATE_KEY`
- [ ] Keys include `-----BEGIN` and `-----END` markers

### 3. Backend Server
- [ ] Ran `bun run dev`
- [ ] Server started without errors
- [ ] Server running on `http://localhost:3000`
- [ ] Can visit `http://localhost:3000` in browser
- [ ] Browser shows "Hello Hono!"

---

## Frontend Setup ✓

### 1. Key Configuration
- [ ] Ran `bun run extract-keys` in backend directory
- [ ] Copied the RSA_PUBLIC_KEY line from the output
- [ ] Created `frontend/.env` file
- [ ] Pasted the RSA_PUBLIC_KEY line into `frontend/.env`
- [ ] Saved the file
- [ ] Verified format: `RSA_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"`

### 2. Key Validation
Verify your `frontend/.env` file looks like this:
```env
RSA_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END PUBLIC KEY-----"
```

- [ ] Public key is properly formatted
- [ ] Key has `"` at the start and `"` at the end
- [ ] Newlines are escaped as `\n`
- [ ] No extra quotes or characters
- [ ] File is saved in `frontend/` directory

### 3. Frontend Server
- [ ] Navigated to `frontend` directory
- [ ] Ran `trunk serve --open`
- [ ] No compilation errors
- [ ] Browser opened automatically
- [ ] Page loads at `http://localhost:8080`
- [ ] See "🔐 Encrypted Greeting App" title

---

## Application Testing ✓

### 1. Visual Check
- [ ] Text input field is visible
- [ ] "Send Encrypted Request" button is visible
- [ ] "How it works" section is visible
- [ ] No JavaScript errors in browser console

### 2. Functionality Test
- [ ] Entered a name (e.g., "Alice") in text field
- [ ] Clicked "Send Encrypted Request" button
- [ ] Button shows "Processing..." while loading
- [ ] No error message appears
- [ ] Green success box appears
- [ ] Decrypted response shows "Hello [YourName]"
- [ ] Response matches the name you entered

### 3. Multiple Tests
- [ ] Tested with different names (e.g., "Bob", "Charlie")
- [ ] Each test returns correct greeting
- [ ] No errors in browser console
- [ ] No errors in backend terminal

---

## Network Verification ✓

### 1. Browser DevTools
- [ ] Opened browser DevTools (F12)
- [ ] Went to Network tab
- [ ] Sent a request
- [ ] See POST request to `http://localhost:3000/encrypt-greeting`
- [ ] Request status is `200 OK`
- [ ] No CORS errors
- [ ] Response contains `encryptedGreeting` field

### 2. Payload Inspection
- [ ] Click on the network request
- [ ] View request payload
- [ ] See `name` field with base64-encoded data
- [ ] View response payload
- [ ] See `encryptedGreeting` field with base64-encoded data

---

## Common Issues ✓

If something isn't working, check these:

### Backend Issues
- [ ] `backend/.env` file exists and is not empty
- [ ] Both RSA_PUBLIC_KEY and RSA_PRIVATE_KEY are in backend `.env`
- [ ] Keys in `.env` are properly formatted
- [ ] No other process using port 3000
- [ ] Backend terminal shows no errors

### Frontend Issues
- [ ] `frontend/.env` file exists with RSA_PUBLIC_KEY
- [ ] Public key copied correctly from backend
- [ ] No compilation errors (`cargo check`)
- [ ] No other process using port 8080
- [ ] Browser console shows no errors

### Communication Issues
- [ ] Both backend and frontend are running
- [ ] Backend on port 3000, frontend on port 8080
- [ ] No firewall blocking localhost connections
- [ ] CORS middleware is enabled in backend
- [ ] Frontend has correct public key from backend

---

## Success Criteria ✓

You should be able to:
- [ ] Enter any name in the text field
- [ ] Click submit and receive encrypted greeting
- [ ] See "Hello [YourName]" as the decrypted response
- [ ] Repeat multiple times without errors
- [ ] See encrypted payloads in network tab
- [ ] No errors in browser console or terminal

---

## Next Steps

Once all items are checked:

1. ✅ **Everything works!** 
   - Experiment with different names
   - Inspect network traffic
   - Read the code to understand encryption flow

2. 🎓 **Learn More**
   - Read `FLOW.md` for detailed encryption flow
   - Check `README.md` for security considerations
   - Review `backend/src/crypto.ts` and `frontend/src/main.rs`

3. 🚀 **Go Further**
   - Modify the greeting format
   - Add more encrypted endpoints
   - Implement hybrid encryption (RSA + AES)
   - Add authentication
   - Add request signing to prevent replay attacks

---

## Troubleshooting Reference

| Issue | Check | Fix |
|-------|-------|-----|
| Backend won't start | `backend/.env` exists | Run `bun run generate-keys` |
| Frontend won't compile | `frontend/.env` exists | Run `bun run extract-keys` and create file |
| "Failed to parse key" | Key format | Check `.env` format with `\n` escapes |
| CORS error | Backend running | Verify CORS middleware in `index.ts` |
| Network error | Ports | Backend on 3000, frontend on 8080 |
| Decryption failed | Keys match | Public key must match backend's |

---

**🎉 All checked? You're ready to go!**

For help, see:
- `SETUP.md` - Step-by-step setup guide
- `README.md` - Complete documentation
- `FLOW.md` - Detailed encryption flow

**🔒 Security:** This setup is secure! Frontend only has the public key, backend only uses the private key.