# ScoreOBE+ Backend

ScoreOBE+ is the backend service for the Information Management System for Outcome-Based Education (OBE). It provides APIs for score management, evaluation, and analytics.

## Installation

Ensure you have [Node.js](https://nodejs.org/) and [PostgreSQL](https://www.postgresql.org/) installed.

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repository-url.git
   cd scoreobe-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the App

### Development Mode

Start the development server:
   ```bash
   npm run start:dev
   ```

### Production Mode

Run the server in production mode:
   ```bash
   npm run start:prod
   ```

### Watch Mode

Start the app in watch mode for automatic restarts:
   ```bash
   npm run start
   ```

## Environment Variables

Create a `.env` file and configure the following variables:
   ```ini
   DATABASE_URL=postgres://user:password@localhost:5432/scoreobe
   PORT=3000
   JWT_SECRET=your-secret-key
   ```

## Test

Run unit tests:
   ```bash
   npm run test
   ```

Run end-to-end tests:
   ```bash
   npm run test:e2e
   ```

Check test coverage:
   ```bash
   npm run test:cov
   ```

## Copyright
© 2025 Computer Engineering, Chiang Mai University. All rights reserved.

