#!/usr/bin/env bash

tsc

mv ./.gitignore ./.gitignore-bak
mv ./.gitignore-gh-pages ./.gitignore
