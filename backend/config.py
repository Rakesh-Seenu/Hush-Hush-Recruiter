from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
DATABASE_PATH = ROOT_DIR / 'Database.db'
MODEL_PATH = ROOT_DIR / 'kmeans_model.pkl'
RAW_USERS_PATH = ROOT_DIR / 'new7.json'
