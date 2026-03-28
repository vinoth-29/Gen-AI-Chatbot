import os
import shutil
import tempfile

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_ollama import OllamaLLM

app = FastAPI()

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Shared embeddings & LLM (loaded once at startup) ─────────────────────────
from langchain_ollama import OllamaEmbeddings
embeddings = OllamaEmbeddings(model="nomic-embed-text")

llm = OllamaLLM(model="llama3.2:1b", temperature=0.5)

prompt = ChatPromptTemplate.from_template("""
You are a helpful assistant. Use the context below to answer the question.
The context may contain partial information — use all of it to form the best possible answer.
Do not say you lack information unless the context is completely unrelated to the question.

Context: {context}

Question: {question}

Answer:
""")

# ── In-memory state ───────────────────────────────────────────────────────────
# Holds the active retriever built from the most recently uploaded PDF.
_state: dict = {"retriever": None, "filename": None}


def _build_chain(retriever):
    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)

    return (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )


# ── /upload ───────────────────────────────────────────────────────────────────
@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    """
    Accept a PDF upload, parse it, chunk it, embed it into an in-memory
    FAISS vector store, and store the retriever for use in /ask.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    # Save upload to a temp file so PyPDFLoader can read it
    tmp_dir = tempfile.mkdtemp()
    tmp_path = os.path.join(tmp_dir, file.filename)

    try:
        contents = await file.read()
        with open(tmp_path, "wb") as f:
            f.write(contents)

        # Load & split
        loader = PyPDFLoader(tmp_path)
        documents = loader.load()

        if not documents:
            raise HTTPException(status_code=422, detail="Could not extract text from the PDF.")

        splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
        chunks = splitter.split_documents(documents)

        # Build in-memory vector store
        vectorstore = FAISS.from_documents(chunks, embeddings)
        retriever = vectorstore.as_retriever(
            search_type="similarity",
            search_kwargs={"k": 6}
        )

        # Store in shared state
        _state["retriever"] = retriever
        _state["filename"] = file.filename

        return {
            "message": "PDF processed successfully.",
            "filename": file.filename,
            "pages": len(documents),
            "chunks": len(chunks),
        }

    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)


# ── /ask ──────────────────────────────────────────────────────────────────────
class Question(BaseModel):
    query: str


@app.post("/ask")
def ask_question(q: Question):
    if _state["retriever"] is None:
        raise HTTPException(
            status_code=400,
            detail="No document loaded. Please upload a PDF first."
        )

    chain = _build_chain(_state["retriever"])
    result = chain.invoke(q.query)
    return {"answer": result, "source_file": _state["filename"]}


# ── /status ───────────────────────────────────────────────────────────────────
@app.get("/status")
def status():
    return {
        "ready": _state["retriever"] is not None,
        "filename": _state["filename"],
    }


