import pdfplumber
import random
import re


def extract_text_from_pdf(pdf_path):
    text = ""

    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"

    return text.strip()


def clean_text(text):
    text = re.sub(r"\s+", " ", text)
    return text


def generate_mcqs_from_text(text, number_of_questions=5):
    text = clean_text(text)

    sentences = re.split(r"(?<=[.!?]) +", text)
    sentences = [s.strip() for s in sentences if len(s.split()) > 8]

    questions = []

    for sentence in sentences[:number_of_questions * 3]:
        words = sentence.split()

        important_words = [
            word.strip(".,()")
            for word in words
            if len(word) > 5 and word[0].isupper()
        ]

        if not important_words:
            continue

        answer = important_words[0]
        question_text = sentence.replace(answer, "__________", 1)

        options = [answer, "None of the above", "All of the above", "Not mentioned"]
        random.shuffle(options)

        correct_idx = options.index(answer)
        correct_letter = "abcd"[correct_idx]

        questions.append({
            "question_text": question_text,
            "option_a": options[0],
            "option_b": options[1],
            "option_c": options[2],
            "option_d": options[3],
            "correct_answer": correct_letter
        })

        if len(questions) == number_of_questions:
            break

    return questions


def generate_quiz_with_ai(lesson_text, number_of_questions=5, difficulty="Medium"):
    questions = generate_mcqs_from_text(lesson_text, number_of_questions)
    
    # Try to extract a title from the first non-empty line of the text
    title = "AI Generated Quiz"
    if lesson_text:
        lines = [line.strip() for line in lesson_text.split('\n') if line.strip()]
        if lines:
            first_line = lines[0]
            if len(first_line) > 5 and len(first_line) < 80:
                title = f"Quiz: {first_line}"
            elif len(lines) > 1:
                second_line = lines[1]
                if len(second_line) > 5 and len(second_line) < 80:
                    title = f"Quiz: {second_line}"
                    
    return {
        "title": title,
        "questions": questions
    }