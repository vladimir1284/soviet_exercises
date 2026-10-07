# SovietFit 💪

A progressive exercise tracking app built with SvelteKit and deployed on Cloudflare Pages.

## Features

- 🏋️ **Multi-exercise tracking** - Track any exercise type with custom icons and colors
- 📊 **Automatic progression** - 50% of max reps per set, recalibrate every 2 weeks
- 📱 **Mobile-first PWA** - Install on any device, works offline
- 🌍 **Multi-language** - Spanish and English support
- 🎨 **Dark/Light themes** - System preference or manual selection
- 📈 **Weekly evaluations** - Green/Orange/Red status based on completion

## Tech Stack

- **Frontend**: SvelteKit 2 + TypeScript
- **Styling**: Tailwind CSS
- **Database**: Cloudflare D1 (SQLite)
- **Auth**: Clerk
- **Hosting**: Cloudflare Pages
- **i18n**: svelte-i18n

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Cloudflare account
- Clerk account

### Installation

1. **Clone and install dependencies**

   ```bash
   git clone <repo>
   cd sovietfit
   npm install
   ```

2. **Set up Clerk**
   - Create a Clerk application at https://dashboard.clerk.com
   - Enable Email and Google OAuth providers
   - Copy your publishable key

3. **Set up Cloudflare D1**

   ```bash
   # Login to Cloudflare
   npx wrangler login

   # Create the database
   npx wrangler d1 create sovietfit-db

   # Copy the database_id to wrangler.toml
   ```

4. **Configure environment**

   ```bash
   # Create .env file
   echo "VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key" > .env
   ```

5. **Run database migrations**

   ```bash
   # Local development
   npm run db:migrate:local

   # Production
   npm run db:migrate
   ```

6. **Update wrangler.toml**

   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "sovietfit-db"
   database_id = "YOUR_DATABASE_ID_HERE"

   [vars]
   PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_YOUR_KEY"
   ```

### Development

```bash
npm run dev
```

### Deployment

```bash
npm run deploy
```

## Google Play Store Review Access

For publishing to Google Play Console, embedded WebViews disable Google OAuth, and email OTP links require an external inbox. We support **Email + Password** authentication for reviewers.

See [PLAY_STORE_REVIEW.md](./PLAY_STORE_REVIEW.md) for full instructions on setting up a reviewer test account in Clerk and configuring App Access credentials in Google Play Console.

## Project Structure

```
sovietfit/
├── src/
│   ├── lib/
│   │   ├── components/    # Reusable UI components
│   │   ├── db/            # Database queries and types
│   │   ├── i18n/          # Translations
│   │   ├── stores/        # Svelte stores
│   │   └── utils/         # Utility functions
│   ├── routes/
│   │   ├── api/           # API endpoints
│   │   ├── app/           # Authenticated app routes
│   │   └── +page.svelte   # Landing/auth page
│   └── app.html           # HTML template
├── static/
│   ├── icons/             # PWA icons
│   ├── manifest.json      # PWA manifest
│   └── sw.js              # Service worker
├── schema.sql             # Database schema
├── wrangler.toml          # Cloudflare config
└── package.json
```

## Database Schema

- **users** - User profiles (linked to Clerk)
- **exercises** - Exercise definitions per user
- **cycles** - Training cycles with max reps and duration
- **sets** - Individual set logs with timestamps
- **user_settings** - User preferences

## Training Logic

1. **Initial calibration**: Do exercise to failure, record max reps
2. **Set calculation**: 50% of max = reps per set
3. **Daily goal**: 10 sets (configurable)
4. **Weekly evaluation**:
   - 🟢 Green: Completed target days
   - 🟠 Orange: Missed 1 day
   - 🔴 Red: Missed 2+ days
5. **Recalibration**: Every 2 weeks, test new max

## Generate PWA Icons

Use a tool like [Real Favicon Generator](https://realfavicongenerator.net/) or:

```bash
# Using ImageMagick from the SVG
convert -background none static/icons/icon.svg -resize 72x72 static/icons/icon-72.png
convert -background none static/icons/icon.svg -resize 96x96 static/icons/icon-96.png
convert -background none static/icons/icon.svg -resize 128x128 static/icons/icon-128.png
convert -background none static/icons/icon.svg -resize 144x144 static/icons/icon-144.png
convert -background none static/icons/icon.svg -resize 152x152 static/icons/icon-152.png
convert -background none static/icons/icon.svg -resize 192x192 static/icons/icon-192.png
convert -background none static/icons/icon.svg -resize 384x384 static/icons/icon-384.png
convert -background none static/icons/icon.svg -resize 512x512 static/icons/icon-512.png
```

## License

MIT
