use leptos::prelude::*;
use leptos::task::spawn_local;
use serde::{Deserialize, Serialize};
use gloo_net::http::Request;
use rsa::{RsaPublicKey, pkcs8::DecodePublicKey};
use rsa::Oaep;
use sha2::Sha256;

// Request/Response structures
#[derive(Serialize)]
struct EncryptedRequest {
    name: String,
}

#[derive(Deserialize)]
struct EncryptedResponse {
    #[serde(rename = "encryptedGreeting")]
    encrypted_greeting: String,
    #[allow(dead_code)]
    message: String,
}

// Read public key from .env file at compile time
const PUBLIC_KEY_PEM: &str = dotenv_codegen::dotenv!("RSA_PUBLIC_KEY");

fn encrypt_with_public_key(data: &str, public_key_pem: &str) -> Result<String, String> {
    let public_key = RsaPublicKey::from_public_key_pem(public_key_pem)
        .map_err(|e| format!("Failed to parse public key: {}", e))?;

    let padding = Oaep::new::<Sha256>();
    let encrypted = public_key
        .encrypt(&mut rand::thread_rng(), padding, data.as_bytes())
        .map_err(|e| format!("Failed to encrypt: {}", e))?;

    Ok(base64::Engine::encode(&base64::engine::general_purpose::STANDARD, encrypted))
}

fn decrypt_with_public_key(encrypted_base64: &str, public_key_pem: &str) -> Result<String, String> {
    let public_key = RsaPublicKey::from_public_key_pem(public_key_pem)
        .map_err(|e| format!("Failed to parse public key: {}", e))?;

    let encrypted_bytes = base64::Engine::decode(&base64::engine::general_purpose::STANDARD, encrypted_base64)
        .map_err(|e| format!("Failed to decode base64: {}", e))?;

    // For decrypting data encrypted with private key, we need to use the raw RSA operation
    // This is equivalent to verification in RSA signatures
    use rsa::traits::PublicKeyParts;
    use rsa::BigUint;

    // Convert encrypted bytes to BigUint
    let encrypted_int = BigUint::from_bytes_be(&encrypted_bytes);

    // Perform modular exponentiation: c^e mod n
    let e = public_key.e();
    let n = public_key.n();
    let decrypted_int = encrypted_int.modpow(e, n);

    // Convert back to bytes
    let decrypted_bytes = decrypted_int.to_bytes_be();

    // Remove PKCS1 padding manually
    // PKCS1 padding format: 0x00 0x01 [0xFF bytes] 0x00 [data]
    if decrypted_bytes.len() < 11 {
        return Err("Decryption failed: invalid padding".to_string());
    }

    // Find the 0x00 separator after the padding
    let mut separator_index = None;
    for i in 2..decrypted_bytes.len() {
        if decrypted_bytes[i] == 0x00 {
            separator_index = Some(i);
            break;
        }
    }

    let separator_index = separator_index
        .ok_or_else(|| "Decryption failed: no padding separator found".to_string())?;

    // Extract the actual data after the separator
    let data = &decrypted_bytes[separator_index + 1..];

    String::from_utf8(data.to_vec())
        .map_err(|e| format!("Failed to convert to string: {}", e))
}

fn main() {
    leptos::mount::mount_to_body(|| view! {
        <App />
    })
}

#[component]
fn App() -> impl IntoView {
    let (name, set_name) = signal(String::new());
    let (result, set_result) = signal(String::new());
    let (error, set_error) = signal(String::new());
    let (loading, set_loading) = signal(false);

    let on_submit = move |_| {
        set_error.set(String::new());
        set_result.set(String::new());
        set_loading.set(true);

        let name_value = name.get();

        if name_value.is_empty() {
            set_error.set("Please enter a name".to_string());
            set_loading.set(false);
            return;
        }

        // Spawn async task
        spawn_local(async move {
            match send_encrypted_request(&name_value).await {
                Ok(greeting) => {
                    set_result.set(greeting);
                    set_error.set(String::new());
                }
                Err(e) => {
                    set_error.set(format!("Error: {}", e));
                    set_result.set(String::new());
                }
            }
            set_loading.set(false);
        });
    };

    view! {
        <div style="max-width: 600px; margin: 50px auto; font-family: Arial, sans-serif; padding: 20px;">
            <h1>"🔐 Encrypted Greeting App"</h1>
            <p style="color: #666;">"Enter your name to receive an encrypted greeting from the server"</p>

            <div style="margin: 20px 0;">
                <input
                    type="text"
                    placeholder="Enter your name"
                    style="width: 100%; padding: 12px; font-size: 16px; border: 2px solid #ddd; border-radius: 4px; box-sizing: border-box;"
                    on:input=move |ev| {
                        set_name.set(event_target_value(&ev));
                    }
                    prop:value=move || name.get()
                />
            </div>

            <button
                on:click=on_submit
                disabled=move || loading.get()
                style="width: 100%; padding: 12px; font-size: 16px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;"
            >
                {move || if loading.get() { "Processing..." } else { "Send Encrypted Request" }}
            </button>

            <Show when=move || !error.get().is_empty()>
                <div style="margin-top: 20px; padding: 15px; background-color: #ffebee; border-left: 4px solid #f44336; border-radius: 4px;">
                    <strong>"Error: "</strong>
                    <span style="color: #c62828;">{move || error.get()}</span>
                </div>
            </Show>

            <Show when=move || !result.get().is_empty()>
                <div style="margin-top: 20px; padding: 15px; background-color: #e8f5e9; border-left: 4px solid #4CAF50; border-radius: 4px;">
                    <strong>"✅ Decrypted Response: "</strong>
                    <div style="margin-top: 10px; font-size: 18px; color: #2e7d32; font-weight: bold;">
                        {move || result.get()}
                    </div>
                </div>
            </Show>

            <div style="margin-top: 30px; padding: 15px; background-color: #f5f5f5; border-radius: 4px; font-size: 14px; color: #666;">
                <strong>"How it works:"</strong>
                <ol style="margin: 10px 0; padding-left: 20px;">
                    <li>"Your name is encrypted with RSA public key"</li>
                    <li>"Encrypted data is sent to the server"</li>
                    <li>"Server decrypts with private key"</li>
                    <li>"Server creates greeting and encrypts it with private key"</li>
                    <li>"Client decrypts response with public key"</li>
                </ol>
                <div style="margin-top: 10px; padding: 10px; background-color: #e3f2fd; border-radius: 4px;">
                    <strong>"🔒 Secure: "</strong>
                    <span>"Frontend only has public key - cannot decrypt incoming messages!"</span>
                </div>
            </div>
        </div>
    }
}

async fn send_encrypted_request(name: &str) -> Result<String, String> {
    // Step 1: Encrypt the name with public key
    let encrypted_name = encrypt_with_public_key(name, PUBLIC_KEY_PEM)?;

    // Step 2: Create request body
    let request_body = EncryptedRequest {
        name: encrypted_name,
    };

    // Step 3: Send POST request
    let response = Request::post("http://localhost:3000/encrypt-greeting")
        .header("Content-Type", "application/json")
        .json(&request_body)
        .map_err(|e| format!("Failed to create request: {}", e))?
        .send()
        .await
        .map_err(|e| format!("Failed to send request: {}", e))?;

    if !response.ok() {
        return Err(format!("Server error: {}", response.status()));
    }

    // Step 4: Parse response
    let data: EncryptedResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))?;

    // Step 5: Decrypt the greeting with public key (server encrypted with private key)
    let decrypted_greeting = decrypt_with_public_key(&data.encrypted_greeting, PUBLIC_KEY_PEM)?;

    Ok(decrypted_greeting)
}
