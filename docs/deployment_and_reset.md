# Deployment & Reset Guide 🚀

This guide walks you through deploying **A Lifetime of Valentines** to Vercel and resetting your Supabase database for a fresh start.

## Part 1: Deploying to Vercel

If you haven't deployed yet, follow these steps to get your site live.

1.  **Push to GitHub**:
    Ensure your latest changes (including `schema.sql`) are pushed to your GitHub repository.
    ```bash
    git push origin main
    ```

2.  **Import to Vercel**:
    - Go to [vercel.com/new](https://vercel.com/new).
    - Select your `a-lifetime-of-valentines` repository.
    - Click **Import**.

3.  **Configure Environment Variables**:
    In the deployment configuration screen, add the following Environment Variables (copy them from your `.env.local` or Supabase Settings):

    | Variable Name | Value |
    | :--- | :--- |
    | `VITE_SUPABASE_URL` | Your Supabase Project URL |
    | `VITE_SUPABASE_ANON_KEY` | Your Supabase Anon Public Key |

    *(Note: SMTP settings are configured in Supabase Edge Functions, not here, unless you moved them to client-side logic—but our implementation uses Edge Functions which manage their own secrets)*.

4.  **Deploy**:
    - Click **Deploy**.
    - Wait for the confetti! 🎉
    - Your site is now live at `https://your-project.vercel.app`.

---

## Part 2: Final Database Reset

Before inviting your partner, you likely want to wipe all test data (demo users, fake photos) and start fresh.

### ⚠️ Warning
This will delete **ALL** data in your database (users, photos, entries).

1.  **Go to Supabase SQL Editor**:
    - Open your project at [supabase.com](https://supabase.com).
    - Navigate to the **SQL Editor** tab.

2.  **Run the Cleanup Script**:
    - Copy the contents of `supabase/lockdown_and_cleanup.sql`.
    - Paste it into the SQL Editor.
    - Click **Run**.

    **What this does:**
    - Truncates all tables (`couples`, `media`, `entries`, etc.).
    - Resets the `on_auth_user_created` trigger to ensure the *next* user who signs up becomes the **Owner**.

3.  **Delete Auth Users (Crucial Step)**:
    - Go to **Authentication -> Users**.
    - Delete **ALL** users. (The SQL script cleans data, but Supabase Auth users must be deleted here manually or via admin API to truly "reset" the signup flow).

---

## Part 3: The "Go Live" Flow

Now that your database is clean:

1.  **Register Owner**:
    - Visit your Vercel URL.
    - Sign Up with your real email.
    - You will automatically become the **Owner** and get an Invite Code.

2.  **Invite Partner**:
    - Use the dashboard to send an invite email to your partner.
    - **OR** copy the Invite Code and Temp Password manually and send it to them via text.

3.  **Partner Joins**:
    - Partner visits the link (or `/register-partner`).
    - Enters Invite Code & Temp Password.
    - Sets their new permanent password.

4.  **Done!**:
    - The system identifies two users (`Owner` + `Partner`).
    - The `prevent_multiple_couples` trigger locks the door.
    - No one else can sign up. 🔒

Enjoy your timeline! 💖
