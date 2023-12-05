FROM debian:bullseye-slim AS getflag

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build

COPY getflag.c .
RUN gcc -static -o getflag getflag.c

FROM busybox:1.35.0-musl AS busybox

FROM oven/bun:1.0.14-slim

# overwrite /bin with busybox
RUN rm -rf /bin
COPY --from=busybox /bin /bin

COPY --from=getflag /build/getflag /getflag

RUN useradd -u 1001 ctf
COPY flag /flag
# make /flag only readable from /getflag
RUN chmod 400 /flag && chmod u+s /getflag

WORKDIR /home/ctf

COPY package.json bun.lockb tsconfig.json ./
RUN bun install

COPY server.ts index.html ./

USER ctf

ENV NODE_ENV=production

CMD ["bun", "server.ts"]
