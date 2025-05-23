# Deploying AlphaXIV-Open to Railway

This document provides instructions for deploying the AlphaXIV-Open project to Railway.

## Project Structure

AlphaXIV-Open consists of three services:

1. **API** - The main FastAPI backend application
2. **LightRAG** - A secondary server handling document indexing and retrieval
3. **Frontend** - A Next.js web application

## Prerequisites

Before deploying to Railway, you'll need:

1. A Railway account
2. Google API key for Gemini
3. OpenAI API key for embeddings

## Deployment Steps

### 1. Set Up Railway Project

1. Create a new project in Railway
2. Link your GitHub repository
3. Configure the following environment variables:
   - `GOOGLE_API_KEY` - Your Google API key for Gemini
   - `OPENAI_API_KEY` - Your OpenAI API key for embeddings

### 2. Configure Multi-Service Deployment

Railway will automatically detect the `railway.toml` file in your repository, which defines the three services and their configurations.

The services are configured as follows:

#### LightRAG Service

- Uses `Dockerfile.lightrag`
- Exposes port 9721
- Mounts a persistent volume for data storage
- Requires the OpenAI API key for embeddings

#### API Service

- Uses `Dockerfile.api`
- Exposes port 8000
- Connects to the LightRAG service
- Requires both Google API key and OpenAI API key
- Mounts the same persistent volume as LightRAG

#### Frontend Service

- Uses `Dockerfile.frontend`
- Exposes port 3000
- Connects to the API service

### 3. Deploy the Services

1. Push your changes to GitHub
2. Railway will automatically build and deploy the services
3. The services will be deployed in the correct order (LightRAG → API → Frontend)

### 4. Access Your Application

Once deployed, you can access your application using the URL provided by Railway for the frontend service.

## Local Testing

To test the application locally before deploying to Railway:

1. Create a `.env` file from the `.env.example` file:
   ```
   cp .env.example .env
   ```

2. Add your API keys to the `.env` file:
   ```
   GOOGLE_API_KEY=your_google_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. Build and run the services using Docker Compose:
   ```
   docker-compose build
   docker-compose up
   ```

4. Access the application at http://localhost:3000

## Troubleshooting

### Data Persistence

The application uses a shared volume for data persistence. If you need to reset the data:

1. Go to the Railway dashboard
2. Navigate to the Volumes section
3. Delete the volume and redeploy the services

### Service Connectivity

If the services are not connecting properly:

1. Check the environment variables in Railway
2. Verify that the services are running (check the logs)
3. Ensure that the ports are correctly exposed

### API Keys

If you're getting authentication errors:

1. Verify that your API keys are correctly set in Railway
2. Check the logs for any authentication errors
3. Regenerate your API keys if necessary
