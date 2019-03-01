#! /bin/bash

green=`tput setaf 2`
blue=`tput setaf 4`
white=`tput setaf 7`
bold=`tput bold`
normal=`tput sgr0`

source .env

echo ""
echo "${bold}${blue}Variables:${normal}${white}"
echo "Remote server:   ${green}${REMOTE_SCHEMA_SERVER_URL}${white}"
echo "Admin secret:    ${green}${HASURA_GRAPHQL_ADMIN_SECRET}${white}"
echo "Database URL:    ${green}${DATABASE_URL}${white}"
echo ""

docker-compose up -d

echo ""
echo "Hasura Graphql-Engine is now starting at ${bold}${green}http://localhost:8080/console${normal}${white}"
echo ""
echo "${bold}${blue}Advice:${normal}${white}"
echo "- Set ${green}REMOTE_SCHEMA_SERVER_URL${white} as a remote schema"
echo "- If prompted for admin secret use ${green}${HASURA_GRAPHQL_ADMIN_SECRET}${white}"
echo "- Remember to refresh the meta data on the remote instance after you make changes locally"
echo ""