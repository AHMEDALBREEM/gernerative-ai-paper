from flask import Flask, request, jsonify # type: ignore
import google.generativeai as genai # type: ignore
from flask_cors import CORS # type: ignore

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing (CORS) for the app

# Set your Google Generative AI API key from environment variable
genai.configure(api_key="AIzaSyCuDCSY76XO6rl64NCuACOamfD9Sn4aGY0")
model = genai.GenerativeModel(model_name="gemini-pro")

# Configure logging

@app.route("/chat", methods=["POST"])
def chat():
    # Get the user prompt from the request
    try:
        data = request.get_json()
        if not data or "prompt" not in data:
            return jsonify({"error": "Invalid request, 'prompt' is required"}), 400
        
        prompt = data["prompt"]
        if not prompt.strip():
            return jsonify({"error": "No prompt provided"}), 400

        # Call Google's Generative AI API to get a response
        response = model.generate_content(prompt)
        
        # Extract the response text
        response_text = response.text.strip()

        # Return the plain response text to the client
        return jsonify({"response": response_text})
    
    except genai.GenerativeAIError as e:
        # Handle Generative AI API errors
        return jsonify({"error": str(e)}), 500

    except Exception as e:
        # Handle unexpected errors
        return jsonify({"error": "An unexpected error occurred"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
