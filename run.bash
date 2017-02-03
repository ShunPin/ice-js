#!/bin/bash
while true
do
	echo "Run StressLogin"
	(sleep 5;wget http://localhost:3000/stressLogin/startAll)&
	node bin/www
done