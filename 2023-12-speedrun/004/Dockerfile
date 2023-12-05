FROM returntocorp/semgrep:1.51.0 AS semgrep

WORKDIR /build

RUN curl -o nodejs.yml https://semgrep.dev/c/p/nodejs

FROM oven/bun:1.0.14-slim

COPY --from=semgrep /usr/local/bin/ /usr/local/bin/
COPY --from=semgrep /usr/local/lib/ /usr/local/lib/
COPY --from=semgrep /lib/ /lib/
COPY --from=semgrep /etc/ssl/certs/ /etc/ssl/certs/
COPY --from=semgrep /build/nodejs.yml /home/ctf/

RUN useradd -u 1001 ctf
RUN touch /flag && chown root:ctf /flag && chmod g+rw /flag

WORKDIR /home/ctf

COPY package.json bun.lockb tsconfig.json config.yml ./
RUN bun install

COPY server.ts index.html ./

USER ctf

ENV NODE_ENV=production

CMD ["bun", "server.ts"]
