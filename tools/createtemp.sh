#!/usr/bin/env bash

function echoe()
{
	echo "$@" 1>&2
}

openssl rand -out 6M.tmp 6291456

EXITCODE=$?
if [ $EXITCODE -ne 0 ]
then
	echoe "ERROR: openssl failed to create the temp file"
	exit $EXITCODE
fi

openssl dgst -md5 6M.tmp | cut -d ' ' -f 2
