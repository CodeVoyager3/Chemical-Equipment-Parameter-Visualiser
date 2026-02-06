import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class APIClient:
    def __init__(self):
        self.base_url = os.getenv("API_URL", "http://127.0.0.1:8000")
        # Ensure no trailing slash for cleaner concatenation
        if self.base_url.endswith("/"):
            self.base_url = self.base_url[:-1]

    def upload_csv(self, file_path):
        """
        Uploads a CSV file to the /api/upload/ endpoint.
        Returns the JSON response containing statistics.
        """
        upload_url = f"{self.base_url}/api/upload/"
        
        try:
            with open(file_path, 'rb') as f:
                files = {'file': (os.path.basename(file_path), f, 'text/csv')}
                response = requests.post(upload_url, files=files)
                
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.RequestException as e:
            print(f"API Request Error: {e}")
            raise e
        except Exception as e:
            print(f"General Error: {e}")
            raise e
