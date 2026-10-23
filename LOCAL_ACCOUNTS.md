# Local player accounts

The Dice Game has free, username-and-password accounts stored in the browser's local storage. No Supabase project, API key, email address, or account-server setup is required.

## Important limits

- Accounts, salted password hashes, and M-Points stay in the browser profile and on this device. They do not sync to another browser, device, or player.
- Clearing browser/site data, changing browser profiles, or using private browsing can make accounts and balances unavailable. There is no password reset or account recovery.
- This is a game-only convenience, not secure authentication. A player can inspect or change local browser data, including their M-Points. Do not use a password from another service or store valuable information in the account.
- Passwords are hashed with PBKDF2 through the browser's Web Crypto API; the site does not save raw passwords. The browser still cannot provide the protections of a trusted server.

Accounts are created on the Dice Game page. Usernames must be 3–20 letters, numbers, or underscores; passwords must be at least 8 characters. The game uses the browser's cryptographic random generator for password salts and dice rolls.

The account data uses the `mprint-local-player-data-v1` local storage key. Removing that site's data in browser settings permanently removes the local accounts and their balances.
