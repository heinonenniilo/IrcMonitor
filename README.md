# IrcMonitor

The purpose of the application is to show statistics from IRC channels but could be also be used with other sources. 

## Backend

Backend is based on https://github.com/jasontaylordev/CleanArchitecture

Currently, only authentication with a Google account is supported. Authentication with Google is based on Authorization code-flow. User logs in within the UI, the backend validates the authorization code, and creates an API access token with the user roles. 

Later, could possibly add other mechanism to authenticate than Google. Google authentication also requires some fine-tuning to be made.

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

Currently, only supports authentication using a Google account.

## Setting up (Draft)

1. Clone the project. 
2. In appsettings (Web project), ConnectionStrings.DefaultConnection should point to a valid DB instance, so that migrations can be run.
4. Create a Google Client ID. Instructions here, for example: https://blog.logrocket.com/guide-adding-google-login-react-app/
5. Configure ClientId / ClientSecret in Web project appsettings. For local development client secrets could be used.
6. Set GOOGLE_CLIENT_ID in the UI, for which there is an entry in .env file. Locally, you could set in in .env.local for example. 
   - Pay attention to providing https://localhost / https://localhost:3000 as authorized URLs, to allow local development.
7. SetupProxy.js (in IrcMonitor.ReactUi\src) should point to where the API is located locally, for example https://localhost:5001/api (TODO: Check this part)
9. Generate private / public key, with OpenSSL for example (https://slproweb.com/products/Win32OpenSSL.html).
    - ``openssl rsa -pubout -in private_key.pem -out public_key.pem`` will create the public key
    - ``openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2048`` will create the private key.
10. Place path to the keys in appsettings.
     - Paths found in: ``AuthenticationSettings.RsaPublicKeyLocation`` / ``AuthenticationSettings.RsaPrivateKeyLocation``
     - If a path to both of the keys isn't defined, app creates the key which happens on every startup.
11. Instead of using local / generated keys, you can also use an RSA key vault in Azure KeyVault, see appsettings. Sign in to Azure either with Visual Studio or Azure CLI, to authenticate to the vault.
    

To assign yourselft with an admin role, add a row corresponding with your Google email in Users-table. After that, check the ID of the user row and insert a role having "Admin" as value for "Role" column and your user's id as value for UserId column.

To insert some test data, ``TestDataInsert.sql`` in the misc/sql folder could be used. Once some data has been generated, ``PopulateChannelStatistics`` method in the ``StatisticsService`` should be called. Locally, this can be done by setting the FunctionApp as the startup project, and calling the HTTP triggered function.

UI and the backend need to be started separately.

## Azure implementation

The solution includes a simple deployment YAML which is used for deploying the solution to Azure App service. 

For the app to function in Azure, the following is needed:

- Storage account
  - Should have queues for files to process / daily aggregates. Names for these should be defined in Function App config.
  - Also, a blob container for the log files is needed. This name should also be defined in Function App configuration.
- SQL Server
- Function App
  -  Currently, requires read / write access and table creationg rights (due to EF bulk extensions) in the DB.
- KeyVault with RSA key defined.
- App service.
  -  Read / write access for the DB required.

### Azure function app

The solution includes an Azure Function App consisting of three functions, which are used for updating the IRC row data / statistics. 

**DailyRowAggregator**

HTTP triggered function, that populates the ``TimeGroupedRows`` table. Can be used to init the aggregated data.

**RowAggregator**

Is triggered from the defined queue, app setting ``DailyAggregatesQueueName``. The JSON message is supposed to include channel guid / date from which daily aggregates should be formed, updates the ``TimeGroupedRows`` table.

**RowInserter**

Is triggered from the defined queue, apps setting ``FilesToProcessQueueName``, processes a daily log IRC log file for a channel. The queue is expected to include a message, the content of which points to a log file in blob container, the name of which is defined in appsetting ``LogsContainerName``. With input binding, this blob is then read and processed. As an output, message is added to the queue defined in ``DailyAggregatesQueueName`` app setting.

For uploading the log files, see the Python script in the solution (folder misc/python). The Python script expects the log files to be per channel / day, and is supposed to be used when the day has passed, so that the log files are complete. It's not dynamic, and currently accepts the files in only one format.

**Local development settings**

The solution includes the local.settings.json file with default settings, for queue names / DB connection. These can be overriden using secrets. Using Azurite to simulate the storage account is a good option locally, and the local.settings.json is setup for that.


## TODO
- Improve UI styling / CSS architecture in general, as it is currently a very draft version.
- Redux could be used more to store data, like criterias etc.
- Toast notification system needs to be included in the UI, to handle failing requests etc. etc.
- Backend error handling needs to be improved, on what to show for users etc.
- Use redirect flow for Google login?
- The proxy setup from VS React template is currently not working with the generated APIs


