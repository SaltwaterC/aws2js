#!/usr/bin/env bash

function echoe()
{
	echo "$@" 1>&2
}

dd if=/dev/urandom of=6M.tmp bs=1048576 count=6 2>/dev/null

EXITCODE=$?

if [ $EXITCODE -ne 0 ]
then
	echoe "ERROR: dd failed to create the temp file"
	exit $EXITCODE
fi

which md5sum 1>/dev/null 2>&1

if [ $? -eq 0 ]
then
	md5sum=md5sum
else
	md5sum=gmd5sum
fi

$md5sum 6M.tmp | cut -d' ' -f1
