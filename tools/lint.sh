#!/usr/bin/env bash

function lint
{
	jslint=$(which jslint)
	if [ -z "$jslint" ]
	then
		npm -g install jslint
	fi
	output=$(find $1 -name "*.js" -print0 | xargs -0 jslint --plusplus --white --var --goodparts --todo --node | grep -v "is OK." | grep '[^[:space:]]')
	exit=$?
	echo "$output"
	if [ $exit -eq 0 ]
	then
		exit 1
	fi
}

lint config
lint lib
lint tests
