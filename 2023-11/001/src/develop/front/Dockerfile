FROM ts-app-base:latest
COPY ./install.sh /install.sh
RUN chmod +x /install.sh
RUN /install.sh
RUN mkdir -p /app
WORKDIR /app
