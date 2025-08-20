FROM python:3.13-slim

RUN pip install flask docker gunicorn
WORKDIR /app
COPY app.py index.html /app/

CMD ["gunicorn", "--bind=0.0.0.0:5000", "--access-logfile=-", "--error-logfile=-", "--capture-output", "--workers=4", "--threads=2", "app:app"]