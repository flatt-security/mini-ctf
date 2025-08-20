import datetime
import json
import logging
import os
import threading
import time

import docker
from flask import Flask, request

IMAGE_NAME = 'tanuki-sandbox'
FLAG = os.environ.get('FLAG', 'flag{DUMMY}')

client = docker.from_env()
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

def run(json):
    result = client.containers.run(IMAGE_NAME, [json], environment={
        'FLAG': FLAG
    }, remove=True, init=True)
    return result.decode('utf-8')

def clean():
    now = datetime.datetime.now(datetime.timezone.utc)
    logger.info(f'clean() started: {now}')

    containers = client.containers.list(all=True, filters={
        'ancestor': IMAGE_NAME
    })

    for container in containers:
        started_str = container.attrs['State']['StartedAt']
        started = datetime.datetime.fromisoformat(started_str.replace('Z', '+00:00'))

        elapsed = (now - started).total_seconds()
        if elapsed > 60:
            try:
                logger.info(f"Removing container {container.id[:12]} started at {started_str}")
                container.remove(force=True)
            except Exception as e:
                logger.info(f"Failed to remove container {container.id[:12]}: {e}")

    now = datetime.datetime.now(datetime.timezone.utc)
    logger.info(f'clean() finished: {now}')

def cleanup_worker():
    while True:
        try:
            clean()
        except Exception as e:
            logger.info(f'error occurred in clean(): {e}')
        time.sleep(60)

app = Flask(__name__)

with open('index.html', 'r') as f:
    index_html = f.read()
@app.get('/')
def index():
    return index_html

@app.post('/run')
def go():
    user_input = request.form.get('input', '')
    try:
        json.loads(user_input)
    except:
        return 'Please input valid JSON'

    logger.info(f'payload: {user_input}')
    try:
        result = run(user_input)
        logger.info(f'result: {result}')
    except Exception as e:
        logger.info(f'error occurred in run(): {e}')
        return 'error occurred'
    return result

if __name__ == '__main__':
    cleanup_thread = threading.Thread(target=cleanup_worker, daemon=True)
    cleanup_thread.start()
    app.run(host='0.0.0.0')
