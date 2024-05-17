import pickle
import os
import json
from API_data_fetch import fetch_data
file_path = os.path.dirname(os.path.abspath(__file__))
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt



import json
#df = pd.read_json('C:\\Users\\hsrak\\OneDrive\\Desktop\\Python_Anil_Proj\\new.json')

import pandas as pd

df = fetch_data()

import pandas as pd
from typing import Counter

def remove_duplicates(df, column_name):
    df.drop_duplicates(subset=[column_name], keep='first', inplace=True)
    return df


def replace_none_with_email(df, replace_email):
    df['email'] = df['email'].fillna(replace_email)
    return df

# def remove_null_values(df, column_name):
#     df.dropna(subset=[column_name], inplace=True)
#     return df


def rename_column(df, old_name, new_name):
    df = df.rename(columns={old_name: new_name})
    return df

def count_languages(df, languages_column, new_column):
    df[new_column] = df[languages_column].str.count(',') + 1
    df[new_column] = df[new_column].fillna(0)
    df[new_column] = df[new_column].astype(int)
    return df

def selection(df):
    features = df[['username','email','followers', 'number_of_repos', 'achievements','languages']]
    candidates = features[['username','email','languages']]
    features = features.drop(columns=['username','email','languages'])
    scaler = StandardScaler()
    features_scaled = scaler.fit_transform(features)

    optimal_k = 4

    try:
        with open("C:/Users/hsrak/OneDrive/Desktop/Python_Anil_Proj/Final/kmeans_model.pkl", 'rb') as f:
            kmeans_final = pickle.load(f)
            features['cluster'] = kmeans_final.predict(features_scaled)
    except:
        kmeans_final = KMeans(n_clusters=optimal_k, random_state=42)
        features['cluster'] = kmeans_final.fit_predict(features_scaled)
        with open("C:/Users/hsrak/OneDrive/Desktop/Python_Anil_Proj/Final/kmeans_model.pkl", 'wb') as f:
            pickle.dump(kmeans_final, f)

    data = pd.concat([candidates, features], axis=1)
    Selected_candidates = data[data['cluster'].isin([2, 3])] # returning the 2 and 3rd cluster vlaues
    #print(Selected_candidates)    
    return Selected_candidates
    


def cleaning_and_selecting(df):
    df = remove_duplicates(df, 'username')
    #df = remove_null_values(df, 'email')
    df = replace_none_with_email(df, 'heidelbergfreewifi@gmail.com')
    df = rename_column(df, 'number of repos', 'number_of_repos')
    df = count_languages(df, 'languages', 'language_count')
    df = selection(df)
    Selected_candidates = df[df['cluster'].isin([2, 3])]
    return Selected_candidates

df1= cleaning_and_selecting(df)

# print(df1)
# excel_file_path = "final.xlsx"
# df1.to_excel(excel_file_path, index=False)
