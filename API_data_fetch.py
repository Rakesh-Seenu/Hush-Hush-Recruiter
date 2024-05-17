import requests
import time
import json
import os
import pandas as pd
file_path = os.path.dirname(os.path.abspath(__file__))

def fetch_data(): 

    retrieved_data = []
    
    headers = {
        "Accept": "application/vnd.github+json ",
    "Authorization": "Bearer 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",
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59'  ,
    "X-GitHub-Api-Version": "2022-11-28" 
    }

    for i in range(8000, 8800, 100):
        #print(i)
        response = requests.get("https://api.github.com/users",params = {'per_page': 100, 'since':i},headers=headers)
    # print(response)
        users= response.json()
        print(users)
        for user in users:
            b=user['login']
            print(b)
            retrieved_data.append(b)



    usersfulldata = []
    headers = {
        "Accept": "application/vnd.github+json ",
    "Authorization": "Bearer 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",
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59'  ,
    "X-GitHub-Api-Version": "2022-11-28" 
    }
    print(len(retrieved_data))

    for user in retrieved_data[0:200]:
            try:
                if isinstance(user, str):
                    response = requests.get(f'https://api.github.com/users/{user}', headers=headers)
                    #time.sleep(1)
                    response.raise_for_status()  
                    user_data = response.json()
                else:
                    user_data = user

                repo_response = requests.get(f"https://api.github.com/users/{user_data['login']}/repos", headers=headers)
                #time.sleep(1)
                repo_response.raise_for_status() 
                repos = repo_response.json()

                languages = set()

                for repo in repos:
                    if repo["language"]:
                        languages.add(repo["language"])

                user_data = {
                    "username": user_data["login"],
                    "email": user_data.get("email", "N/A"),
                    "followers": user_data.get("followers", "N/A"),
                    "type": user_data.get("type", "N/A"),
                    "number of repos": user_data.get("public_repos", "N/A"),
                    "achievements": user_data.get("public_gists", "N/A"),
                    "languages": ", ".join(sorted(languages))
                }

                usersfulldata.append(user_data)

            except requests.exceptions.RequestException as e:
                print(f"Error fetching data for user {user}: {e}")



    x=json.dumps(usersfulldata)

    
    with open(file_path+'/new7.json', 'a') as outfile:
       outfile.write(x)

    file = open(file_path+'/new7.json')
    read_file = json.load(file)

    df = pd.DataFrame(read_file)

    # print(df)
    return df

# fetch_data()

