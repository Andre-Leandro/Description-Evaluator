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
    missing = []
    if not USER: missing.append("user")
    if not PASSWORD: missing.append("password")
    if not HOST: missing.append("host")
    if not PORT: missing.append("port")
    if not DBNAME: missing.append("dbname")
    
    print("❌ Database connection failed: Missing environment variables")
    print(f"   Missing variables: {', '.join(missing)}")
    print("   Create a .env file with: user, password, host, port, dbname")
    engine = None
else:
    # Construct the SQLAlchemy connection string
    DATABASE_URL = f"postgresql+psycopg2://{USER}:{PASSWORD}@{HOST}:{PORT}/{DBNAME}"

    # Create the SQLAlchemy engine
    # If using Transaction Pooler or Session Pooler, we want to ensure we disable SQLAlchemy client side pooling -
    # https://docs.sqlalchemy.org/en/20/core/pooling.html#switching-pool-implementations
    engine = create_engine(DATABASE_URL, poolclass=NullPool)

    # Test the connection
    try:
        with engine.connect() as connection:
            print("✅ Database connection successful!")
            print(f"   Connected to: {HOST}:{PORT}/{DBNAME}")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print(f"   Attempted to connect to: {HOST}:{PORT}/{DBNAME}")
        print(f"   User: {USER}")
        engine = None