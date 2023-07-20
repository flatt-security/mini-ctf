FROM node:18-bullseye-slim

WORKDIR /home/ctf

COPY package.json yarn.lock ./
RUN yarn install --immutable && yarn cache clean

COPY database.db tsconfig.json ./
COPY src ./src

RUN useradd -u 1001 -m ctf
USER ctf

ENV NODE_ENV=production

CMD ["./node_modules/.bin/ts-node-esm", "src/index.ts"]
