# Travel Management System

A comprehensive full-stack travel management application built with React, Express.js, and PostgreSQL. Features professional flight search, hotel booking, and trip management capabilities.

## Features

- **Trip Creation**: Support for business, guest, and personal travel bookings
- **Flight Search**: Real-time flight search with filters, fare selection, and airline information
- **Hotel Booking**: Comprehensive hotel search with advanced filtering and room selection
- **Smart Forms**: Auto-progression through form fields with validation
- **Professional UI**: Modern interface built with shadcn/ui components
- **Database Integration**: PostgreSQL with Drizzle ORM for data persistence

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Build Tools**: Vite, ESBuild
- **Deployment**: Ready for Vercel, Netlify, or Railway

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone https://github.com/murthyaradhi/EVA-UI.git
cd EVA-UI
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Add your DATABASE_URL and other required variables
```

4. Set up the database:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Environment Variables

Create a `.env` file with the following variables:

```
DATABASE_URL=your_postgresql_connection_string
PGHOST=your_db_host
PGPORT=your_db_port
PGUSER=your_db_user
PGPASSWORD=your_db_password
PGDATABASE=your_db_name
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Railway

1. Connect your GitHub repository to Railway
2. Add environment variables
3. Deploy with one click

### Manual Deployment

Build the application:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts
│   │   └── main.tsx       # Application entry point
├── server/                 # Express backend
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   └── index.ts           # Server entry point
├── shared/                 # Shared types and utilities
│   ├── schema.ts          # Database schema
│   └── airports.ts        # Airport data
└── README.md
```

## Features Overview

### Flight Search
- Domestic and international airport support
- One-way and round-trip booking
- Passenger and class selection
- Real-time search with filtering
- Corporate fare types (Corporate/Flexi/Retail)
- Flight selection workflow

### Hotel Search
- Destination-based search
- Check-in/check-out date selection
- Room and guest configuration
- Advanced filtering (price, rating, amenities)
- Detailed hotel information
- Room type selection

### Trip Management
- Business, guest, and personal booking types
- Traveler information collection
- Entity and billing information
- Date validation and conflict detection
- Service selection and management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.