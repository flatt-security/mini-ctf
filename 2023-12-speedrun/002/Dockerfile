FROM busybox:1.35.0-musl AS busybox

FROM oven/bun:1.0.14-slim

# overwrite /bin with busybox
RUN rm -rf /bin
COPY --from=busybox /bin /bin

RUN useradd -u 1001 ctf
RUN touch /flag && chown root:ctf /flag && chmod 660 /flag

WORKDIR /home/ctf

COPY package.json bun.lockb tsconfig.json ./
RUN bun install

COPY server.ts index.html ./

USER ctf

ENV NODE_ENV=production

CMD ["bun", "server.ts"]
