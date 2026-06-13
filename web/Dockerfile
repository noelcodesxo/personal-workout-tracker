FROM oven/bun:latest

WORKDIR /app

COPY .  .

RUN bun install

# Build a production bundle at image-build time. We do NOT run `next dev` here:
# Next 16's Turbopack dev server is unstable under the Bun runtime (intermittent
# "Next.js package not found" panics while computing HMR updates), and with no
# source bind-mount in compose.yaml dev mode gives no live-reload benefit anyway.
RUN bun run build

EXPOSE 3000

CMD [ "bun", "run", "start" ]