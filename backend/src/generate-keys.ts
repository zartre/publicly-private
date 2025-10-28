import { generateKeyPairSync } from 'crypto';
import { writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Generates an RSA key pair and saves them to a .env file
 */
function generateRSAKeyPair() {
  console.log('Generating RSA key pair...');

  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });

  console.log('Keys generated successfully!\n');

  // Create .env file content
  const envContent = `# RSA Public Key (PEM format)
RSA_PUBLIC_KEY="${publicKey.replace(/\n/g, '\\n')}"

# RSA Private Key (PEM format)
# Keep this secret and never commit to version control!
RSA_PRIVATE_KEY="${privateKey.replace(/\n/g, '\\n')}"
`;

  // Write to .env file
  const envPath = join(import.meta.dir, '..', '.env');
  writeFileSync(envPath, envContent);

  console.log(`✓ Keys saved to .env file at: ${envPath}`);
  console.log('\nPublic Key:');
  console.log(publicKey);
  console.log('\nPrivate Key:');
  console.log(privateKey);
  console.log('\n⚠️  WARNING: Keep your private key secure and never commit it to version control!');
}

// Run the key generation
generateRSAKeyPair();
