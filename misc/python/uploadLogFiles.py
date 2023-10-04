import os
import base64
from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient
from datetime import datetime, timedelta
from azure.storage.queue import QueueClient
from azure.identity import ClientSecretCredential


def list_files(directory_path, date_string):
    """List all files containing the given date string in the specified directory."""
    return [filename for filename in os.listdir(directory_path) if date_string in filename]

def upload_to_azure(files, directory_path, blob_service_client, container_name):
    """Upload files to Azure Blob Storage."""
    for file in files:
        blob_client = blob_service_client.get_blob_client(container=container_name, blob=file)
        with open(os.path.join(directory_path, file), "rb") as data:
            blob_client.upload_blob(data, overwrite=True)
        print(f"Uploaded {file} to {container_name} container.") 
        # Save to queue so that the processing starts
        encoded_message = base64.b64encode(file.encode()).decode()
        queue_client.send_message(encoded_message)

        print(f"{file} added to {queue_name} queue.")

try:

    # Storage account
    directory_path =  os.getenv("logfiles_directory")
    container_name = os.getenv("azure_blob_container_name")
    queue_name = os.getenv("azure_queue_name")
    account_name = os.getenv("azure_storage_account_name") 
    # Credentials 
    client_id = os.getenv("azure_client_id")
    client_secret = os.getenv("azure_client_secret")
    tenant_id = os.getenv("azure_tenant_id")     


    credential = ClientSecretCredential(tenant_id=tenant_id, client_id=client_id, client_secret=client_secret)

     # Get yesterday's date
    yesterday = datetime.now() - timedelta(days=1)
    yesterday_str = yesterday.strftime('%Y-%m-%d')

    files = list_files(directory_path, yesterday_str)

    print(f"Files in {directory_path} from {yesterday_str}:")
    for file in files:
        print(file)

    # Clients
    blob_service_client = BlobServiceClient(account_url=f"https://{account_name}.blob.core.windows.net", credential=credential)
    queue_client = QueueClient(account_url=f"https://{account_name}.queue.core.windows.net", queue_name=queue_name, credential=credential)

    print(f"Start uploading to Azure blob storage, to container {container_name}. Timestamp: {datetime.now()}")
    upload_to_azure(files, directory_path, blob_service_client, container_name)
    print(f"Total of {len(files)} files uploaded. Timestamp: {datetime.now()}")

except Exception as ex:
    print('Exception:')
    print(ex)