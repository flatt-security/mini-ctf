FROM python:3.12.0-bookworm AS build

COPY requirements.txt .
RUN pip install -r requirements.txt

FROM python:3.12.0-slim-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
    libxml2 \
    && rm -rf /var/lib/apt/lists/*

RUN useradd -u 1001 -m ctf

COPY --from=build /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=build /usr/local/bin/uwsgi /usr/local/bin/uwsgi

WORKDIR /home/ctf

COPY server.py ./

USER ctf

CMD ["/bin/sh", "-c", "uwsgi --http :${PORT:-3000} --master -p 4 -w server:app"]
