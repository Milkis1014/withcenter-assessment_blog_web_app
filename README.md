
## Simple Blog Web App (React + TypeScript + Redux + Supabase)

A simple blog web application built with **React**, **TypeScript**, **Redux Toolkit**, and **Supabase**.

Users can register, log in, and manage their own blog posts (create, read, update, delete), with blog listing including pagination.

---

### Features

- **Authentication**
  - User registration (email + password)
  - Login
  - Logout
  - Protected routes: only logged-in users can access blog pages

- **Blog Management (CRUD)**
  - Create a blog post
  - View blog details
  - Update a blog post
  - Delete a blog post
  - List all blogs with **pagination** (10 per page by default)

- **Authorization**
  - Users can only **edit/delete their own posts**
  - Everyone can read all posts

- **Tech Stack**
  - **React 18** + **TypeScript**
  - **Vite** dev/build tool
  - **Redux Toolkit** + `react-redux`
  - **React Router v6**
  - **Supabase** (Auth + Postgres + Row Level Security)

---

### Getting Started

#### Prerequisites

- **Node.js** (v18+ recommended)
- **npm** (comes with Node)
- A **Supabase Cloud** account: `https://supabase.com`

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

---

### 2. Install Dependencies

```bash
npm install
```

This installs:

- `react`, `react-dom`
- `@reduxjs/toolkit`, `react-redux`
- `@supabase/supabase-js`
- `react-router-dom`
- TypeScript + Vite + ESLint tooling

---

### 3. Set Up Supabase

#### 3.1 Create a Supabase Project

1. Go to `https://supabase.com` and sign in.
2. Click **New project**.
3. Choose:
   - **Name**: e.g. `blog-web-app`
   - **Database password**: choose and save it
   - **Region**: closest to you
4. Click **Create new project** and wait until it’s ready.

#### 3.2 Get API URL and anon key

1. In your Supabase project, go to **Settings → API**.
2. Note:
   - **Project URL** (API URL)
   - **anon public key** (JWT)

You’ll put these into your `.env`.

#### 3.3 Create the `.env` File

In the project root, create a file named `.env`:

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_PUBLIC_KEY_HERE
```

- Replace both values with the ones from **Settings → API**.
- Vite exposes these as `import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_ANON_KEY`.

#### 3.4 Create the `blogs` Table and Policies

In this repo there is a file: `supabase-setup.sql`.

1. Open your Supabase project dashboard.
2. In the left sidebar, go to **SQL → New query**.
3. Open `supabase-setup.sql` locally and **copy all its contents**.
4. Paste into Supabase’s SQL editor.
5. Click **Run**.
6. Confirm the query runs successfully (no errors).

This will:

- Create a `public.blogs` table:
  - `id` (UUID, PK)
  - `title`, `content`
  - `author_id` (references `auth.users(id)`)
  - `created_at`, `updated_at`
- Enable **Row Level Security**.
- Add policies so:
  - Anyone can **read** all blogs.
  - Users can **insert/update/delete** only their own blogs.

You can verify the table in **Table Editor** under `blogs`.

#### 3.5 Disable Email Confirmation (for simple local testing)

1. In Supabase dashboard, go to **Authentication → Settings** (or **Authentication → Providers**, depending on UI).
2. Under **Email Auth** (or similar):
   - Turn **off** “Enable email confirmations”.
3. Save changes.

Now users can log in immediately after registering without clicking an email link.

---

### 4. Run the App

From the project root:

```bash
npm run dev
```

By default, Vite will start on:

- `http://localhost:5173`

---

### Available Scripts

- **`npm run dev`** – Start development server
- **`npm run build`** – Build for production
- **`npm run preview`** – Preview the production build locally
- **`npm run lint`** – Run ESLint

---

### Application Routes

- **Public**
  - `GET /register` – registration page
  - `GET /login` – login page

- **Protected** (only authenticated users)
  - `GET /blogs` – list blogs with pagination
  - `GET /blogs/create` – create new blog
  - `GET /blogs/:id` – view blog details
  - `GET /blogs/:id/edit` – edit blog

Protected routes are implemented via a `ProtectedRoute` component that checks the Redux-authenticated user.

---

### Architecture Overview

#### Frontend

- **Entry point**: `src/main.tsx`
  - Renders `<App />` inside React’s root
  - Wraps the app with Redux `<Provider store={store}>`

- **Routing**: `src/App.tsx`
  - Uses `BrowserRouter`, `Routes`, and `Route` (React Router v6)
  - Public routes: `/login`, `/register`
  - Protected routes: `/blogs`, `/blogs/create`, `/blogs/:id`, `/blogs/:id/edit`
  - Uses `ProtectedRoute` to redirect unauthenticated users to `/login`
  - Listens for Supabase auth state changes and syncs them into Redux (`setUser`, `setSession`)

- **Supabase Client**: `src/lib/supabase.ts`
  - Creates a Supabase client with:
    - `VITE_SUPABASE_URL`
    - `VITE_SUPABASE_ANON_KEY`

- **Redux Store**: `src/store/store.ts`
  - Combines:
    - `auth` slice (`authSlice.ts`)
    - `blog` slice (`blogSlice.ts`)
  - Exposes `RootState` and `AppDispatch` types.

- **Typed Hooks**: `src/store/hooks.ts`
  - `useAppDispatch()` – typed wrapper around `useDispatch`
  - `useAppSelector` – typed `useSelector` hook

#### Slices

- **Auth Slice**: `src/store/slices/authSlice.ts`
  - State: `user`, `session`, `loading`, `error`
  - Thunks:
    - `signUp({ email, password })`
    - `signIn({ email, password })`
    - `signOut()`
    - `getSession()`
  - Reducers:
    - `setUser`, `setSession`, `clearError`
  - Integrates with `supabase.auth.*` methods.

- **Blog Slice**: `src/store/slices/blogSlice.ts`
  - State:
    - `blogs`, `currentBlog`, `loading`, `error`
    - `totalCount`, `currentPage`, `pageSize`
  - Thunks:
    - `fetchBlogs({ page, pageSize })`
    - `fetchBlogById(id)`
    - `createBlog({ title, content, author_id })`
    - `updateBlog({ id, title, content })`
    - `deleteBlog(id)`
  - Uses `supabase.from('blogs')` queries for all CRUD operations.
  - Stores error messages (including Supabase errors) for the UI to display.

#### Pages

All pages use inline, minimal styling for clarity.

- `src/pages/Register.tsx`
  - Registration form (email, password, confirm password)
  - Calls `signUp` thunk
  - On success, navigates to `/login`

- `src/pages/Login.tsx`
  - Login form (email, password)
  - Calls `signIn` thunk
  - On success, navigates to `/blogs`

- `src/pages/BlogList.tsx`
  - Shows:
    - Logged-in user email
    - “Create Blog” button
    - “Logout” button
  - Fetches paginated blogs via `fetchBlogs`
  - Shows pagination (Previous/Next, current page / total pages)
  - Each blog card: title, excerpt, created/updated dates, and actions:
    - View (`/blogs/:id`)
    - Edit (`/blogs/:id/edit`)
    - Delete (dispatches `deleteBlog`)

- `src/pages/BlogCreate.tsx`
  - Form for `title` and `content`
  - Uses authenticated `user.id` as `author_id`
  - Dispatches `createBlog` and then navigates to `/blogs`

- `src/pages/BlogEdit.tsx`
  - Loads blog by `id` with `fetchBlogById`
  - Pre-fills form with existing data
  - Only allows editing if the current user is the `author_id`
  - Dispatches `updateBlog` and navigates back to `/blogs`

- `src/pages/BlogView.tsx`
  - Displays a single blog post with full content
  - Shows created/updated timestamps
  - If the current user is the author, shows **Edit** and **Delete** actions

- `src/components/ProtectedRoute.tsx`
  - Checks if `auth.user` exists
  - If not authenticated, redirects to `/login`
  - Otherwise, renders the child component

---

### Error Handling & Common Issues

- **“Could not find the table 'public.blogs' in the schema cache”**
  - Means the `blogs` table does not exist (or migrations not run).
  - Fix: ensure you ran `supabase-setup.sql` in the correct Supabase project.

- **Auth errors (“Sign in failed”, etc.)**
  - Check:
    - `.env` values (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
    - Supabase Authentication settings (email/password enabled, confirmations disabled if you want instant log-in).





