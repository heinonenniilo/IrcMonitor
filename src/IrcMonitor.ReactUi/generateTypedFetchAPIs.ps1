$ApiFolder = "src/api"
if (Test-Path $ApiFolder) {
    Remove-Item $ApiFolder -Recurse 
}

Invoke-WebRequest https://localhost:5001/swagger/v1/swagger.json -O swagger.json
npx @openapitools/openapi-generator-cli generate -i swagger.json --global-property skipFormModel=false -g typescript-fetch -o .\src\api

#git checkout src/api/runtime.ts
Remove-Item swagger.json 