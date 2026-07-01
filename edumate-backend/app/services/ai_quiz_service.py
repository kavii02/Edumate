import os
import json
import re
import requests
import pdfplumber


def extract_text_from_pdf(pdf_path):
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text.strip()


def clean_json_response(content):
    content = content.strip()
    if content.startswith("```"):
        content = re.sub(r"^```(?:json)?\n", "", content)
        content = re.sub(r"\n```$", "", content)
    return content.strip()


def call_gemini_api(api_key, text, number_of_questions, difficulty):
    models_to_try = ["gemini-2.5-flash", "gemini-1.5-flash"]
    last_err = None
    
    prompt = (
        f"You are an expert educator. Generate a quiz based on the following source text.\n"
        f"Generate exactly {number_of_questions} multiple choice questions.\n"
        f"The difficulty level of the questions must be '{difficulty}'.\n\n"
        f"Source Text:\n{text[:15000]}\n\n"
        f"Output must be a valid JSON object matching the following structure:\n"
        f"{{\n"
        f"  \"title\": \"A concise title for the quiz based on the text contents\",\n"
        f"  \"questions\": [\n"
        f"    {{\n"
        f"      \"question_text\": \"The text of the question\",\n"
        f"      \"option_a\": \"First option\",\n"
        f"      \"option_b\": \"Second option\",\n"
        f"      \"option_c\": \"Third option\",\n"
        f"      \"option_d\": \"Fourth option\",\n"
        f"      \"correct_answer\": \"a\"  # Must be exactly 'a', 'b', 'c', or 'd'\n"
        f"    }}\n"
        f"  ]\n"
        f"}}\n\n"
        f"Ensure option keys and correct_answer match exactly. Do not wrap the JSON output in markdown blocks (e.g. do not use ```json)."
    )

    payload = {
        "contents": [{
            "parts": [{
                "text": prompt
            }]
        }],
        "generationConfig": {
            "responseMimeType": "application/json",
            "temperature": 0.3
        }
    }
    
    headers = {
        "Content-Type": "application/json"
    }

    for model in models_to_try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            content_text = data["candidates"][0]["content"]["parts"][0]["text"]
            content_text = clean_json_response(content_text)
            return json.loads(content_text)
        except Exception as e:
            last_err = e
            print(f"Gemini call with {model} failed: {str(e)}")
            
    raise last_err


def call_openai_api(api_key, text, number_of_questions, difficulty):
    url = "https://api.openai.com/v1/chat/completions"
    
    prompt = (
        f"You are an expert educator. Generate a quiz based on the following source text.\n"
        f"Generate exactly {number_of_questions} multiple choice questions.\n"
        f"The difficulty level of the questions must be '{difficulty}'.\n\n"
        f"Source Text:\n{text[:15000]}\n\n"
        f"Output must be a valid JSON object matching the following structure:\n"
        f"{{\n"
        f"  \"title\": \"A concise title for the quiz based on the text contents\",\n"
        f"  \"questions\": [\n"
        f"    {{\n"
        f"      \"question_text\": \"The text of the question\",\n"
        f"      \"option_a\": \"First option\",\n"
        f"      \"option_b\": \"Second option\",\n"
        f"      \"option_c\": \"Third option\",\n"
        f"      \"option_d\": \"Fourth option\",\n"
        f"      \"correct_answer\": \"a\"  # Must be exactly 'a', 'b', 'c', or 'd'\n"
        f"    }}\n"
        f"  ]\n"
        f"}}\n\n"
        f"Ensure option keys and correct_answer match exactly. Do not wrap the JSON output in markdown blocks (e.g. do not use ```json)."
    )
    
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    if model == "gpt-5.5" or not model:
        model = "gpt-4o-mini"
        
    payload = {
        "model": model,
        "response_format": { "type": "json_object" },
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.3
    }
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    
    response = requests.post(url, json=payload, headers=headers, timeout=30)
    response.raise_for_status()
    
    data = response.json()
    content_text = data["choices"][0]["message"]["content"]
    
    content_text = clean_json_response(content_text)
    return json.loads(content_text)


def normalize_quiz_response(quiz_data, number_of_questions):
    if not isinstance(quiz_data, dict):
        raise ValueError("Invalid AI response: Expected a JSON object.")
        
    title = quiz_data.get("title", "AI Generated Quiz").strip()
    questions = quiz_data.get("questions", [])
    
    if not isinstance(questions, list):
        questions = []
        
    normalized_questions = []
    for q in questions:
        if not isinstance(q, dict):
            continue
            
        question_text = q.get("question_text") or q.get("question") or ""
        question_text = question_text.strip()
        if not question_text:
            continue
            
        option_a = q.get("option_a") or q.get("option_A") or ""
        option_b = q.get("option_b") or q.get("option_B") or ""
        option_c = q.get("option_c") or q.get("option_C") or ""
        option_d = q.get("option_d") or q.get("option_D") or ""
        
        options_list = q.get("options")
        if isinstance(options_list, list) and len(options_list) >= 4:
            option_a = option_a or options_list[0]
            option_b = option_b or options_list[1]
            option_c = option_c or options_list[2]
            option_d = option_d or options_list[3]
            
        option_a = str(option_a).strip()
        option_b = str(option_b).strip()
        option_c = str(option_c).strip()
        option_d = str(option_d).strip()
        
        correct_answer = q.get("correct_answer") or q.get("correctAnswer") or "a"
        correct_answer = str(correct_answer).strip().lower()
        if correct_answer not in {"a", "b", "c", "d"}:
            normalized_correct = "a"
            for letter, val in [("a", option_a), ("b", option_b), ("c", option_c), ("d", option_d)]:
                if correct_answer == val.lower():
                    normalized_correct = letter
                    break
            correct_answer = normalized_correct
            
        normalized_questions.append({
            "question_text": question_text,
            "option_a": option_a,
            "option_b": option_b,
            "option_c": option_c,
            "option_d": option_d,
            "correct_answer": correct_answer
        })
        
    return {
        "title": title,
        "questions": normalized_questions[:number_of_questions]
    }


def generate_quiz_with_ai(lesson_text, number_of_questions=5, difficulty="Medium"):
    # Load API keys from env
    gemini_key = os.getenv("GEMINI_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")
    
    # Check if either key is valid (not None, empty, or placeholder)
    has_gemini = gemini_key and gemini_key.strip() and gemini_key.strip() != "your_api_key_here"
    has_openai = openai_key and openai_key.strip() and openai_key.strip() != "your_api_key_here"
    
    if not has_gemini and not has_openai:
        raise ValueError(
            "API Key Not Configured: Please set GEMINI_API_KEY or OPENAI_API_KEY in the backend `.env` file to use AI quiz generation."
        )
        
    quiz_data = None
    errors = []
    
    if has_gemini:
        try:
            quiz_data = call_gemini_api(gemini_key.strip(), lesson_text, number_of_questions, difficulty)
        except Exception as e:
            errors.append(f"Gemini error: {str(e)}")
            print(f"Gemini API call failed: {str(e)}")
            
    if not quiz_data and has_openai:
        try:
            quiz_data = call_openai_api(openai_key.strip(), lesson_text, number_of_questions, difficulty)
        except Exception as e:
            errors.append(f"OpenAI error: {str(e)}")
            print(f"OpenAI API call failed: {str(e)}")
            
    if not quiz_data:
        raise ValueError(f"AI Generation Failed: {'; '.join(errors)}")
        
    return normalize_quiz_response(quiz_data, number_of_questions)