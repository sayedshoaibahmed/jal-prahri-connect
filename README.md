# जल आपूर्ति निगरानी प्रणाली | Rural Water Supply Monitoring System

A prototype web application for monitoring rural piped water supply systems designed for Gram Panchayats (GPs) and field operators with offline-first capabilities and Hindi-first UI.

## 🌟 Features

### For Operators (ऑपरेटर्स)
- **Pump Management**: Start/stop pumps, track running hours
- **Voice Reports**: Record voice messages with location tagging (mock implementation)
- **Water Quality Logging**: Log pH, turbidity, chlorine, temperature with validation
- **Offline-First**: All data saved offline and synced when internet is available
- **Hindi Interface**: Complete Hindi UI for low-literacy users
- **Large Touch Targets**: Optimized for field use and outdoor conditions

### For Gram Panchayats (ग्राम पंचायत)
- **Dashboard Overview**: Real-time pump status and system analytics
- **Interactive Map**: Visual pump locations and report markers (mock implementation)
- **Alerts Management**: Critical alerts with priority-based workflow
- **Reports Review**: Voice reports and water quality data review
- **Analytics**: Weekly usage charts and system performance metrics

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: Shadcn/ui with custom variants
- **Offline Storage**: LocalForage for IndexedDB
- **Charts**: Recharts for data visualization
- **Routing**: React Router with role-based protection
- **State Management**: React hooks with localStorage persistence

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Modern web browser with JavaScript enabled

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd water-supply-monitor

# Install dependencies
npm install

# Start development server
npm run dev
```

### Demo Login

The app includes mock authentication for demonstration:

1. **Phone Login**:
   - Enter any 10-digit phone number
   - Use OTP: `123456` or any 6-digit number
   - OTP starting with `1` → Operator role
   - Other numbers → GP role

2. **Offline PIN Login**:
   - Available after first online login
   - Set 4-digit PIN for offline access

## 📱 User Roles & Access

### Operator Dashboard (`/operator`)
- Pump control and monitoring
- Voice report submission 
- Water quality data entry
- Offline operation capabilities

### GP Dashboard (`/gp`)
- System overview and analytics
- Map view with pump locations
- Alert management
- Report review and approval

## 🔧 Configuration

### Firebase Setup (Production)
For production deployment, replace mock services:

1. Create `.env.local`:
```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
# Add other Firebase config...
```

2. Update `src/services/authService.js` with real Firebase Auth
3. Update `src/services/syncService.js` with real backend APIs

### Voice Recording Setup
For actual voice recording:
1. Implement MediaRecorder API in `ReportModal.jsx`
2. Add audio blob upload to storage service
3. Configure backend transcription service (optional)

### Map Integration
For real maps, replace mock map in `PumpMap.jsx`:
1. Add Leaflet: `npm install leaflet react-leaflet`
2. Or use Google Maps with API key
3. Update location services in components

## 🗂️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn/ui components
│   ├── PumpCard.jsx    # Pump control interface
│   ├── ReportModal.jsx # Voice report submission
│   └── ...
├── pages/              # Main application pages
│   ├── Login.jsx       # Authentication
│   ├── OperatorDashboard.jsx
│   └── GPDashboard.jsx
├── services/           # Business logic and data
│   ├── authService.js  # Authentication service
│   └── syncService.js  # Offline sync service
├── locales/            # Internationalization
│   └── hi.json        # Hindi translations
└── index.css          # Design system tokens
```

## 🎨 Design System

The app uses a comprehensive design system with semantic tokens:

- **Colors**: Water-themed blue/green palette with status colors
- **Typography**: Hindi-optimized fonts with proper spacing
- **Touch Targets**: Minimum 48px for accessibility
- **Responsive**: Mobile-first with tablet/desktop support

Key design principles:
- High contrast for outdoor visibility
- Large, clear icons and text
- Consistent color coding for status
- Accessibility for low-literacy users

## 🔄 Offline Functionality

### Data Sync Queue
All user actions are queued locally and synced when online:
- Pump start/stop events
- Water quality measurements
- Voice reports with audio files
- Location data and timestamps

### Storage Strategy
- **IndexedDB**: Primary storage via LocalForage
- **localStorage**: Authentication and settings
- **Memory**: Active session data

### Sync Indicators
- Real-time online/offline status
- Pending sync item count
- Manual sync triggers
- Sync progress feedback

## 🔐 Security Considerations

### Mock vs Production
- **Current**: Mock authentication for demo
- **Production**: Use Firebase Auth with proper validation
- **API Keys**: Store sensitive keys in environment variables
- **Data Validation**: Client + server-side validation required

### Offline Security
- PIN-based offline access
- Local data encryption recommended
- Session management with timeout
- Role-based route protection

## 📊 Data Models

### Pump Data
```javascript
{
  id: 'pump_001',
  name: 'मुख्य पंप 1',
  status: 'working|faulty|maintenance',
  isRunning: boolean,
  location: { lat, lng },
  hoursToday: number,
  hoursWeek: number,
  lastMaintenance: dateString
}
```

### Water Quality
```javascript
{
  pumpId: string,
  parameters: {
    ph: number,          // 6.5-8.5 normal
    turbidity: number,   // ≤1 NTU normal  
    chlorine: number,    // 0.2-2.0 mg/L normal
    temperature: number  // 15-35°C normal
  },
  timestamp: isoString,
  overallStatus: 'normal|warning|critical'
}
```

## 🚧 Known Limitations

### Current Mock Implementations
- **Voice Recording**: Simulated audio capture
- **GPS/Location**: Basic geolocation API usage
- **Maps**: Static mock map (needs Leaflet/Google Maps)
- **Backend Sync**: Mock API calls with delays
- **File Upload**: Simulated image/audio uploads

### Production Requirements
- Real-time data sync with backend
- Proper audio/image storage service
- SMS/WhatsApp integration for alerts
- Advanced analytics and reporting
- Multi-language support expansion

## 🤝 Contributing

### Development Setup
1. Follow coding standards (Prettier + ESLint)
2. Use semantic commits
3. Test on mobile devices
4. Maintain Hindi-first approach

### Adding Features
1. Update design system tokens first
2. Create reusable components
3. Implement offline-first
4. Add proper error handling
5. Update translations

## 📞 Support

For technical issues or feature requests:
- Check existing GitHub issues
- Review documentation
- Contact development team

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

---

**Note**: This is a prototype application with mock services. For production deployment, replace mock implementations with actual services and ensure proper security measures.