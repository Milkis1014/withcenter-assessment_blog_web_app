<<<<<<< HEAD
# Blog Web App

A simple blog web application built with React, TypeScript, Redux, and Supabase.

## Features

- User Authentication (Registration, Login, Logout)
- Blog CRUD Operations (Create, Read, Update, Delete)
- Blog Listing with Pagination
- Protected Routes
- Modern UI with responsive design

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Redux Toolkit** - State management
- **Supabase** - Backend (Authentication & Database)
- **React Router** - Routing
- **Vite** - Build tool

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a new project at [Supabase](https://supabase.com)
2. Go to Project Settings > API to get your project URL and anon key
3. Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set up Database

In your Supabase project, run the following SQL in the SQL Editor:

```sql
-- Create blogs table
CREATE TABLE blogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read all blogs
CREATE POLICY "Users can read all blogs" ON blogs
  FOR SELECT USING (true);

-- Create policy to allow users to create their own blogs
CREATE POLICY "Users can create their own blogs" ON blogs
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Create policy to allow users to update their own blogs
CREATE POLICY "Users can update their own blogs" ON blogs
  FOR UPDATE USING (auth.uid() = author_id);

-- Create policy to allow users to delete their own blogs
CREATE POLICY "Users can delete their own blogs" ON blogs
  FOR DELETE USING (auth.uid() = author_id);
```

### 4. Disable Email Confirmation

1. Go to Authentication > Settings in your Supabase dashboard
2. Under "Email Auth", disable "Enable email confirmations"

### 5. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/       # Reusable components
│   └── ProtectedRoute.tsx
├── lib/             # External library configurations
│   └── supabase.ts
├── pages/           # Page components
│   ├── Register.tsx
│   ├── Login.tsx
│   ├── BlogList.tsx
│   ├── BlogCreate.tsx
│   ├── BlogEdit.tsx
│   └── BlogView.tsx
├── store/           # Redux store configuration
│   ├── slices/
│   │   ├── authSlice.ts
│   │   └── blogSlice.ts
│   ├── hooks.ts
│   └── store.ts
├── App.tsx          # Main app component with routing
├── main.tsx         # Entry point
└── index.css        # Global styles
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Pages

- `/register` - User registration
- `/login` - User login
- `/blogs` - Blog listing with pagination (protected)
- `/blogs/create` - Create new blog (protected)
- `/blogs/:id` - View blog details (protected)
- `/blogs/:id/edit` - Edit blog (protected)

## Notes

- Email confirmation is disabled for easier testing during development
- Users can only edit/delete their own blogs
- Pagination is set to 10 blogs per page by default
- All routes except `/register` and `/login` are protected and require authentication
=======
# withcenter-assessment_blog_web_app
Simple Blog Web Application using ReactJS
>>>>>>> f297b4ac6a5410c5951f8afba670d11742975584
