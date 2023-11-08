FROM python:3.12.0-bookworm AS build

COPY requirements.txt .
RUN pip install -r requirements.txt

FROM python:3.12.0-slim-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
    libxml2 \
    && rm -rf /var/lib/apt/lists/*

RUN useradd -u 1001 -m ctf

COPY --from=build /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=build /usr/local/bin/uvicorn /usr/local/bin/uvicorn

WORKDIR /home/ctf

COPY server.py ./

USER ctf

CMD ["/bin/sh", "-c", "uvicorn server:app --host 0.0.0.0 --port ${PORT:-3000}"]
