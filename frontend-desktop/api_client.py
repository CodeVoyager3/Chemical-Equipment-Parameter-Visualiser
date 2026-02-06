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
        
        # Credentials storage
        self._username = None
        self._password = None
    
    def set_credentials(self, username, password):
        """Store credentials for authenticated requests."""
        self._username = username
        self._password = password
    
    def clear_credentials(self):
        """Clear stored credentials."""
        self._username = None
        self._password = None
    
    def get_auth(self):
        """Get auth tuple if credentials are set."""
        if self._username and self._password:
            return (self._username, self._password)
        return None
    
    def test_auth(self):
        """
        Test if the stored credentials are valid.
        Returns True if authentication succeeds, False otherwise.
        """
        try:
            # Try to access the upload endpoint with OPTIONS or a simple GET
            # For now, we'll do a HEAD request or just verify we don't get 401
            test_url = f"{self.base_url}/api/upload/"
            response = requests.options(test_url, auth=self.get_auth(), timeout=10)
            # If we get anything other than 401, credentials are likely valid
            return response.status_code != 401
        except requests.exceptions.RequestException:
            # If we can't connect, assume it's a network issue, not auth
            return True  # Let the actual upload reveal the real error

    def upload_csv(self, file_path):
        """
        Uploads a CSV file to the /api/upload/ endpoint.
        Returns the JSON response containing statistics.
        """
        upload_url = f"{self.base_url}/api/upload/"
        
        try:
            with open(file_path, 'rb') as f:
                files = {'file': (os.path.basename(file_path), f, 'text/csv')}
                response = requests.post(upload_url, files=files, auth=self.get_auth())
                
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.RequestException as e:
            print(f"API Request Error: {e}")
            raise e
        except Exception as e:
            print(f"General Error: {e}")
            raise e

