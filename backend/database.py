import os
import sqlite3

import pandas as pd

from .config import DATABASE_PATH


def connect_to_database():
    try:
        return sqlite3.connect(DATABASE_PATH)
    except sqlite3.Error as error:
        print('Error while connecting to SQLite database:', error)
        return None


class DataBaseSqlite:
    def __init__(self) -> None:
        self.con = sqlite3.connect(DATABASE_PATH)
        self.cursor = self.con.cursor()
        self.create_table_selected_candidate()

    def create_table_selected_candidate(self):
        sqlite_create_table_query = '''
        CREATE TABLE IF NOT EXISTS SelectedCandidate (
            id INTEGER PRIMARY KEY,
            cluster INT,
            username TEXT,
            email TEXT,
            followers INTEGER,
            type TEXT,
            number_of_repos INTEGER,
            achievements INTEGER,
            languages TEXT
        );'''
        try:
            self.cursor.execute(sqlite_create_table_query)
            self.con.commit()
        except Exception as error:
            print('Error table not created', error)
        finally:
            self.cursor.close()

    def insertValues_into_selected_candidate(self, values):
        self.cursor = self.con.cursor()
        sql = '''
        INSERT INTO SelectedCandidate (username, email, followers, cluster, number_of_repos, achievements, languages)
        VALUES (?, ?, ?, ?, ?, ?, ?)'''

        try:
            self.cursor.execute(sql, values)
            self.con.commit()
        except Exception as error:
            print('Erorr data is not stored', error)
        finally:
            self.cursor.close()

    def close_the_connection(self):
        self.con.close()


def fetch_selected_candidates():
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()

    try:
        cursor.execute(
            '''
            SELECT id, cluster, username, email, followers, type, number_of_repos, achievements, languages
            FROM SelectedCandidate
            ORDER BY id ASC
            '''
        )
        rows = cursor.fetchall()
        columns = ['id', 'cluster', 'username', 'email', 'followers', 'type', 'number_of_repos', 'achievements', 'languages']
        return [dict(zip(columns, row)) for row in rows]
    finally:
        cursor.close()
        conn.close()


def get_candidate_email(username):
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()

    try:
        cursor.execute('SELECT email FROM SelectedCandidate WHERE username = ?', (username,))
        row = cursor.fetchone()
        return row[0] if row else None
    finally:
        cursor.close()
        conn.close()


def insert_values(df):
    if df is None:
        raise ValueError('A dataframe of selected candidates is required.')

    values = df[['username', 'email', 'followers', 'cluster', 'number_of_repos', 'achievements', 'languages']].values
    conn = DataBaseSqlite()

    try:
        for each in values:
            conn.insertValues_into_selected_candidate(tuple(each))
    finally:
        conn.close_the_connection()
