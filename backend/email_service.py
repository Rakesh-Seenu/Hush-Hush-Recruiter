import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from .database import get_candidate_email


def connect_to_database():
    raise NotImplementedError('Use backend.database helpers instead.')


def configure_email():
    sender_email = os.getenv('DOODLE_EMAIL_SENDER', 'no.reply.doodlerecruiter@gmail.com')
    sender_password = os.getenv('DOODLE_EMAIL_PASSWORD', '')
    smtp_server = 'smtp.gmail.com'
    smtp_port = 587
    return sender_email, sender_password, smtp_server, smtp_port


def send_email(sender_email, sender_password, smtp_server, smtp_port, recipient_email):
    try:
        if not sender_password:
            raise ValueError('Missing DOODLE_EMAIL_PASSWORD environment variable.')

        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(sender_email, sender_password)

        message = MIMEMultipart()
        message['From'] = sender_email
        message['To'] = recipient_email
        message['Subject'] = 'Job Opportunity at Doodle'

        html = '''
        <html>
          <body>
            <p>Dear Sir,
               <p><br>My name is Alexa, your friendly automated interview scheduling agent for Doodle. I am here to assist you with your application and ensure a seamless and positive experience for you.<br>We are excited to inform you about a job opportunity at Doodle.You have been shortlisted for the Python Developer role.
               We would like to you to go through a 30 minutes coding round.Please note that this is not the final list of interviewer/s.<br>
               <br>Click on the below link to go ahead with the exam. <br>
               <a href="https://hiring-process-1.vercel.app/">Doodle!</a>
               <br>We are thrilled with the possibility of you joining our family and hope to hear back within 24 hours! Best of luck and thank you for your continued interest in Joining Doodle.<br>
               <br>Best Regards,<br>
               <a>Doodle INC<a>
            </p>
          </body>
        </html>
        '''

        message.attach(MIMEText(html, 'html'))
        server.sendmail(sender_email, recipient_email, message.as_string())
        server.quit()
        return True
    except (smtplib.SMTPException, ValueError) as smtp_error:
        print(f'Error while sending email to {recipient_email}:', smtp_error)
        return False


def send_email_to_username(username):
    recipient_email = get_candidate_email(username)

    if not recipient_email:
        return {
            'success': False,
            'message': f'No candidate email found for username {username}.',
            'error_type': 'candidate_not_found',
            'username': username,
        }

    sender_email, sender_password, smtp_server, smtp_port = configure_email()
    sent = send_email(sender_email, sender_password, smtp_server, smtp_port, recipient_email)

    if sent:
        return {
            'success': True,
            'message': f'Email sent to {username}.',
            'username': username,
            'email': recipient_email,
        }

    return {
        'success': False,
        'message': f'Email could not be sent to {username}.',
        'error_type': 'send_failed',
        'username': username,
        'email': recipient_email,
    }


def send_emails_to_all_candidates(usernames):
    sender_email, sender_password, smtp_server, smtp_port = configure_email()

    from .database import connect_to_database as _connect_to_database
    conn = _connect_to_database()
    if conn is None:
        print('Failed to connect to the database.')
        return

    try:
        cursor = conn.cursor()
        cursor.execute(
            'SELECT email FROM SelectedCandidate WHERE username IN ({})'.format(','.join('?' * len(usernames))),
            usernames,
        )
        emails = {row[0] for row in cursor.fetchall()}

        if emails:
            for email in emails:
                send_email(sender_email, sender_password, smtp_server, smtp_port, email)
        else:
            print('No candidate emails found.')
    finally:
        conn.close()


usernames = ['RakeshHadneSreenath', 'Pavan', 'Ashwith']
