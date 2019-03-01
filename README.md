# hasura-with-firebase

Please not this is missing the client side application. The client side application would typically require a use to be logged in. Once logged in each request to your custom GraphQL sever (for remote schema) would contain an `Authorization` header, which is forwarded to Hasura. See TODO section at the end of README.

## Setup

1. Clone repo.

### Firebase

1. Create Firebase project.
2. Enable authentication.
   1. Develop->Authentication->Sign-in method->Email/Password then toggle Enable to on and click Save.
3. Download private key and save it somewhere secure.
   1. Click on cog icon (next to Project Overview menu item)->Project Settings->Service Accounts->Firebase Admin SKD->Generate new private key.

### Hasura Server (one click deploy)

1. [Deploy](https://docs.hasura.io/1.0/graphql/manual/getting-started/heroku-simple.html) a Hasura server to Heroku.   
2. Create `/hasura/.env/` - these will also need to be created in the Heroku dashboard Settings->Config Vars section.
   1. HASURA_GRAPHQL_JWT_SECRET needs to be set to what is in `/hasura/example.env/`.
   2. REMOTE_SCHEMA_SERVER_URL will be the Heroku app address of your GraphQL Server (for remote schema), created in next steps.
   3. HASURA_GRAPHQL_ADMIN_SECRET is your choice, set to whatever you want.
   4. DATABASE_URL is auto-populated in the Heroku dashboard.

### GraphQL Server (for remote schema)

1. Create another project in Heroku dashboard. This will be the graphql server for your remote schema.
2. Create `/server/.env/` - these will also need to be created in the Heroku dashboard Settings->Config Vars section.
   1. APP_BASE needs to be set to what is in `/server/example.env/`. Used by the monorepo buildpack.
   2. HASURA_GRAPHQL_ENDPOINT is found in the Hasura server console created from the one click deploy.
   3. YOUR_HASURA_GRAPHQL_ADMIN_SECRET needs to match the one you set of the Hasura server.
   5. FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY and FIREBASE_PROJECT_ID are found in the file you downloaded from Firebase.
3. Add a monorepo build pack.
   1. Settings->Buildpacks->Add buildpack->enter `https://github.com/lstoll/heroku-buildpack-monorepo`->Save changes.
4. Add nodejs build pack.
   1. Settings->Buildpacks->Add buildpack->click nodejs->Save changes.
   2. Make sure the nodejs build pack is after the monorepo buildpack.
5. Commit your new repo to GitHub.
6. Connect Heroku app to GitHub.
   1. Deploy->Deployment method->GitHub->Connect to GitHub->enter repo name->Search->Connect->Manual deploy->Deploy Branch

## TODO

- Implement a front end app
  - Use `react`.
  - Log in, sign up functionality.
- Instead of using YOUR_HASURA_GRAPHQL_ADMIN_SECRET in GraphQL Server (for remote schema) forward headers from front end app.