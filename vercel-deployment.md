# Deploying Voicedots Admin Portal to Vercel

The new `voicedots-admin-portal` repository is fully set up and ready to be deployed to Vercel. Because this is a separate repository, you need to push it to a new GitHub repository first.

## 1. Push to a new GitHub Repository

1. Open a terminal and navigate to the new admin portal folder:
   ```bash
   cd d:\VoiceDots\voicedots\voicedots-admin-portal
   ```
2. Initialize Git if it hasn't been initialized already:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for Voicedots Admin Portal"
   ```
3. Create a **brand new repository** on GitHub (e.g., named `voicedots-admin-portal`).
4. Link the local folder to your new GitHub repository and push:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/voicedots-admin-portal.git
   git branch -M main
   git push -u origin main
   ```

## 2. Deploy to Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** > **Project**.
3. Import the newly created `voicedots-admin-portal` GitHub repository.
4. Open the **Environment Variables** tab before deploying and add:
   - `VITE_SUPABASE_URL`: (from your Supabase project)
   - `VITE_SUPABASE_ANON_KEY`: (from your Supabase project)
5. Click **Deploy**.

## 3. Configure Supabase

1. In your Supabase Dashboard, go to **Authentication** > **URL Configuration**.
2. Under "Site URL" and "Redirect URLs", add your new Vercel production URL (e.g., `https://voicedots-admin-portal.vercel.app`) so that you can log in without issues.
3. Ensure your tables (`blogs`, `contacts`) and storage bucket (`blog-images`) exist in Supabase and match the schema.
