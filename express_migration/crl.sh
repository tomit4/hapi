#!/usr/bin/env bash

# for use with server.js
# curl -X POST http://localhost:3000/hello -H "Content-Type: application/json" -d '{"name": "Thomas Jefferson"}'

# for use with validator.js should succeed cuz Joi validator set to max 140 characters
curl -X POST http://localhost:3000/post -H "Content-Type: application/json" -d '{"post": "Thomas Jefferson"}' &
# for use with validator.js should fail cuz Joi validator set to max 140 characters
curl -X POST http://localhost:3000/post -H "Content-Type: application/json" -d '{"post": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."}'
