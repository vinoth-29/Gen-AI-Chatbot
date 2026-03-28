# GenAI RAG Chatbot
A full-stack Retrieval-Augmented Generation (RAG) chatbot that enables users to upload PDF documents and query them in real-time using a local LLM.

## Features

Upload and query PDF documents in real-time using PyPDFLoader
Generate text embeddings with sentence-transformers and FAISS for fast semantic search
Produce contextual answers using a local LLM powered by Ollama
Complete end-to-end pipeline: document ingestion → chunking → embedding → retrieval → question answering


## Tech Stack

Frontend: React, Node.js
Backend: Python, FastAPI
Machine Learning / NLP: LangChain, FAISS, sentence-transformers, Ollama (local LLM)
Document Processing: PyPDFLoader for PDF ingestion
Data Storage: .faiss and .pkl files for vector database and embeddings


## Getting Started
### Frontend (React)

npm install
npm start

### Backend (FastAPI / Python)

Create and activate a virtual environment:
• python -m venv venv
• source venv/bin/activate — Linux / Mac
• venv\Scripts\activate — Windows
Install Python dependencies:
• pip install -r requirements.txt
Start the FastAPI backend server:
• uvicorn backend:app --reload
• The backend will run at http://127.0.0.1:8000 by default


## Project Structure
### Frontend Files

App.js — Main React application component
App.css — Application-level styles
App.test.js — Unit tests for the App component
index.js — React entry point
index.css — Global CSS styles
package.json — Node.js dependencies and scripts
package-lock.json — Locked dependency versions

### Backend Files

backend.py — FastAPI server, exposes API endpoints for the frontend
create_vector_db.py — Builds the FAISS vector database from processed documents
ingest.py — Handles PDF loading and text chunking using PyPDFLoader
rag_pipeline.py — Core RAG logic: retrieval, context assembly, and LLM querying
index.faiss — Persisted FAISS vector index for semantic search
index.pkl — Serialized embeddings and metadata store
