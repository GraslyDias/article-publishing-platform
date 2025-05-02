# Article Publishing Platform

> A modern platform for writers to publish and share their articles with the world.

A platform for publishing, sharing, and discovering articles and stories. This platform allows writers to share their content and connect with readers.

## Features

- User authentication (login/register)
- Create and publish articles
- Upload images with articles
- Comment on articles
- User dashboard to manage articles
- Responsive design with Chakra UI

## Tech Stack

### Frontend
- Next.js 15.x
- TypeScript
- Chakra UI
- Axios for API requests
- date-fns for date formatting

### Backend
- PHP 7.4+
- MySQL 5.7+
- PDO for database connectivity

## Getting Started

### Prerequisites

- Node.js 20+ and npm/yarn
- PHP 7.4+
- MySQL 5.7+
- Web server (Apache/Nginx)

### Setup

1. Clone the repository
   ```
   git clone <repository-url>
   cd article-publishing-platform
   ```

2. Install frontend dependencies
   ```
   npm install
   ```

3. Set up the database
   - Import the database schema from `api/database/schema.sql`
   - Update database configuration in `api/database/db_connect.php` if needed

4. Set up PHP backend
   - Configure your web server to serve the `api` directory
   - Ensure the `api/uploads` directory is writable by the web server

5. Create a `.env.local` file with the following environment variables:
   ```
   NEXT_PUBLIC_API_URL=http://localhost/article-publishing-platform
   ```
   Note: Adjust the URL based on your local development environment

6. Start the development server
   ```
   npm run dev
   ```

## Development

### Frontend

- The frontend is built with Next.js and uses App Router
- Component-based architecture with Chakra UI for styling
- State management is handled with React Hooks

### Backend

- RESTful API endpoints built with PHP
- Authentication endpoints in `api/auth`
- Articles endpoints in `api/posts`
- Comments endpoints in `api/comments`

## Deployment

1. Build the Next.js application:
   ```
   npm run build
   ```

2. Deploy the built application to your hosting service

3. Deploy the PHP backend to your web server

4. Ensure proper CORS settings in production

## Project Structure

```
├── app/                   # Next.js app directory
│   ├── auth/              # Authentication pages
│   ├── components/        # Reusable React components
│   ├── dashboard/         # User dashboard
│   ├── articles/          # Articles related pages
│   ├── profile/           # User profile pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── api/                   # PHP Backend API
│   ├── auth/              # Authentication endpoints
│   ├── comments/          # Comments endpoints
│   ├── database/          # Database connection and schema
│   ├── posts/             # Posts endpoints
│   └── uploads/           # Uploaded images directory
├── public/                # Static assets
└── package.json           # Project dependencies
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
