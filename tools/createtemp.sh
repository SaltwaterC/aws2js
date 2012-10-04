#!/bin/sh

dd if=/dev/urandom of=6M.tmp bs=1M count=6 2>/dev/null
md5sum 6M.tmp | cut -d' ' -f1
