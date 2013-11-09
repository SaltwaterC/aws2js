#!/usr/bin/env bash

beautify="./node_modules/.bin/js-beautify"

find . -name "*.js" -type f | grep -v node_modules | grep -v docs | xargs $beautify --replace --indent-with-tabs
find . -name "*.json" -type f | grep -v node_modules | grep -v docs | xargs $beautify --replace --indent-with-tabs
