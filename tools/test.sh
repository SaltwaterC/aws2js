#!/bin/sh

NODE_BIN='/usr/bin/env node'
FAIL=0
TOTAL=0

cd tests

platform=`uname`
dir=`which dir`
if [ "$platform" = "FreeBSD" ]
then
	# Try to use the GNU CoreUtils
	dir=`which gdir`
fi

if [ "$dir" = "" ]
then
	echo "The unit testing framework expects the GNU CoreUtils to be in \$PATH."
	exit 1
fi

for TEST in `$dir -d ./*.js`
do
	if [ -f $TEST ]
	then
		echo "Running test: "`basename $TEST`
		$NODE_BIN $TEST > /dev/null
		EXIT_CODE=$?
		if [ $EXIT_CODE -ne 0 ]
		then
			FAIL=$(($FAIL+1))
		fi
		TOTAL=$(($TOTAL+1))
	fi
done

echo ""
echo "Failed tests: $FAIL"
echo "Total tests: $TOTAL"
echo ""

if [ $FAIL -eq 0 ]
then
	exit 0
else
	exit 1
fi
