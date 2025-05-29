# DogBooking Platform

A full-featured platform connecting dog owners with pet sitters. Built with Next.js 14, TypeScript, Prisma, and Tailwind CSS.

## Features

- **Authentication**: Secure user authentication with NextAuth
- **Client Dashboard**: Manage dogs, bookings, and find sitters
- **Sitter Dashboard**: Manage bookings, profile, and availability
- **Booking System**: Complete booking lifecycle management
- **Profile Management**: Detailed profiles for both sitters and clients
- **Reviews**: Post-booking review system

## Prerequisites

- Node.js 18+
- PostgreSQL
- Docker (optional, for local database)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables:
   ```bash
   cp .env.example .env
   ```
   Fill in your environment variables in `.env`

4. Start the database:
   ```bash
   # If using Docker:
   docker-compose up -d
   
   # Or use your local PostgreSQL instance
   ```

5. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) to view the application

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Headless UI](https://headlessui.com/)
- **Icons**: [Heroicons](https://heroicons.com/)

## Project Structure

- `/app` - Next.js app router pages and API routes
- `/components` - Reusable React components
- `/lib` - Utility functions and shared logic
- `/prisma` - Database schema and migrations
- `/types` - TypeScript type definitions

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run prisma:studio` - Open Prisma Studio

## Deployment

### Deploying with Vercel

1. [Import your repository](https://vercel.com/new) into Vercel

2. Add the following environment variables in your Vercel project settings:
   - `DATABASE_URL` - Your production PostgreSQL connection string
   - `NEXTAUTH_URL` - Your production URL (e.g., https://your-app.vercel.app)
   - `NEXTAUTH_SECRET` - Your NextAuth secret key

3. Configure your database:
   - Set up a PostgreSQL database (recommended providers: [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app))
   - Update the `DATABASE_URL` in Vercel with your production database connection string
   - Run migrations on your production database:
     ```bash
     npx prisma migrate deploy
     ```

4. Deploy your application:
   - Vercel will automatically deploy your main branch
   - For subsequent updates, just push to your main branch and Vercel will automatically redeploy

Your application will be available at `https://your-project.vercel.app`
