from .database import insert_values
from .email_service import send_emails_to_all_candidates, usernames
from .selection import build_selected_candidates


def execute():
    selected_candidates = build_selected_candidates()
    insert_values(selected_candidates)
    send_emails_to_all_candidates(usernames)


if __name__ == '__main__':
    execute()
