#!/bin/bash

# Parse command line arguments
INSTALL_MINIRAG=false

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --with-minirag) INSTALL_MINIRAG=true ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install MiniRAG if requested
if [ "$INSTALL_MINIRAG" = true ]; then
    echo "Installing MiniRAG..."
    pip install lightrag-hku[api]
    echo "MiniRAG installed."
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created .env file from .env.example. Please edit it to add your API keys."
fi

# Create necessary directories
mkdir -p data/papers
mkdir -p data/index
mkdir -p data/storage

echo "Setup complete."
echo ""

if [ "$INSTALL_MINIRAG" = true ]; then
    echo "To start the MiniRAG server with OpenAI embeddings, run:"
    echo "python start_minirag.py"
    echo ""
    echo "This script will read configuration from your .env file and start the MiniRAG server with the correct settings."
    echo ""
    echo "Alternatively, you can start the server manually:"
    echo "lightrag-server --working-dir ./data/storage --chunk-size 1000 --chunk-overlap-size 200 --embedding-dim 1536 --cosine-threshold 0.4 --top-k 5 --embedding-binding openai --embedding-model text-embedding-3-small"
    echo ""
    echo "Make sure to set your OpenAI API key in the .env file or pass it directly:"
    echo "lightrag-server --working-dir ./data/storage --chunk-size 1000 --chunk-overlap-size 200 --embedding-dim 1536 --cosine-threshold 0.4 --top-k 5 --embedding-binding openai --embedding-model text-embedding-3-small --openai-api-key your_openai_api_key_here"
    echo ""
    echo "Then, in a separate terminal, run the application with:"
    echo "python run.py"
else
    echo "You can now run the application with:"
    echo "python run.py"
    echo ""
    echo "Note: For full functionality, you can install MiniRAG later with:"
    echo "./setup.sh --with-minirag"
fi
