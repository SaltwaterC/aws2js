#!/usr/bin/env bash

dos2unix ./node_modules/jslint/bin/jslint.js > /dev/null 2>&1

function lint
{
	output=$(find $1 -name "*.js" -print0 | xargs -0 ./node_modules/.bin/jslint --plusplus --white --var --node | grep -v "is OK." | grep --color=never "[^[:space:]]")
	exit=$?
	
	echo "$output" | sed "/^$/d"
	
	if [ $exit -eq 0 ]
	then
		exit 1
	fi
}

until [ -z "$1" ]
do
	lint "$1"
	shift
done
