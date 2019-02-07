#!/usr/bin/env bash

tsc

mv ./.gitignore ./.gitignore-bak
mv ./.gitignore-gh-pages ./.gitignore

rm ./js/Github.js
echo "--------------------------------------------------------------------------------" >> ./js/Github.js
echo "console.log('Launched with commit $TRAVIS_COMMIT');" >> ./js/Github.js
echo "console.log('View the source at https://github.com/patacat/patacat/tree/$TRAVIS_COMMIT');" >> ./js/Github.js
echo "--------------------------------------------------------------------------------" >> ./js/Github.js
