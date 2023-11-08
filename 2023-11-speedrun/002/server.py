import ast
import base64
import pickle

import yaml
from fastapi import FastAPI
from jinja2 import Template
from pydantic import BaseModel


class Input(BaseModel):
    input: str | None = None
    base64_input: str | None = None


app = FastAPI()


@app.get('/')
def index():
    return 'Choose your own function!'


@app.post('/eval')
def api_eval(input: Input):
    return {'output': repr(ast.literal_eval(input.input))}


@app.post('/jinja2')
def api_jinja2(input: Input):
    return {'output': Template(input.input).render()}


@app.post('/pickle')
def api_pickle(input: Input):
    return {'output': repr(pickle.loads(base64.b64decode(input.base64_input)))}


@app.post('/yaml')
def api_yaml(input: Input):
    return {'output': repr(yaml.load(input.input, Loader=yaml.Loader))}
