# Project Name

This project uses Vite, Tailwind CSS, and Radix UI.

## Setup and Running

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and configure as needed
4. Run the development server: `npm run dev`

## Additional Information

- `.env.example` includes a `USE_LOCAL_DATA` variable which, when set, uses initial data from [`src/context/data.ts`](./src/context/data.ts)
- PAPI (in `.papi` folder) was generated with `npm run papi add -w ws://localhost:9944 dev`
- PAPI methods can be modified in [`src/api/methods.ts`](./src/api/methods.ts)
