FROM hasura/graphql-engine:v1.0.0-alpha38

# Enable the console
ENV HASURA_GRAPHQL_ENABLE_CONSOLE=true

# Comment the command above and use the command below to
# enable an access-key and an auth-hook
# Recommended that you set the access-key as a environment variable in heroku
CMD graphql-engine \
  --database-url $DATABASE_URL \
  serve \
  --server-port $PORT \
  --access-key $HASURA_GRAPHQL_ADMIN_SECRET