# SyncSpace

SyncSpace is a personal productivity and habit-tracking dashboard. It brings learning, fitness, task, and custom activity logs together in one account, with summary cards and detailed views for reviewing progress over time.

## Features

- Email and password sign-up and login, Google sign-in, password reset, and profile management.
- A dashboard with configurable tracker widgets and a personal to-do list.
- Built-in trackers for:
  - **DSA Mastery:** log coding problems by topic, difficulty, and platform; review activity, streaks, and problem analytics.
  - **Gym & Diet:** record workouts and daily calories, protein, and water; configure nutrition targets and a weekly workout goal.
  - **ML Learning:** log learning sessions by topic, source, resource type, duration, and understanding level; review learning activity and trends.
  - **Kanban Board:** log tasks with status, priority, due date, and tags; review task progress and completion insights.
- Custom trackers with user-defined text, number, or choice fields, plus shared date, duration, rating, and notes fields.
- Quick entry forms, entry editing where supported, activity heatmaps, charts, streaks, and recent logs.
- Supabase-backed accounts and data, with Redux Toolkit for application state.

## Tech stack

- React 19 and Vite
- React Router
- Redux Toolkit and React Redux
- Supabase Auth and database client
- Tailwind CSS 4
- Recharts, `react-activity-calendar`, and `date-fns`

## Requirements

- Node.js and npm
- A Supabase project

## Get started

1. Clone the repository and install dependencies:

   ```bash
   git clone <repository-url>
   cd SyncSpace
   npm install
   ```

2. Create a `.env` file in the project root with your Supabase project URL and publishable key:

   ```dotenv
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-supabase-publishable-key
   ```

   These are the environment variable names read by `src/supabase/supabase.js`. The `.env` file is git-ignored.

3. Configure Supabase Auth for the sign-in methods you plan to use. Set the local and deployed site URLs and redirect URLs in Supabase Auth; enable Google as a provider if you want Google sign-in.

4. Create and secure the database tables and policies used by the app: `profiles`, `widgets`, `entries`, and `todos`. The client reads and writes these tables through Supabase, so authenticated users need policies that limit access to their own records. Widget records include a user, type, name, icon, color, position, and JSON configuration; entries include a widget, user, date, and JSON payload. Profile and to-do fields are used by the corresponding services in `src/supabase/`.

5. Start the development server:

   ```bash
   npm run dev
   ```

Vite prints the local URL in the terminal.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Build the production app into `dist/`. |
| `npm run preview` | Serve the production build locally for preview. |
| `npm run lint` | Run ESLint across the project. |

## Application routes

| Route | Page |
| --- | --- |
| `/` | Landing page |
| `/login`, `/signup` | Authentication |
| `/forgot-password`, `/reset-password` | Password recovery |
| `/dashboard` | Tracker dashboard and to-do list |
| `/dashboard/dsa`, `/dashboard/gym`, `/dashboard/ml`, `/dashboard/kanban` | Built-in tracker detail views |
| `/dashboard/widget/custom/:widgetId` | Custom tracker detail view |
| `/add-tracker` | Add a built-in or custom tracker |
| `/profile` | Profile, password, and tracker management |

Dashboard, tracker, and profile routes require authentication.

## Project layout

```text
src/
  components/   Shared UI, tracker cards, forms, charts, and to-dos
  hooks/        Widget data and configuration hooks
  pages/        Landing, authentication, dashboard, and tracker views
  store/        Redux slices and store setup
  supabase/     Supabase client and data services
  utils/        Date, streak, heatmap, color, and custom-stat helpers
public/         Static icons and favicon
```

## Notes

- The app expects the Supabase schema and row-level security policies to be configured in your own Supabase project; database migrations or schema definitions are not included in this repository.
- Use a Supabase publishable/anon key in the browser. Never put a Supabase service-role key or other server secret in a `VITE_` environment variable.
- For deployment, build with `npm run build` and deploy the contents of `dist/`. Configure the hosting provider to serve the SPA entry point for application routes.
