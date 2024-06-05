FROM node:20
RUN npm install -g npm
COPY ./install.sh /install.sh
RUN chmod +x /install.sh
RUN /install.sh
RUN mkdir -p /app
WORKDIR /app
