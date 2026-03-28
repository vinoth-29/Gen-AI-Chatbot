from langchain_community.vectorstores import FAISS
from langchain_huggingface import  HuggingFaceEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_ollama import OllamaLLM


# Load embeddings
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# Load vector database
db = FAISS.load_local(
    "vector_db",
    embeddings,
    allow_dangerous_deserialization=True
)

# Create retriever
retriever = db.as_retriever(search_kwargs={"k": 3})

# Load LLM
llm = OllamaLLM(
    model="llama3.2:1b",  # your installed local model
    temperature=0.5,
)
# Create prompt
prompt = ChatPromptTemplate.from_template("""
Answer the question based only on the context below.

Context: {context}

Question: {question}
""")

# Format retrieved docs
def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

# Build LCEL chain
qa_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

# Ask question
query = input("Ask your question: ")
answer = qa_chain.invoke(query)

print("\nAnswer:\n", answer)