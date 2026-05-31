---
title: Authentication
section: Setup & Configuration
---

# Authentication & Security

When you push code to a remote server like GitHub or GitLab, the server needs to verify your identity. Furthermore, in enterprise environments, organizations often require cryptographic proof that a specific commit was authored by you and not an impostor.

This lesson covers the two primary security mechanisms: **Authentication** (connecting to remotes) and **Signing** (verifying commits).

## Connecting to Remotes: HTTPS vs SSH

When you clone a repository or add a remote, you must choose between two protocols: HTTPS or SSH.

### 1. The HTTPS Protocol

```text
https://github.com/yourusername/repo.git
```

HTTPS is the default protocol recommended by most platforms. It is easy to set up and works through strict corporate firewalls.

However, platforms like GitHub no longer accept your account password when pushing via HTTPS. Instead, you must generate a **Personal Access Token (PAT)** from your account settings.

When Git prompts you for a password in the terminal, you paste the PAT. To avoid typing the token every time, you must rely on your operating system's Credential Manager (Keychain on macOS, Windows Credential Manager on Windows) to cache the token securely.

### 2. The SSH Protocol

```text
git@github.com:yourusername/repo.git
```

SSH (Secure Shell) is the preferred method for advanced developers. It relies on a cryptographic key pair (a public key and a private key) instead of passwords.

**How to set up SSH:**

1. Generate an SSH key pair on your machine using the terminal:
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```
2. Start the ssh-agent in the background:
   ```bash
   eval "$(ssh-agent -s)"
   ```
3. Add your private key to the agent:
   ```bash
   ssh-add ~/.ssh/id_ed25519
   ```
4. Output your **public** key to the terminal:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```
5. Copy the output and paste it into the "SSH Keys" section of your GitHub/GitLab account settings.

Once configured, Git will seamlessly authenticate via SSH in the background without ever prompting you for a password.

---

## GPG Commit Signing

Earlier, we configured `user.name` and `user.email`.

Because Git is decentralized, there is nothing stopping me from running `git config user.email "linus@linux.org"` and pushing a commit to an open-source repository pretending to be Linus Torvalds.

To prevent this impersonation, platforms like GitHub support **GPG (GNU Privacy Guard) Signing**.

### How it works

You generate a cryptographic GPG key on your computer and upload the public key to GitHub. Then, you configure Git to digitally sign every commit you make using your private key.

When you push to GitHub, the server checks the mathematical signature against your public key. If it matches, GitHub slaps a green **"Verified"** badge next to your commit in the web interface.

### Enabling Commit Signing

1. Install GnuPG (e.g., `brew install gnupg` on macOS).
2. Generate a key: `gpg --full-generate-key`.
3. Tell Git your GPG signing key ID:
   ```bash
   git config --global user.signingkey <YOUR_KEY_ID>
   ```
4. Tell Git to automatically sign all commits by default:
   ```bash
   git config --global commit.gpgsign true
   ```

Now, every time you run `git commit`, Git will prompt you for your GPG passphrase to cryptographically sign the object before generating the SHA-1 hash.
