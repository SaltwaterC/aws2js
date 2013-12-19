#!/usr/bin/env bash

function lint
{
	find $1 -name "*.js" -print0 | xargs -0 ./node_modules/.bin/jshint --config config/jshint.json
	exit=$?
	
	if [ $exit -ne 0 ]
	then
		exit $exit
	fi
}

until [ -z "$1" ]
do
	lint "$1"
	shift
done
