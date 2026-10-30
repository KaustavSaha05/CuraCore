import os
from dotenv import load_dotenv
from langchain_classic.chains import RetrievalQA
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.embeddings import HuggingFaceEmbeddings
import google.generativeai as genai
import base64
from PIL import Image
import io

# Load environment variables
load_dotenv()

# Get the directory of the current script
SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))

# Create absolute paths for vectorstore
VECTORSTORE_PATH = os.path.join(SCRIPT_DIR, 'vectorstore', 'db_faiss')

# Custom prompt template
CUSTOM_PROMPT_TEMPLATE = """
Use the pieces of information provided in the context to answer user's question.
If you dont know the answer, just say that you dont know, dont try to make up an answer.
Dont provide anything out of the given context.

Context: {context}
Question: {question}

Start the answer directly. No small talk please.
"""

def get_qa_chain():
    """Initializes and returns the RetrievalQA chain."""
    try:
        # Load the vector store
        embeddings = HuggingFaceEmbeddings(model_name='sentence-transformers/all-MiniLM-L6-v2')
        db = FAISS.load_local(VECTORSTORE_PATH, embeddings, allow_dangerous_deserialization=True)
        
        # Create a retriever
        retriever = db.as_retriever(search_kwargs={'k': 4})
        
        # Initialize the LLM
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY not found in environment variables.")
        llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.3, google_api_key=api_key)
        
        # Create the prompt
        prompt = PromptTemplate(template=CUSTOM_PROMPT_TEMPLATE, input_variables=['context', 'question'])
        
        # Create the QA chain
        qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type='stuff',
            retriever=retriever,
            return_source_documents=True,
            chain_type_kwargs={'prompt': prompt}
        )
        return qa_chain
    except Exception as e:
        print(f"Error initializing QA chain: {e}")
        return None

def process_llm_response(llm_response):
    """Processes the response from the LLM."""
    response = {
        "result": llm_response['result'],
        "source_documents": [doc.metadata for doc in llm_response['source_documents']]
    }
    return response

def analyze_report_text(report_text=None, image_data=None):
    """Sends the report text or image to Gemini for analysis."""
    try:
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY not found in environment variables.")
        
        # Configure genai for image analysis if image is provided
        if image_data:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-2.5-flash')
            
            # Decode base64 image
            image_bytes = base64.b64decode(image_data.split(',')[1] if ',' in image_data else image_data)
            image = Image.open(io.BytesIO(image_bytes))
            
            prompt = """Please analyze this medical report image and explain it in simple, easy-to-understand terms for a non-medical person. 
            Focus on key findings and suggest general, non-prescriptive next steps.
            
            Provide a clear, structured explanation of what the report shows."""
            
            response = model.generate_content([prompt, image])
            return response.text
        else:
            # Text-based analysis using LangChain
            llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.3, google_api_key=api_key)
            
            prompt = f"""Please explain the following medical report in simple, easy-to-understand terms for a non-medical person. 
            Focus on key findings and suggest general, non-prescriptive next steps.

            Report:
            "{report_text}"
            """
            
            response = llm.invoke(prompt)
            return response.content
    except Exception as e:
        print(f"Error analyzing report with Gemini: {e}")
        return "Sorry, there was an error analyzing the report. Please try again."

# Example usage (for testing)
if __name__ == '__main__':
    chain = get_qa_chain()
    if chain:
        question = "What is the treatment for acls?"
        llm_response = chain.invoke(question)
        if llm_response:
            processed_response = process_llm_response(llm_response)
            print(processed_response)
