# Supabase account setup

The dice game uses Supabase Auth for accounts and a protected database profile for each player's M-Points. Players sign up and sign in with a username and password; no email address is collected. Passwords are handled by Supabase Auth and are never stored by this site.

1. Create a free Supabase project.
2. In the Supabase SQL Editor, run the contents of `supabase-setup.sql`.
3. Open the project's **Settings → API** page. Copy the Project URL and the **public anon/publishable key** into `supabase-config.js`.
4. In **Authentication → URL Configuration**, add your website's deployed URL to the allowed redirect URLs. For local testing, add the local development URL too.
5. In **Authentication → Providers → Email**, turn **Confirm email** off. Username-only accounts use a reserved, non-deliverable `@players.mprint.invalid` identity internally because Supabase password authentication requires an email or phone identifier. It is not a real inbox.

Players should choose a username they can remember. Supabase's email/password recovery cannot work for these accounts, because no email is collected and the internal address cannot receive messages. If a player forgets their password, an administrator will need to help them recover their account.

The public anon key is intended for browser use. Never put a service-role key in this website. Profile row-level security and the database functions limit access to the signed-in player's own balance. Accounts that were created with a real email before switching to username-only sign-in will not be accessible using the new username mapping without migrating them.
