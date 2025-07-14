from sqlalchemy.orm import sessionmaker
from db import engine
from models import Model, Product, Description  # ¡esto es clave!

Session = sessionmaker(bind=engine)
session = Session()

try:
    descriptions = session.query(Description).all()
    for d in descriptions:
        print(f"Descripción: {d.generated_description}")
        print(f"Producto asociado: {d.product_ref.name}")
        print(f"Modelo IA asociado: {d.model_ref.name}")
        print("-" * 30)

except Exception as e:
    print(f"❌ Error: {e}")

finally:
    session.close()
