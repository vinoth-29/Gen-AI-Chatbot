from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter  # singular now

# Load PDF
loader = PyPDFLoader("D:\\Gen AI-Chatbot\\Data\\AI-Research.pdf")
documents = loader.load()
print("Number of pages:", len(documents))

# Split into chunks
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=100
)

chunks = text_splitter.split_documents(documents)

print("Total chunks created:", len(chunks))
print("Example chunk:")
print(chunks[0].page_content)