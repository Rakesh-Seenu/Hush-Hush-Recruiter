import sqlite3
import os 
from Selection_Final_file import df1
#from Selection_Final_file import excel_file_path
file_path = os.path.dirname(os.path.abspath(__file__))

class DataBaseSqlite:
    def __init__(self) -> None:
        self.con = sqlite3.connect(file_path + '/Database.db')
        self.cursor = self.con.cursor()
        self.create_table_selected_candidate()

    def create_table_selected_candidate(self):
        sqlite_create_table_query = '''CREATE TABLE IF NOT EXISTS SelectedCandidate (id INTEGER PRIMARY KEY ,cluster INT, username TEXT,email TEXT ,followers INTEGER,type TEXT,number_of_repos INTEGER,achievements INTEGER,languages TEXT);'''
        try:
            self.cursor.execute(sqlite_create_table_query)
        except:
            print('Error table not created')
        else:
            self.con.commit()
            
            self.cursor.close()



    def insertValues_into_selected_candidate(self,values):
        
        self.cursor = self.con.cursor()
        sql = '''INSERT INTO SelectedCandidate (username, email, followers, cluster,number_of_repos, achievements,languages)
             VALUES (?, ?, ?, ?, ?, ?, ?)'''
        
        
        try:
            self.cursor.execute(sql, values)
        except Exception as e:
            print('Erorr data is not stored',e)
        else:
            self.con.commit()
            self.cursor.close()

    def close_the_connection(self):
        self.con.close()
    

import pandas as pd


def insert_values():
    #df = pd.read_excel('final.xlsx')
    df =  df1
    df.head()              
    values = df[['username', 'email', 'followers', 'cluster','number_of_repos', 'achievements','languages']].values

   # print(df.columns)
    print(df.shape)
    print(df)
    conn = DataBaseSqlite()
    #conn = DataBaseSqlite.create_table_selected_candidate()
        
    for each in values:
        print(each.shape)
        conn.insertValues_into_selected_candidate(tuple(each))



insert_values()
# conn = sqlite3.connect('Database.db')
# cursor = conn.cursor()

# cursor.execute('SELECT * FROM SelectedCandidate')
# rows = cursor.fetchall()
# print(rows)
