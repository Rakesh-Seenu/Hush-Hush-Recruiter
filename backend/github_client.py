import json
import os

import pandas as pd
import requests

from .config import RAW_USERS_PATH


def fetch_data():
    retrieved_data = []
    github_token = os.getenv('GITHUB_TOKEN', '')

    headers = {
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'Hush-Hush-Recruiter',
        'X-GitHub-Api-Version': '2022-11-28',
    }

    if github_token:
        headers['Authorization'] = f'Bearer {github_token}'

    for since in range(8000, 8800, 100):
        response = requests.get(
            'https://api.github.com/users',
            params={'per_page': 100, 'since': since},
            headers=headers,
            timeout=30,
        )
        response.raise_for_status()
        users = response.json()

        for user in users:
            retrieved_data.append(user['login'])

    users_full_data = []

    for user in retrieved_data[0:200]:
        try:
            response = requests.get(f'https://api.github.com/users/{user}', headers=headers, timeout=30)
            response.raise_for_status()
            user_data = response.json()

            repo_response = requests.get(
                f'https://api.github.com/users/{user_data["login"]}/repos',
                headers=headers,
                timeout=30,
            )
            repo_response.raise_for_status()
            repos = repo_response.json()

            languages = {repo['language'] for repo in repos if repo.get('language')}

            users_full_data.append(
                {
                    'username': user_data['login'],
                    'email': user_data.get('email', 'N/A'),
                    'followers': user_data.get('followers', 'N/A'),
                    'type': user_data.get('type', 'N/A'),
                    'number of repos': user_data.get('public_repos', 'N/A'),
                    'achievements': user_data.get('public_gists', 'N/A'),
                    'languages': ', '.join(sorted(languages)),
                }
            )
        except requests.exceptions.RequestException as error:
            print(f'Error fetching data for user {user}: {error}')

    RAW_USERS_PATH.write_text(json.dumps(users_full_data), encoding='utf-8')
    return pd.DataFrame(users_full_data)
