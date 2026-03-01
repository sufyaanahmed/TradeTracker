# Palrin - AI-Powered Trading Intelligence Platform

A modern, serverless AI-powered trading journal and equity research assistant built with Next.js for seamless Vercel deployment. Palrin features a clean, minimalist monochrome design for professional traders.

## 🚀 Features

- **Modern Next.js Architecture**: Built with Next.js 14 for optimal performance
- **Serverless Ready**: Deploy instantly to Vercel with zero configuration
- **Firebase Authentication**: Secure Google OAuth integration
- **Monochrome UI**: Clean black, white, and grey minimalist design
- **Responsive Design**: Works perfectly on all devices
- **AI-Powered Analysis**: Ready for trading insights and stock analysis
- **NSE India Support**: Direct integration with Indian stock market data

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Authentication**: Firebase Auth
- **Styling**: Custom monochrome theme with Tailwind CSS
- **Design System**: Palrin minimalist design language
- **Icons**: Material Symbols
- **Deployment**: Vercel (serverless)

## 📁 Project Structure

```
trade_tracker/
├── components/           # Reusable UI components
│   └── ui/              # Core UI components (Card, Button, Input, Tabs)
├── lib/                 # Utility functions
├── pages/               # Next.js pages
│   ├── _app.js          # App wrapper
│   ├── index.js         # Login page
│   └── dashboard.js     # Main dashboard
├── styles/              # Global styles
│   └── globals.css      # Monochrome theme and custom CSS
├── package.json         # Dependencies and scripts
├── next.config.js       # Next.js configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── vercel.json          # Vercel deployment config
```

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
cd trade_tracker
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory with your configuration:

```env
# Firebase Configuration (Required for Authentication)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Database Configuration (Required for Trade Storage)
MONGODB_URI=your_mongodb_connection_string

# AI Analysis Configuration (Required for Stock Analysis)
GEMINI_API_KEY=your_google_gemini_api_key
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key
```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable Authentication → Sign-in method → Google
4. Add your domain to authorized domains
5. Copy the configuration values to your `.env.local`

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app!

## 🚀 Deployment to Vercel

### Option 1: GitHub Integration (Recommended)

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/trade-tracker-pro.git
git push -u origin main
```

2. Connect to Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard (all variables from `.env.local`)
   - Deploy!

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
# ... add all other env vars

# Deploy again
vercel --prod
```

## 🔐 Environment Variables Guide

### Frontend Variables (`.env.local`)

All Firebase client-side variables must have the `NEXT_PUBLIC_` prefix:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc123
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABC123 (optional)
```

### Where to Find These Values

**Firebase Configuration:**
1. Firebase Console → Project Settings → General tab
2. Scroll to "Your apps" section
3. Click on the web app icon
4. Copy the config object values

**MongoDB Configuration:**
1. MongoDB Atlas → Database → Connect
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database password

**AI Analysis Configuration:**
1. **Gemini API Key**: Google AI Studio → API Keys → Create API Key
2. **Alpha Vantage API Key**: Alpha Vantage → Get Your Free API Key

## 🎨 Customization

### Modifying the Theme

Edit `styles/globals.css` to customize:
- Colors: Update CSS variables in `:root`
- Components: Modify `.cyber-*` classes
- Animations: Adjust keyframes and transitions

### Adding New Components

1. Create in `components/ui/`
2. Follow the existing pattern with `forwardRef`
3. Use the `cn()` utility for class merging
4. Apply cyber theme classes

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 🌟 Key Features Implemented

- ✅ **Login Page**: Beautiful cyber-themed landing page
- ✅ **Google Authentication**: Firebase OAuth integration  
- ✅ **Dashboard**: Basic authenticated dashboard
- ✅ **Responsive Design**: Mobile-first approach
- ✅ **Serverless Ready**: Optimized for Vercel deployment
- ✅ **Component Library**: Reusable UI components
- ✅ **Route Protection**: Authentication guards

## 🚧 Coming Soon

- **Trade Journal**: Log and track trades
- **AI Analysis**: Stock insights and recommendations
- **Portfolio Analytics**: Performance metrics
- **Real-time Data**: Live market information
- **Advanced Charts**: Trading visualizations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ using Next.js and deployed on Vercel** 