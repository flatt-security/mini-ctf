FROM oven/bun:1.0.8-slim

RUN useradd -u 1001 -m ctf
RUN touch /flag && chown ctf:ctf /flag

WORKDIR /home/ctf

COPY server.ts .

USER ctf

ENV NODE_ENV=production

CMD ["bun", "server.ts"]