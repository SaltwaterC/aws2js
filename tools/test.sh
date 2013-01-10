#!/usr/bin/env bash

NODE_BIN="/usr/bin/env node"
FAIL=0
SUCCESS=0
TOTAL=0

cd tests

for TEST in $(ls ./*.js)
do
	if [ -f $TEST ]
	then
		TOTAL=$(($TOTAL + 1))
	fi
done

CURRENT=1
for TEST in $(ls ./*.js)
do
	if [ -f $TEST ]
	then
		TEST_FILE=$(basename $TEST .js)
		PERCENT=$(echo "$CURRENT / $TOTAL * 100" | bc -l | awk '{printf("%d\n",$1 + 0.5)}')
		OUTPUT="\r[$PERCENT% | $CURRENT/$TOTAL | + $SUCCESS | - $FAIL] $TEST_FILE"
		echo -ne $OUTPUT
		$NODE_BIN $TEST > /dev/null
		EXIT_CODE=$?

		SPACER=""
		for IDX in $(seq 0 ${#OUTPUT})
		do
			SPACER=" $SPACER"
		done
		echo -ne "\r$SPACER"

		if [ $EXIT_CODE -ne 0 ]
		then
			echo -e "\n\e[0;31mFailed: $TEST_FILE\e[0m\n"
			FAIL=$(($FAIL + 1))
		else
			SUCCESS=$(($SUCCESS+1))
		fi
		CURRENT=$(($CURRENT + 1))
	fi
done

echo ""
if [ $FAIL -eq 0 ]
then
	# green
	echo -e "\e[0;32mFailed tests: $FAIL\e[0m"
else
	#red
	echo -e "\e[0;31mFailed tests: $FAIL\e[0m"
fi
echo -e "\033[1mTotal tests: $TOTAL\033[0m"
echo ""

if [ $FAIL -eq 0 ]
then
	exit 0
else
	exit 1
fi
