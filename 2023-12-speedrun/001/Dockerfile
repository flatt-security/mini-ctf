FROM oven/bun:1.0.14-slim

RUN useradd -u 1001 ctf

WORKDIR /home/ctf

COPY package.json bun.lockb tsconfig.json ./
RUN bun install

COPY server.ts .

USER ctf

ENV NODE_ENV=production

CMD ["bun", "server.ts"]
