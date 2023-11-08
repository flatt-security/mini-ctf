import os

from flask import Flask


class ForbidAdminMiddleware:
    def __init__(self, app):
        self.app = app

    def __call__(self, environ, start_response):
        request_uri = environ['REQUEST_URI']
        if request_uri.startswith('/admin'):
            start_response('403 Forbidden', [])
            return [request_uri.encode()]
        return self.app(environ, start_response)


app = Flask(__name__)
app.wsgi_app = ForbidAdminMiddleware(app.wsgi_app)


@app.route("/")
def index():
    return 'Welcome to Speedrun CTF!'


@app.route("/admin/flag")
def flag():
    return os.environ.get('FLAG', '')
