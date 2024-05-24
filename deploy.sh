#!/bin/bash
TIMESTAMP=`date "+%Y-%m-%dT%H-%M-%S"`
echo $TIMESTAMP
git add .
git commit -m "${TIMESTAMP}"
git push origin
