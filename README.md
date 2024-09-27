# Hush-Hush-Recruiter

Hush-Hush-Recruiter is an automated recruitment tool that streamlines the entire process of selecting potential candidates for Doodle firm. This secretive process automates the selection analysis and sends an email to a candidate if they are selected for a potential role at Doodle.

## Features

- **Data Fetching:** Fetches candidate data from GitHub through API.
- **Data Preprocessing:** Cleans and preprocesses the fetched data.
- **Candidate Selection:** Uses K-means clustering algorithm for selecting candidates.
- **Database Integration:** Stores candidate names in a database.
- **Automated Emails:** Automatically sends emails to selected candidates for further examination rounds.
- **Backend Maintenance:** Managed by the Viseral app for seamless backend operations.

![image](https://github.com/Rakesh-Seenu/Hush-Hush-Recruiter/assets/126412041/ef63f0e1-4fc4-4959-85e7-5d6acad54945)


## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

## Installation

1. **Clone the repository:**
    ```bash
    git clone https://github.com/Rakesh-Seenu/Hush-Hush-Recruiter.git
    ```
2. **Navigate to the project directory:**
    ```bash
    Hush-Hush-Recruiter
    ```
3. **Install the required dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

## Usage

1. **Fetch Data:**
    ```python
    from data_fetcher import fetch_data
    data = fetch_data()
    ```

2. **Preprocess and Clean Data:**
    ```python
    from data_preprocessor import preprocess_data
    cleaned_data = preprocess_data(data)
    ```

3. **Candidate Selection using K-means Clustering:**
    ```python
    from candidate_selector import select_candidates
    selected_candidates = select_candidates(cleaned_data)
    ```

4. **Store Selected Candidates in Database:**
    ```python
    from database_manager import store_candidates
    store_candidates(selected_candidates)
    ```

5. **Send Automated Emails:**
    ```python
    from email_sender import send_emails
    send_emails(selected_candidates)
    ```

## Configuration

- **Database Configuration:** Ensure your database credentials are correctly configured in `database_manager.py`.
- **Email Configuration:** Set up your email server settings in `email_sender.py`.
- **API Configuration:** Update your GitHub API token in `data_fetcher.py`.
