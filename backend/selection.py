import os
import pickle

import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

from .config import MODEL_PATH
from .github_client import fetch_data


def remove_duplicates(df, column_name):
    df.drop_duplicates(subset=[column_name], keep='first', inplace=True)
    return df


def replace_none_with_email(df, replace_email):
    df['email'] = df['email'].fillna(replace_email)
    return df


def rename_column(df, old_name, new_name):
    return df.rename(columns={old_name: new_name})


def count_languages(df, languages_column, new_column):
    df[new_column] = df[languages_column].str.count(',') + 1
    df[new_column] = df[new_column].fillna(0)
    df[new_column] = df[new_column].astype(int)
    return df


def selection(df):
    features = df[['username', 'email', 'followers', 'number_of_repos', 'achievements', 'languages']]
    candidates = features[['username', 'email', 'languages']]
    features = features.drop(columns=['username', 'email', 'languages'])
    scaler = StandardScaler()
    features_scaled = scaler.fit_transform(features)

    optimal_k = 4

    try:
        with open(MODEL_PATH, 'rb') as file:
            kmeans_final = pickle.load(file)
            features['cluster'] = kmeans_final.predict(features_scaled)
    except Exception:
        kmeans_final = KMeans(n_clusters=optimal_k, random_state=42)
        features['cluster'] = kmeans_final.fit_predict(features_scaled)
        with open(MODEL_PATH, 'wb') as file:
            pickle.dump(kmeans_final, file)

    data = pd.concat([candidates, features], axis=1)
    return data[data['cluster'].isin([2, 3])]


def cleaning_and_selecting(df):
    df = remove_duplicates(df, 'username')
    df = replace_none_with_email(df, 'heidelbergfreewifi@gmail.com')
    df = rename_column(df, 'number of repos', 'number_of_repos')
    df = count_languages(df, 'languages', 'language_count')
    return selection(df)


def build_selected_candidates():
    data_frame = fetch_data()
    return cleaning_and_selecting(data_frame)


if __name__ == '__main__':
    print(build_selected_candidates())
