FROM oven/bun:1

WORKDIR /app

# Install hono directly (only dependency)
RUN bun add hono

# Copy source
COPY packages/sync/src ./src

EXPOSE 10000

CMD ["bun", "run", "src/index.ts"]
