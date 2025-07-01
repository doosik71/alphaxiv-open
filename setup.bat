@echo off
setlocal EnableDelayedExpansion

REM Parse command line arguments
set INSTALL_MINIRAG=false

:parse_args
if "%~1"=="" goto end_parse_args
if "%~1"=="--with-minirag" (
    set INSTALL_MINIRAG=true
) else (
    echo Unknown parameter: %~1
    exit /b 1
)
shift
goto parse_args

:end_parse_args

REM Create virtual environment if not exists
if not exist venv (
    echo venv directory not found. Creating virtual environment using uv...
    uv venv venv
    if errorlevel 1 (
        echo Failed to create virtual environment using uv.
        exit /b 1
    )
) else (
    echo venv already exists.
)

REM Activate virtual environment
call venv\Scripts\activate

REM Install dependencies
uv pip install -r requirements.txt

REM Install MiniRAG if requested
if "%INSTALL_MINIRAG%"=="true" (
    echo Installing MiniRAG...
    pip install lightrag-hku[api]
    echo MiniRAG installed.
)

REM Create .env file if it doesn't exist
if not exist .env (
    copy .env.example .env
    echo Created .env file from .env.example. Please edit it to add your API keys.
)

REM Create necessary directories
if not exist data\papers mkdir data\papers
if not exist data\index mkdir data\index
if not exist data\storage mkdir data\storage

echo Setup complete.
echo.

if "%INSTALL_MINIRAG%"=="true" (
    echo To start the MiniRAG server with OpenAI embeddings, run:
    echo python start_minirag.py
    echo.
    echo This script will read configuration from your .env file and start the MiniRAG server with the correct settings.
    echo.
    echo Alternatively, you can start the server manually:
    echo lightrag-server --working-dir ./data/storage --chunk-size 1000 --chunk-overlap-size 200 --embedding-dim 1536 --cosine-threshold 0.4 --top-k 5 --embedding-binding openai --embedding-model text-embedding-3-small
    echo.
    echo Make sure to set your OpenAI API key in the .env file or pass it directly:
    echo lightrag-server --working-dir ./data/storage --chunk-size 1000 --chunk-overlap-size 200 --embedding-dim 1536 --cosine-threshold 0.4 --top-k 5 --embedding-binding openai --embedding-model text-embedding-3-small --openai-api-key your_openai_api_key_here
    echo.
    echo Then, in a separate terminal, run the application with:
    echo python run.py
) else (
    echo You can now run the application with:
    echo python run.py
    echo.
    echo Note: For full functionality, you can install MiniRAG later with:
    echo setup.bat --with-minirag
)

endlocal
