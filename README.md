GenAI RAG Chatbot

A full-stack Retrieval-Augmented Generation (RAG) chatbot that allows users to upload PDF documents and query them in real-time using a local LLM. Built with React frontend and Python/FastAPI backend.

Features
Upload and query PDF documents in real-time using PyPDFLoader
Text embeddings with sentence-transformers and FAISS for fast semantic search
Generates contextual answers using a local LLM (Ollama)
Complete pipeline: document ingestion → chunking → embedding → retrieval → question answering
Tech Stack
Frontend: React, Node.js
Backend: Python, FastAPI
Machine Learning / NLP: LangChain, FAISS, sentence-transformers, local LLM (Ollama)
Document Processing: PyPDFLoader for PDF ingestion
Data storage: .faiss and .pkl files for vector database and embeddings
Getting Started
Frontend (React)
npm install
npm start
Backend (FastAPI / Python)
Create a virtual environment:
python -m venv venv
source venv/bin/activate   # 
venv\Scripts\activate      # Windows
Install Python dependencies:
pip install -r requirements.txt
Start the FastAPI backend server using uvicorn:
uvicorn backend:app --reload
The backend will run at: http://127.0.0.1:8000 by default
Project Structure
├─ App.js
├─ App.css
├─ App.test.js
├─ index.js
├─ index.css
├─ backend.py
├─ create_vector_db.py
├─ ingest.py
├─ rag_pipeline.py
├─ package.json
├─ package-lock.json
├─ index.faiss
├─ index.pkl
