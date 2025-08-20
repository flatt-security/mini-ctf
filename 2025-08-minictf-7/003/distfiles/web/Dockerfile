FROM node:22-bookworm-slim

WORKDIR /app

RUN apt update -y && apt install -y cowsay gcc

COPY ./readflag.c /tmp/readflag.c
RUN gcc -static -o /readflag /tmp/readflag.c
RUN rm /tmp/readflag.c
RUN chmod 111 /readflag
RUN mv /readflag /readflag-$(head -c 8 /dev/urandom | od -A n -t x1 | tr -d ' \n')

COPY package.json package-lock.json ./
RUN npm i

COPY index.js index.html ./

RUN groupadd -r appuser && useradd -r -g appuser -G audio,video appuser \
    && mkdir -p /home/appuser/Downloads \
    && chown -R appuser:appuser /home/appuser \
    && chown -R appuser:appuser /app/node_modules
USER appuser

CMD ["node", "index.js"]