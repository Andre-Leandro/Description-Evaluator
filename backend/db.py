from sqlalchemy import create_engine
from sqlalchemy.pool import NullPool
from dotenv import load_dotenv
import os
# Load environment variables from .env
load_dotenv()

# Fetch variables
USER = os.getenv("user")
PASSWORD = os.getenv("password")
HOST = os.getenv("host")
PORT = os.getenv("port")
DBNAME = os.getenv("dbname")

# Check if all required environment variables are present
if not all([USER, PASSWORD, HOST, PORT, DBNAME]):
    print("⚠️  Database environment variables not found. Using development mode.")
    print("   Create a .env file with database credentials for production use.")
    engine = None
else:
    # Construct the SQLAlchemy connection string
    DATABASE_URL = f"postgresql+psycopg2://{USER}:{PASSWORD}@{HOST}:{PORT}/{DBNAME}"

    # Create the SQLAlchemy engine
    #engine = create_engine(DATABASE_URL)
    # If using Transaction Pooler or Session Pooler, we want to ensure we disable SQLAlchemy client side pooling -
    # https://docs.sqlalchemy.org/en/20/core/pooling.html#switching-pool-implementations
    engine = create_engine(DATABASE_URL, poolclass=NullPool)

    # Test the connection
    try:
        with engine.connect() as connection:
            print("Connection successful!")
    except Exception as e:
        print(f"Failed to connect: {e}")
        engine = None