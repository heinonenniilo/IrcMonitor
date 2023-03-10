# IrcMonitor

The purpose of the application is to show statistics from IRC channels but could be also be used with other sources. 

## Backend

Backend is based on https://github.com/jasontaylordev/CleanArchitecture

Currently, Google IdToken is sent to the backend. The backend validates the token, and creates an API acces token of its own, with the user roles. Later, could possibly add other mechanism to authenticate than Google. Google authentication also requires some fine-tuning to be made.

## Adding a new migration

add-migration [migration name] -verbose -outputdir "Persistence/Migrations"

## UI

React UI with typescript. Used the VS React template as a base (https://learn.microsoft.com/en-us/visualstudio/javascript/tutorial-asp-net-core-with-react?view=vs-2022).

Using stuff such as:

- Typescript
- MaterialUI
- Redux

To update API definitions in the UI after making changes in the backend, run

``generateTypedFetchAPIs.ps1``

in src/IrcMonitor.ReactUI. The PowerShell script will update APIs / Models automatically based on the OpenApi doc.

The UI setup goes normally by running ``yarn install`` and then ``yarn start``.

Currently, only supports authentication using a Google account. UI layout is a draft.

## Setting up (Draft)

1. Clone the project. 
2. In appsettings (Web project), ConnectionStrings.DefaultConnection should point to a valid DB instance, so that migrations can be run.
3. Create a Google Client ID. Instructions here, for example: https://blog.logrocket.com/guide-adding-google-login-react-app/
4. Configure ClientId / ClientSecret in Web project appsettings. For local development client secrets could be used.
5. Set GOOGLE_CLIENT_ID in the UI, for which there is an entry in .env file. Locally, you could set in in .env.local for example. 
   - Pay attention to providing https://localhost / https://localhost:3000 as authorized URLs, to allow local development.
7. SetupProxy.js (in IrcMonitor.ReactUi\src) should point to where the API is located locally, for example https://localhost:5001/api (TODO: Check this part)
8. Generate private / public key, with OpenSSL for example (https://slproweb.com/products/Win32OpenSSL.html).
    - ``openssl rsa -pubout -in private_key.pem -out public_key.pem`` will create the public key
    - ``openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2048`` will create the private key.
    - The code currently expects the  keys to be in ```-----BEGIN PRIVATE KEY-----```/ ```-----BEGIN PUBLIC KEY-----``` format.
9. Place the keys (without BEGIN / END part) in appsettings. (This part could be implemented better).

To assign yourselft with an admin role, add a row corresponding with your Google email in Users-table. After that, check the ID of the user row and insert a role having "Admin" as value for "Role" column and your user's id as value for UserId column.

To insert some test data, ``TestDataInsert.sql`` in the SQL folder could be used.

UI and the backend need to be started separately.


## TODO
- Improve UI styling / CSS architecture in general, as it is currently a very draft version.
- Redux could be used more to store data, like criterias etc.
- Implement proper mechanism for refetching the token / validate the current implementation in general.
- Readiness for publishing the application somewhere.
- There could possibly be some Saga styled solution to handle async stuff in the UI.
- Toast notification system needs to be included in the UI, to handle failing requests etc. etc.
- Backend error handling needs to be improved, on what to show for users etc.
- Use redirect flow for Google login...
- The proxy setup from VS React template is currently not working with the generated APIs


