# RideChain - AI-Powered Ride Sharing Application

A modern ride-sharing application built with Next.js, featuring advanced Gemini AI integration for enhanced user experience and security. This application focuses on AI-driven insights rather than traditional map interfaces, providing a unique approach to ride-sharing.

## Key Features

### Core Ride-Sharing Features
- Book rides with seamless location search
- Track ride status with real-time AI insights
- View comprehensive ride history
- Detailed rider and driver profiles
- Integrated payment system
- Feedback and rating system

### Advanced Gemini AI Integration

#### Ride Analytics
- Efficiency analysis with detailed scoring
- Time optimization recommendations
- Cost-effectiveness insights
- Sustainability metrics

#### Smart Travel Tips
- Personalized travel recommendations
- Context-aware ride suggestions
- Weather-informed travel advice
- Time-saving shortcuts

#### AI-Powered Planning
- Personalized ride type recommendations
- Smart pricing based on demand and conditions
- Alternative route suggestions
- Travel pattern analysis

### Gemini AI-Powered Security Features

#### 1. AI-Enhanced Ride Safety Monitoring
- Real-time route deviation detection
- Neighborhood safety assessment
- Speed analysis and monitoring
- Personalized safety recommendations

#### 2. Account Security Protection
- Suspicious login detection and analysis
- Device fingerprinting and verification
- AI-powered password strength analysis
- Login pattern recognition

#### 3. Fraud Prevention
- Message analysis for scam detection
- Driver verification code generation
- Payment security monitoring
- Social engineering prevention

#### 4. Emergency Features
- One-tap emergency assistance
- Voice-activated emergency detection
- Trusted contact integration
- Location sharing during emergencies

## Security Center

The application includes a comprehensive Security Center that provides:
- Overall security score based on your settings
- Personalized security recommendations
- Status of security features
- Configuration options for all security settings

## Installation

```bash
# Clone the repository
git clone https://github.com/username/ridechain.git

# Navigate to the project directory
cd ridechain

# Install dependencies
npm install

# Create a .env.local file with your API keys
cp .env.example .env.local

# Add your Gemini API key
# NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

# Start the development server
npm run dev
```

## Environment Variables

Create a `.env.local` file in the root of your project and add:

```
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

## Project Structure

```
├── app/                # Next.js app folder
│   ├── api/            # API routes
│   ├── auth/           # Authentication pages
│   ├── driver/         # Driver dashboard and features
│   ├── rider/          # Rider booking, tracking and features
│   └── page.tsx        # Homepage
├── components/         # Reusable components
│   ├── ride-tracking/  # Ride tracking components
│   ├── ride-planning/  # Ride planning components
│   └── ui/             # UI components
├── lib/                # Utility functions and services
│   └── gemini-service.ts # Gemini AI integration service
├── public/             # Static assets
└── README.md           # Project documentation
```

## Technologies

- Next.js 14
- React
- TypeScript
- Tailwind CSS
- Gemini AI API
- Shadcn/UI Components

## Design Approach

This project takes a unique approach by removing traditional map visualizations and focusing instead on AI-driven insights. This design choice prioritizes:

1. **Simplified User Experience**: Clean interfaces focusing on ride details rather than maps
2. **AI-Powered Decision Making**: Helping users make better travel decisions through advanced analytics
3. **Performance Optimization**: Faster load times and reduced complexity
4. **Privacy Considerations**: Less reliance on location tracking visualization

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. The application provides a complete ride-sharing experience with:

- Authentication (login/signup)
- Rider dashboard
- Booking interface
- Ride tracking with AI insights
- Driver interface
- Security center
- Account management

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 