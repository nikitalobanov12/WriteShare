# 1. Base image for dependencies
FROM oven/bun:1 as deps

# Install openssl for Prisma
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

# Copy package.json, bun.lock and prisma schema to leverage Docker cache
COPY package.json bun.lock ./
COPY prisma ./prisma
RUN bun install --frozen-lockfile

# 2. Builder image
FROM oven/bun:1 as builder
WORKDIR /app

# Copy dependencies from the previous stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the Next.js application
RUN bun run build

# 3. Production image
FROM oven/bun:1 as runner
WORKDIR /app

ENV NODE_ENV=production

# Copy the standalone output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=bun:bun /app/.next/standalone ./
COPY --from=builder --chown=bun:bun /app/.next/static ./.next/static

# Copy the env file and entrypoint script
COPY entrypoint.sh .
# Convert Windows CRLF line endings to Unix LF so scripts run properly
RUN sed -i 's/\r$//' /app/entrypoint.sh

# Make entrypoint script executable
RUN chmod +x /app/entrypoint.sh

# Expose the port the app runs on
EXPOSE 3000

# Set the entrypoint to our script
ENTRYPOINT [ "/app/entrypoint.sh" ] 