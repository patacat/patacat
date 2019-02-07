#!/usr/bin/env bash

tsc

mv ./.gitignore ./.gitignore-bak
mv ./.gitignore-gh-pages ./.gitignore

rm ./js/Github.js
echo "console.log('Launched with commit $TRAVIS_COMMIT');\n" >> ./js/Github.js
