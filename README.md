# Notion Clone

## Stack


### Frontend & UI
- **[Next.js 14](https://nextjs.org/)**
- **[TypeScript](https://www.typescriptlang.org/)**
- **[React 19](https://react.dev/)**
- **[Tailwind CSS](https://tailwindcss.com/)**: CSS++
- **[shadcn/ui](https://ui.shadcn.com/)**: UI components

### Real-time Collaboration
- **[Liveblocks](https://liveblocks.io/)**: realtime features, alternative to socket io
- **[Tiptap](https://tiptap.dev/)**: liveblocks platform for text editors
- **[Yjs](https://yjs.dev/)**: Conflict free replication

### Backend & Database
- **[tRPC](https://trpc.io/)**: type safe api's
- **[Prisma](https://prisma.io/)**: ORM 
- **[PostgreSQL](https://postgresql.org/)**: RDBMS 
- **[NextAuth.js](https://next-auth.js.org/)**: Authentication

### Performance & Development Tooling
- **[Bun](https://bun.sh/)**: (npm alternative)
- **[Redis](https://redis.io/)**: Cache
- **[Vitest](https://vitest.dev/)**: Unit testing
- **[Playwright](https://playwright.dev/)**: end to end testing

## Core functionality

### Real-time Collaborative Editing
**[Liveblocks](https://liveblocks.io/)** and **[Yjs](https://yjs.dev/)** enable multiple users to edit the same document at once. All changes sync instantly and merge automatically without conflicts.

- **Live Cursor & Presence**: Shows who is in the document and their cursor positions.
- **Optimistic Updates**: Changes appear immediately in the UI before server confirmation.

### Rich Text Editor
Editing is powered by **[Tiptap](https://tiptap.dev/)**.

- **Formatting**: Supports bold, italic, strikethrough, highlights, headings, lists, and blockquotes.
- **Content Blocks**:
    - **Tables**: Resizable and editable.
    - **Code Blocks**: Syntax highlighting for code.
    - **Task Lists**: Interactive checkboxes.
    - **Media**: Embedding images and links.
- **Toolbar**: The custom `EditorToolbar` provides access to all editor features.

### Workspace Management
Documents are organized into workspaces with authentication and permissions.

- **NextAuth.js**: Authentication with Google, GitHub, or Discord.
- **Permissions**: Only workspace members can access or edit documents, enforced by a custom Liveblocks auth endpoint and database checks.

### Data & Caching
Data is stored in PostgreSQL (via Prisma) and cached in Redis for fast access.

- **PostgreSQL**: Main data store.
- **Redis**: Caching layer to speed up data retrieval and reduce database load.

---

## Technical

### File Structure & Organization
- The `src/` directory is organized by feature: `components/`, `hooks/`, `lib/`, `server/`, and `app/`.
- Next.js 14+ App Router is used in `src/app/`, with route segments for workspaces, pages, and authentication.
- All UI is built with [shadcn/ui](https://ui.shadcn.com/) components, extended with custom logic and Tailwind CSS.
- Custom React hooks (e.g., `use-online`, `use-debounce`, `use-mobile`) encapsulate reusable logic for online status, debouncing, and responsive design.
- The `lib` directory contains utilities for caching, data access (DAL), and server actions.
- The `server` directory contains API routers (tRPC), database (Prisma), and Redis client setup.
- Database schema and migrations are located in `prisma/`.
- Unit and integration tests are colocated with code in `src/`, using [Vitest](https://vitest.dev/) and [Playwright](https://playwright.dev/).

### Architectural Patterns
- Modularity is enforced at every layer. Features are isolated in their own directories, and shared logic is abstracted into hooks, utilities, and context providers.
- Separation of concerns is maintained between UI, business logic, and data access. The data access layer (DAL) abstracts all database interactions and authorization logic.
- Dependency management is explicit. All dependencies are injected or imported at the top of each module. No hidden globals are used except for singleton patterns (Prisma, Redis) to optimize resource usage.
- Error boundaries are implemented at the UI level to catch and display errors gracefully. API errors are consistently formatted and logged for debugging.
- State management uses React Server Components for server state, React hooks for local state, and Context API for shared client state. State normalization is applied where appropriate.
- Optimistic UI updates are used for a responsive user experience, with rollback on error.
- Code splitting and lazy loading are used to optimize bundle size and performance.
- Strict linting, formatting, and type checking are enforced in CI/CD pipelines.

### PostgreSQL Optimization
- Schema normalization is applied to reduce data redundancy and improve consistency. All relations are explicitly defined in the Prisma schema.
- Indexes are created on all frequently queried fields, including foreign keys and search fields (e.g., `@@index([workspaceId])` on `Page`).
- Query plans are reviewed and optimized using Prisma's query logging and PostgreSQL's `EXPLAIN` command.
- Connection pooling is managed by Prisma, with singleton client instantiation to avoid exhausting database connections in serverless or multi-process environments.
- N+1 query problems are avoided by using Prisma's `include` and `select` features to fetch related data in a single query.
- Pagination and infinite scrolling are implemented using cursor-based or offset-based pagination, depending on the use case.
- Transactions are used for complex operations to ensure atomicity and consistency.
- Read and write operations are separated where possible to optimize for performance and scalability.
- Caching with Redis is used to reduce database load for frequently accessed data.

### API Security
- Authentication is handled by NextAuth.js, supporting OAuth providers (Google, GitHub, Discord). Session tokens are securely managed and stored.
- Authorization is enforced at the API layer. Protected procedures in tRPC check user roles and workspace membership before allowing access to resources.
- Input validation is performed on all API endpoints using [Zod](https://zod.dev/). Invalid or malicious input is rejected before reaching business logic or the database.
- Rate limiting is implemented at the API gateway or middleware level to prevent abuse and denial-of-service attacks.
- CSRF protection is enabled for all state-changing endpoints.
- CORS policies are configured to restrict API access to trusted origins.
- Session management uses secure, HTTP-only cookies and proper expiration policies.
- All sensitive data is encrypted in transit using HTTPS. No secrets are exposed to the client.
- Error messages are sanitized to avoid leaking sensitive information.
- Audit logging is implemented for critical actions and authentication events.

### Design and Development Principles
- Scalability is achieved through modular architecture, stateless API design, and horizontal scaling of Dockerized services.
- Maintainability is prioritized by enforcing strict TypeScript, code reviews, and comprehensive documentation.
- Code review is required for all changes. Automated tests and static analysis run on every pull request.
- Testing includes unit, integration, and end-to-end tests. Mocks and test utilities are provided for all major dependencies.
- Accessibility is built in from the start. All UI components use semantic HTML, ARIA attributes, and support keyboard navigation and screen readers.
- Performance is optimized through caching, code splitting, lazy loading, and efficient database queries.
- Developer experience is enhanced by fast feedback loops (Bun, hot reload), clear error messages, and consistent code style.
- Continuous integration and deployment pipelines automate testing, linting, and deployment.
- Documentation is kept up to date and covers architecture, setup, and contribution guidelines.

### Real-time Collaboration
- Real-time editing is powered by [Liveblocks](https://liveblocks.io/) and [Yjs](https://yjs.dev/), enabling CRDT-based conflict-free collaboration.
- Presence indicators and live cursors are provided for all users in a document.
- The `/api/liveblocks-auth` endpoint ensures only authorized workspace members can join a collaborative session.
- The `use-online` hook and UI indicators display connection status and handle reconnection.
- Collaborative threads and comments are supported via Liveblocks and Tiptap extensions.

### API Design: tRPC & REST Patterns
- All business logic and data access is exposed via [tRPC](https://trpc.io/) routers in `src/server/api/routers/`.
  - Queries and mutations are defined with Zod validation and error handling.
  - Authenticated endpoints use a `protectedProcedure` middleware for session validation.
  - Endpoints are organized by resource (e.g., `page`, `workspace`, `post`) and follow RESTful conventions (CRUD, resource nesting), despite tRPC's RPC-based nature.
- Next.js API routes are used for health checks and third-party integrations (e.g., `/api/health`, `/api/liveblocks-auth`).
- All API inputs are validated with [Zod](https://zod.dev/).
- Error formatting is consistent and user-friendly.

### Database Design & Query Optimization
- All database access is via [Prisma](https://prisma.io/), with a normalized schema for users, workspaces, pages, posts, and memberships.
- Indexes are defined on frequently queried fields (e.g., `@@index([workspaceId])` on `Page`).
- Database transactions are used for complex operations to ensure consistency.
- Only necessary fields are selected (DTO pattern), and relations are included as needed to avoid N+1 issues.
- Redis caches query results (e.g., workspace pages, user workspaces) with TTLs and invalidation on mutation.
- Utilities such as `cacheOrFetch`, `userCache`, `workspaceCache`, and `invalidateCache` maintain cache consistency and performance.

### Docker & Local Development
- Local development uses Docker containers for PostgreSQL and Redis, started via `start-database.sh` and `start-redis.sh` scripts.
  - Scripts support both Docker and Podman, and are cross-platform (Windows via WSL, macOS, Linux).
  - Environment variables are loaded from `.env`.
  - Containers are named per-project for easy management.
- [Bun](https://bun.sh/) is used as the package manager and runtime for all scripts and dependencies.

### UI/UX & Accessibility
- All UI is built with accessible, composable shadcn/ui components, extended with Tailwind CSS for custom design.
- Mobile-first responsive layouts and mobile sidebar support are implemented.
- ARIA attributes, keyboard navigation, and focus management are present throughout the UI.
- Theme toggling is provided via a custom `ThemeProvider`.
- Skeleton screens and loading indicators are used for all asynchronous data.

### Testing & Quality
- [Vitest](https://vitest.dev/) is used for unit tests (see `src/lib/*.test.ts`, `src/server/*.test.ts`).
- [Playwright](https://playwright.dev/) is used for end-to-end tests.
- Custom test utilities and mocks are provided for tRPC, NextAuth, and UI components.
- ESLint and Prettier enforce code quality and style.

### Summary
This Notion clone is designed for maintainability, scalability, and real-time collaboration. Modern full-stack patterns are used: Next.js App Router, tRPC, Prisma, shadcn/ui, Liveblocks/Yjs, Redis caching, and Dockerized services. The architecture prioritizes developer experience, performance, and accessibility.

## Challenges

### Real-time Collaboration & Infinite Save Loops
Implementing real-time collaborative editing with Liveblocks, Yjs, and Tiptap introduced several challenges:

- **Infinite Save Loop:**
  - The initial implementation kept local content state in the parent component and attempted to auto-save on every change. This conflicted with the collaborative editor's own state management, causing an infinite save loop as the parent and editor continually triggered updates.
  - **Solution:** The parent component was refactored to only manage and auto-save metadata (title, emoji), while the collaborative editor became the sole owner of the document content and CRDT state. The editor now handles its own persistence, and the parent only saves when title or emoji change.

- **CRDT State Management:**
  - Ensuring the CRDT state (used for conflict-free real-time editing) was correctly initialized from the backend and saved back on every change required careful separation of concerns. The backend exposes a dedicated mutation for updating only the CRDT state, and the editor is responsible for calling it when collaborative changes occur.

- **Frontend/Backend API Consistency:**
  - The collaborative editor originally relied on a global `window.api` pattern to trigger backend saves, which was fragile and not type-safe. The solution was to expose the backend mutation via tRPC and call it directly from the editor, ensuring type safety and maintainability.

- **State Initialization & Debouncing:**
  - Properly initializing state from the backend and debouncing updates to avoid excessive network calls was essential for both performance and user experience. Debouncing is now only applied to metadata fields, and the collaborative content is managed by Yjs/Liveblocks with its own throttling.

These changes resulted in a robust, scalable, and maintainable real-time collaborative editing experience, with clear separation between document metadata and collaborative content state.


