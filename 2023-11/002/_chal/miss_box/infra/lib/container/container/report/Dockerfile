ARG FUNCTION_DIR="/home/pptruser"

FROM node:20-alpine as nodebuild
LABEL environment=build
WORKDIR /app
COPY code /app/
RUN npm install
RUN npm run build
RUN npm prune --production

# 参考 https://rensaba-programer.jp/2023/03/16/lambda-%E3%82%B3%E3%83%B3%E3%83%86%E3%83%8A%E3%82%A4%E3%83%A1%E3%83%BC%E3%82%B8%E3%81%A7-puppeteer19-7-5-%E3%82%92%E4%BD%BF%E3%81%A3%E3%81%A6%E3%81%BF%E3%81%9F/
# Lambda Runtime Interface Client
FROM node:20-buster as aws-lambda-ric-build-image
LABEL environment=build-ric
RUN apt-get update && \
    apt-get install -y \
    g++ \
    make \
    cmake \
    unzip \
    libcurl4-openssl-dev
RUN mkdir -p /ric
WORKDIR /ric
COPY aws-lambda-rie .
COPY entry.sh .
RUN npm install aws-lambda-ric

FROM ghcr.io/puppeteer/puppeteer:21.5.2
ARG FUNCTION_DIR
ENV PUPPETEER_CACHE_DIR ${FUNCTION_DIR}/.cache/puppeteer
USER root
RUN mkdir -p /ric
COPY --from=aws-lambda-ric-build-image /ric /ric
RUN chmod 755 /ric/entry.sh
RUN chmod 755 /ric/aws-lambda-rie
WORKDIR ${FUNCTION_DIR}
COPY --from=nodebuild /app/dist ${FUNCTION_DIR}
ENTRYPOINT ["/ric/entry.sh"]
CMD ["index.handler"]
