FROM nginx:1.25.3-alpine-slim

RUN secret=$(head -c 16 /dev/urandom | sha256sum | awk '{print $1}') && \
    echo "ctf:{PLAIN}${secret}" > /usr/share/nginx/.htpasswd

COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf.template /etc/nginx/templates/

