# IrcMonitor

The purpose of the application is to show statistics from IRC channels but could be also be used with other sources. 

Backend is based on https://github.com/jasontaylordev/CleanArchitecture

## Backend

## UI

React UI with typescript. Used the VS React template as a base (https://learn.microsoft.com/en-us/visualstudio/javascript/tutorial-asp-net-core-with-react?view=vs-2022).

Using stuff such as:

- Typescript
- MaterialUI
- Redux

Currently, only supports authentication using a Google account. UI layout is a draft.

## Setting up (Draft)

1. Clone the project. 
2. In appsettings (Web project), ConnectionStrings.DefaultConnection should point to a valid DB instance, so that migrations can be run.
3. Create a Google Client ID. Instructions here, for example: https://blog.logrocket.com/guide-adding-google-login-react-app/
4. Configure ClientId / ClientSecret in Web project appsettings. For local development client secrets could be used.
5. Set GOOGLE_CLIENT_ID in src\IrcMonitor.ReactUi\src\config.json accordingly.
6. SetupProxy.js (in IrcMonitor.ReactUi\src) should point to where the API is located locally, for example https://localhost:5001/api (TODO: Check this part)
7. Generate private / public key, with OpenSSL for example (https://slproweb.com/products/Win32OpenSSL.html).
    - ``openssl rsa -pubout -in private_key.pem -out public_key.pem`` will create the public key
    - ``openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2048`` will create the private key.
    - The code currently expects the  keys to be in ```-----BEGIN PRIVATE KEY-----```/ ```-----BEGIN PUBLIC KEY-----``` format.
8. Place the keys (without BEGIN / END part) in appsettings. (This part could be implemented better).

To assign yourselft with an admin role, add a row corresponding with your Google email in Users-table. After that, check the ID of the user row and insert a role having "Admin" as value for "Role" column and your user's id as value for UserId column.

To insert some test data, ``TestDataInsert.sql`` in the SQL folder could be used.

## TODO
- Improve UI styling
- Implement proper mechanism for refetching the token.
- Readiness for publishing the application somewhere.

## Adding a new migration

add-migration [migration name] -verbose -outputdir "Persistence/Migrations"
