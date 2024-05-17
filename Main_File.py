import os 
import json

file_path = os.path.dirname(os.path.abspath(__file__))
from Database import DataBaseSqlite

#from API_data_fetch import fetch_data
#from Selection_Final_file import excel_file_path
from Database import insert_values
from EmailSending import usernames

from EmailSending import send_emails_to_all_candidates

def execute():
    #fetch_data()
    #excel_file_path()
    insert_values()
    send_emails_to_all_candidates(usernames)

execute()
