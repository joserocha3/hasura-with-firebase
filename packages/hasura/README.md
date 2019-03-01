# hasura

Connet to remote database:
- `yarn dev` or `sh ./docker-run.sh`
- uses environment variables in `.env`

Connect to local database:
- `yarn local` or `docker-compose up -d`
- `localhost` as a remote schema server
- new postgres instance
- does not user environment variables