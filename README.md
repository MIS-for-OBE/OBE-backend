# ScoreOBE+ Backend

ScoreOBE+ is the backend service for the Information Management System for Outcome-Based Education (OBE). It provides APIs for score management, evaluation, and analytics.

## Installation

Ensure you have [Node.js](https://nodejs.org/) installed.

1. Clone the repository

2. Install dependencies:
   ```bash
   npm install
   ```

## Environment Variables

Create a `.env` file in the root directory and configure it based on `.env.example`

## Running the App

### Development Mode

Start the development server:
   ```bash
   npm run start
   ```

### Watch Mode

Start the app in watch mode for automatic restarts:
   ```bash
   npm run start:dev
   ```

### Production Build

1. Build the application for production:
   ```bash
   npm run build
   ```

2. Run the server in production mode:
   ```bash
   npm run start:prod
   ```

## Deployment

Build the Docker container:
   ```bash
   docker compose up --build -d
   ```

## Copyright
© 2025 Computer Engineering, Chiang Mai University. All rights reserved.
