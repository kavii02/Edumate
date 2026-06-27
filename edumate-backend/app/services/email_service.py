from flask_mail import Message
from app import mail


def send_verification_email(receiver_email, verification_code):
    msg = Message(
        subject="EduMate Admin Verification Code",
        recipients=[receiver_email],
    )

    msg.body = f"""
Hello Admin,

Your EduMate verification code is:

{verification_code}

This code will expire in 10 minutes.

If you did not request this login, please ignore this email.

EduMate Team
"""

    mail.send(msg)