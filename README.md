# Notion Clone

This is a full-stack, collaborative Notion clone built with the [T3 Stack](https://create.t3.gg/). It features real-time editing capabilities to enable seamless collaboration between users.

## Technologies Used

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)
- [Vitest](https://vitest.dev/) for unit testing
- [Playwright](https://playwright.dev/) for end-to-end testing

## Getting Started

First, install the dependencies:

```bash
bun install
```

Then, run the development server:

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Testing

This project uses Vitest for unit testing and Playwright for end-to-end (E2E) testing.

### Unit Tests (Vitest)

Unit tests focus on individual functions or components. To run unit tests:

```bash
bun run test:unit
```

Vitest automatically discovers files ending with `.test.ts` or `.spec.ts` (among others).

### End-to-End Tests (Playwright)

E2E tests simulate user interactions across the entire application. To run E2E tests:

```bash
bun run test:e2e
```

Playwright tests are located in the `./tests` directory and typically end with `.spec.ts`. You can use Playwright Codegen to help write new tests:

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

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.
