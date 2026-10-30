from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Import the functions from chatbot.py
from chatbot import get_qa_chain, process_llm_response, analyze_report_text

# Get the directory of the current script and path to .env
SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))
DOTENV_PATH = os.path.join(SCRIPT_DIR, '.env')
load_dotenv(dotenv_path=DOTENV_PATH)

app = Flask(__name__)

# Configure CORS to allow requests from your frontend
CORS(app, resources={
    r"/chat": {"origins": ["http://localhost:5173", "https://localhost:5173", "http://localhost:5174", "https://localhost:5174"], "supports_credentials": True},
    r"/analyze-report": {"origins": ["http://localhost:5173", "https://localhost:5173", "http://localhost:5174", "https://localhost:5174"], "supports_credentials": True}
})

# Initialize the QA chain once when the app starts
qa_chain = get_qa_chain()

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get('message')

    if not user_message:
        return jsonify({'error': 'No message provided'}), 400

    if not qa_chain:
        return jsonify({'error': 'QA chain not initialized.'}), 500

    try:
        # Get the response from the chatbot
        llm_response = qa_chain.invoke(user_message)
        bot_response = process_llm_response(llm_response)
        return jsonify(bot_response)
    except Exception as e:
        print(f"Error processing chat request: {e}")
        return jsonify({'error': 'An internal error occurred.'}), 500

@app.route('/analyze-report', methods=['POST'])
def analyze_report_endpoint():
    data = request.get_json()
    report_text = data.get('reportText')
    image_data = data.get('imageData')

    if not report_text and not image_data:
        return jsonify({'error': 'No report text or image provided'}), 400

    try:
        analysis_result = analyze_report_text(report_text=report_text, image_data=image_data)
        return jsonify({'analysis': analysis_result})
    except Exception as e:
        print(f"Error processing report analysis request: {e}")
        return jsonify({'error': 'An internal error occurred.'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, port=port)
