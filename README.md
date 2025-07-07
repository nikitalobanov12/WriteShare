# Notion Clone

This is a full-stack, collaborative Notion clone built with the [T3 Stack](https://create.t3.gg/). It features real-time editing capabilities and a robust caching layer with Redis to ensure a seamless and performant user experience.

## Technologies Used

- [Next.js](https://nextjs.org/)
- [NextAuth.js](https://next-auth.js.org/)
- [Prisma](https://prisma.io/)
- [tRPC](https://trpc.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Redis](https://redis.io/) for caching
- [Vitest](https://vitest.dev/) for unit testing
- [Playwright](https://playwright.dev/) for end-to-end testing

## Getting Started

### 1. Prerequisites

- [Bun](https://bun.sh/): The project uses Bun for package management and as a runtime.
- [Docker](https://www.docker.com/products/docker-desktop/): Required for running local PostgreSQL and Redis services.

### 2. Initial Setup

First, install the dependencies:
```bash
bun install
```

### 3. Environment Variables
If it doesn't exist, create a `.env` file from the example:
```bash
cp .env.example .env
```
Update the `.env` file with your authentication provider credentials (e.g., Google, GitHub). The `DATABASE_URL` and `REDIS_URL` are pre-configured for the local Docker setup.

### 4. Run the Development Environment

This command starts the PostgreSQL and Redis Docker containers, and then launches the Next.js development server:
```bash
bun run dev:services
```
Your app will be running at [http://localhost:3000](http://localhost:3000).

## Local Development Services

The project relies on PostgreSQL and Redis services running in Docker containers. We have provided scripts in `package.json` to manage them easily.

- **Start all services (PostgreSQL + Redis) and the app:**
  ```bash
  bun run dev:services
  ```

- **Start only the backend services:**
  ```bash
  bun run services:start
  ```

- **Stop all backend services:**
  ```bash
  bun run services:stop
  ```

- **Manage Redis individually:**
  ```bash
  # Start Redis
  bun run redis:start

  # Stop Redis
  bun run redis:stop
  ```

- **Check Service Health:**
  Once the app is running, you can check the status of the database and Redis connections at:
  [http://localhost:3000/api/health](http://localhost:3000/api/health)


## Testing

This project uses Vitest for unit testing and Playwright for end-to-end (E2E) testing.

**Important**: Some tests (e.g., for caching) require the Redis service to be running.
```bash
# Start Redis before running tests
bun run redis:start
```

### Unit Tests (Vitest)

Unit tests focus on individual functions or components. To run unit tests:
```bash
bun run test:unit
```
Vitest automatically discovers files ending with `.test.ts` or `.spec.ts`.

### End-to-End Tests (Playwright)

E2E tests simulate user interactions across the entire application. To run E2E tests:
```bash
# Ensure the app is running first
bun run dev:services

# In a new terminal
bun run test:e2e
```
Playwright tests are located in the `./tests` directory. Use Playwright Codegen to help write new tests:
```bash
bun playwright codegen http://localhost:3000
```

### All Tests

To run both unit and end-to-end tests:
```bash
bun run test
```

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information. When deploying, ensure you have a managed PostgreSQL database and Redis instance, and set the `DATABASE_URL` and `REDIS_URL` environment variables accordingly.
