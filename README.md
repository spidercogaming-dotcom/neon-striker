# 🚀 Deploying Real Online Multiplayer to Render

## Step-by-Step Guide

### Prerequisites
- GitHub account
- Render account (free at render.com)

---

## Step 1: Prepare Your Code

1. **Make sure all files are committed to Git:**
   ```bash
   git add .
   git commit -m "Add real multiplayer backend"
   ```

2. **Push to GitHub:**
   ```bash
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

---

## Step 2: Deploy Backend to Render

### Option A: Using Render Dashboard (Recommended)

1. **Go to [render.com](https://render.com)** and sign up/login
2. Click **"New +"** in the top right
3. Select **"Web Service"**
4. **Connect to GitHub:**
   - Click "Connect GitHub"
   - Authorize Render to access your repositories
   - Select your repository
5. **Configure the service:**
   
   | Field | Value |
   |-------|-------|
   | Name | `neon-strike-server` |
   | Region | `Oregon (US West)` or closest to you |
   | Branch | `main` |
   | Runtime | `Node` |
   | Root Directory | `server` |
   | Build Command | `npm install` |
   | Start Command | `node server.js` |
   | Instance Type | `Free` |
   
6. **Add Environment Variable:**
   - Scroll to "Advanced"
   - Click "Add Environment Variable"
   - Key: `PORT`
   - Value: `10000`
   
7. **Click "Create Web Service"**
8. **Wait for deployment** (2-3 minutes)
9. **Copy your server URL** from the dashboard
   - Example: `https://neon-strike-server.onrender.com`

---

## Step 3: Connect Frontend to Server

1. **Create `.env` file in project root:**
   ```bash
   # Copy the example file
   cp .env.example .env
   ```

2. **Edit `.env` file:**
   ```env
   VITE_SERVER_URL=https://YOUR-SERVER-NAME.onrender.com
   ```
   
   Replace `YOUR-SERVER-NAME.onrender.com` with your actual Render URL.

3. **Test locally:**
   ```bash
   npm run dev
   ```
   
   Open http://localhost:5173 and click "🌐 REAL ONLINE"

---

## Step 4: Deploy Frontend to Vercel

```bash
npm run build
npx vercel
```

Follow the prompts and your frontend will be live!

---

## ⚠️ Important Notes

### Free Tier Limitations

1. **Spin-down:** Render's free tier spins down after 15 minutes of inactivity
2. **Cold starts:** First request after spin-down takes ~30 seconds
3. **RAM:** Limited to 512MB (may cause issues with many players)

### Solutions:

**Option 1: Accept the limitations**
- Good for testing and small groups
- Players may see "Connecting..." on first load

**Option 2: Upgrade to paid tier**
- $7/month for 24/7 uptime
- Better performance for more players

**Option 3: Use a keep-alive service**
- Set up a cron job to ping your server every 10 minutes
- Prevents spin-down during active hours

---

## 🔧 Troubleshooting

### Connection Failed

**Problem:** "Could not connect to game server"

**Solutions:**
1. Check that `.env` has the correct server URL
2. Verify server is deployed and running on Render
3. Check Render logs for errors
4. Make sure CORS is enabled (it is in our server code)

### Server Won't Start

**Problem:** Deployment fails or server crashes

**Solutions:**
1. Check Render logs for error messages
2. Verify `package.json` in `server/` folder is correct
3. Make sure `node` version is compatible (18+)

### Players Can't See Each Other

**Problem:** Connected but no other players visible

**Solutions:**
1. Make sure all players use the same `roomId` (currently hardcoded to "main")
2. Check browser console for WebSocket errors
3. Verify server is receiving and broadcasting events

---

## 🎯 Testing Your Deployment

1. **Open your deployed site** in one browser tab
2. **Open it again** in a second tab (or incognito window)
3. **Click "🌐 REAL ONLINE"** in both tabs
4. **You should see both players** on the screen!

---

## 📊 Monitoring Your Server

On Render dashboard:
- **Metrics tab:** See CPU, memory, and response time
- **Logs tab:** View real-time server logs
- **Events tab:** See deployment history

---

## 🔄 Updating Your Server

When you make changes to the backend:

1. **Commit and push to GitHub:**
   ```bash
   git add server/
   git commit -m "Update server"
   git push
   ```

2. **Render auto-deploys** when you push to the connected branch!

---

## 💡 Pro Tips

1. **Add a health check endpoint** (already included: `/health`)
2. **Monitor your logs** regularly
3. **Set up error tracking** (Sentry, etc.)
4. **Use environment variables** for all config
5. **Test locally before deploying**

---

## 🎮 Next Steps

Once your server is running:

1. Share the game URL with friends
2. Test with multiple players
3. Consider adding features:
   - Player authentication
   - Persistent stats database
   - Multiple game modes
   - Voice chat
   - Leaderboards

---

Need help? Check the [Render documentation](https://render.com/docs) or create an issue in your GitHub repo!
