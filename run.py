import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get host and port from environment variables or use defaults
host = os.getenv("HOST", "0.0.0.0")
port = int(os.getenv("PORT", "8000"))

if __name__ == "__main__":
    print(f"Starting AlphaXIV API server at http://{host}:{port}")
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
