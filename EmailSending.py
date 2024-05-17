import sqlite3
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from Database import DataBaseSqlite

def connect_to_database():
    try:
        file_path = os.path.dirname(os.path.abspath(__file__))
        conn = sqlite3.connect(file_path + '/Database.db')
        return conn
    except sqlite3.Error as error:
        print("Error while connecting to SQLite database:", error)
        return None

def retrieve_candidate_emails(cursor,usernames):
    try:
        #cursor.execute("SELECT email FROM SelectedCandidate") #sending mails all candidates 

        cursor.execute("SELECT email FROM SelectedCandidate WHERE username IN ({})".format(','.join('?' * len(usernames))), usernames)

        emails = set([row[0] for row in cursor.fetchall()])
        #print(emails)
        return emails
    except sqlite3.Error as error:
        print("Error while retrieving candidate emails:", error)
        return set()

def configure_email():
    sender_email = 'no.reply.doodlerecruiter@gmail.com'
    sender_password = 'usjz byra zkqr lxnf'
    smtp_server = 'smtp.gmail.com'
    smtp_port = 587
    return sender_email, sender_password, smtp_server, smtp_port

def send_email(sender_email, sender_password, smtp_server, smtp_port, recipient_email):
    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(sender_email, sender_password)

        message = MIMEMultipart()
        message['From'] = sender_email
        message['To'] = recipient_email
        message['Subject'] = 'Job Opportunity at Doodle'
        
        html = """
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
        """

        
        a = MIMEText(html, "html")
        message.attach(a)

        server.sendmail(sender_email, recipient_email, message.as_string())
        server.quit()
        # print(f"Email sent successfully to {recipient_email}")

    except smtplib.SMTPException as smtp_error:
        print(f"Error while sending email to {recipient_email}:", smtp_error)


def send_emails_to_all_candidates(usernames):

    conn = connect_to_database()
    if conn is not None:
        try:
            cursor = conn.cursor()

            emails = retrieve_candidate_emails(cursor,usernames)
            #print(emails)

            sender_email, sender_password, smtp_server, smtp_port = configure_email()

            
            if emails:
               
                for email in emails:
                    send_email(sender_email, sender_password, smtp_server, smtp_port, email)
                #print("All emails sent successfully!")
            else:
                print("No candidate emails found.")

        finally:
            conn.close()
    else:
        print("Failed to connect to the database.")


usernames = ['RakeshHadneSreenath','Pavan','Ashwith'] #Sending emails to particular user to check the whole pipeline  

#send_emails_to_all_candidates() #sending mails all canditates