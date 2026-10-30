import os
from langchain_community.document_loaders import PyPDFLoader, DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
import pypdf

# Get the directory of the current script
SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))

# Create absolute paths for data and vectorstore
DATA_PATH = os.path.join(SCRIPT_DIR, 'data')
VECTORSTORE_PATH = os.path.join(SCRIPT_DIR, 'vectorstore', 'db_faiss')

#step1:

pypdf.constants.DECOMPRESSION_LIMIT = 2 * 1024**3 

# Load PDF files
def load_pdf_files(data_path):
    loader = DirectoryLoader(data_path,
                             glob='*.pdf',
                             loader_cls=PyPDFLoader)
    
    documents = loader.load()
    return documents

#step2:

def create_chunks(extracted_data):
    text_splitter=RecursiveCharacterTextSplitter(chunk_size=500,
                                                 chunk_overlap=50)
    text_chunks=text_splitter.split_documents(extracted_data)
    return text_chunks

#step3:

def get_embedding_model():
    embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    return embedding_model

# Create vector store
def create_vector_db(text_chunks, embeddings):
    db = FAISS.from_documents(text_chunks, embeddings)
    db.save_local(VECTORSTORE_PATH)
    print("Vector store created successfully.")

if __name__ == '__main__':
    print("Loading PDF documents...")
    documents = load_pdf_files(data_path=DATA_PATH)
    
    if not documents:
        print("No PDF documents found in the data directory. Please add your PDF files to the 'data' folder.")
    else:
        print(f"Loaded {len(documents)} documents.")
        print("Creating text chunks...")
        text_chunks = create_chunks(documents)
        print(f"Created {len(text_chunks)} text chunks.")
        
        print("Creating embeddings...")
        embeddings = get_embedding_model()
        
        print("Creating vector store...")
        create_vector_db(text_chunks, embeddings)