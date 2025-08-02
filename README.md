# LinkExpiry - Secure Link Management SAAS

A modern web application for creating secure links with automatic expiry dates and times. Built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

### Core Functionality
- **Link Creation**: Create short, secure links with custom expiry dates and times
- **Automatic Expiry**: Links automatically become inactive after their set expiry time
- **Link Management**: View, edit, and delete your created links
- **Click Tracking**: Monitor how many times each link has been clicked
- **Analytics Dashboard**: Comprehensive analytics with charts and performance metrics
- **P2P Link Sharing**: Share links directly with other users using peer-to-peer connections

### User Experience
- **Modern UI**: Beautiful, responsive design built with shadcn/ui components
- **Real-time Updates**: Instant feedback and notifications
- **Mobile Responsive**: Works perfectly on all devices
- **Copy to Clipboard**: One-click copying of generated links

### SAAS Features
- **Pricing Tiers**: Free, Pro, and Business plans
- **Analytics**: Detailed insights into link performance
- **User Dashboard**: Centralized management of all links
- **Professional Design**: Ready for production deployment

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Routing**: React Router DOM
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **P2P Communication**: WebRTC + Simple Peer
- **Build Tool**: Vite

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd linkexpiry
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   bun dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/
│   ├── ui/           # shadcn/ui components
│   ├── QRScanner.tsx # QR code scanner (legacy)
│   └── time-picker.tsx # Custom time picker
├── pages/
│   ├── Index.tsx     # Main dashboard
│   ├── LinkRedirect.tsx # Link redirect handler
│   ├── Analytics.tsx # Analytics dashboard
│   ├── Pricing.tsx   # Pricing page
│   └── NotFound.tsx  # 404 page
├── hooks/
│   └── use-toast.ts  # Toast notifications
└── lib/
    └── utils.ts      # Utility functions
```

## 🎯 Usage

### Creating Links
1. Navigate to the main dashboard
2. Fill in the link details:
   - **Title**: A descriptive name for your link
   - **Original URL**: The destination URL
   - **Description**: Optional description
   - **Expiry Date**: When the link should expire
   - **Expiry Time**: The specific time for expiry
3. Click "Create Link"
4. Copy the generated short link

### Managing Links
- View all your created links in the dashboard
- See real-time expiry countdowns
- Copy links with one click
- Delete links you no longer need
- Track click counts

### P2P Link Sharing
- Create P2P connections with other users
- Share connection codes to establish direct connections
- Send links directly to connected peers
- Receive shared links in a dedicated section
- No server required - direct peer-to-peer communication

### Analytics
- Access detailed analytics at `/analytics`
- View click trends over time
- See link status distribution
- Monitor top-performing links

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_APP_NAME=LinkExpiry
VITE_APP_URL=http://localhost:5173
```

### Customization
- **Branding**: Update the app name and colors in the components
- **Pricing**: Modify the pricing plans in `src/pages/Pricing.tsx`
- **Features**: Add new features by extending the Link interface

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Netlify
1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🔮 Future Enhancements

- [ ] User authentication and accounts
- [ ] API for programmatic link creation
- [ ] Custom domains support
- [ ] Team collaboration features
- [ ] Advanced analytics and reporting
- [ ] Webhook integrations
- [ ] Bulk link operations
- [ ] Link password protection
- [ ] Geographic restrictions
- [ ] A/B testing for links

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@linkexpiry.com or create an issue in this repository.

---

**LinkExpiry** - Making link management simple and secure. 🔗✨
