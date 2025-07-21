from models import Product, Description
from sqlalchemy.orm import joinedload
from db import engine
from sqlalchemy.orm import sessionmaker
import os

# Only create session if engine is available
if engine:
    Session = sessionmaker(bind=engine)
else:
    Session = None

class ProductService:
    @staticmethod
    def get_all_products():
        """Get all products with their descriptions"""
        if not Session:
            # Return mock data for development
            return [
                {
                    "id": 1,
                    "name": "Sample Product 1",
                    "original": "Original description for product 1",
                    "evaluated": False,
                    "vote": None,
                    "descriptions": [
                        {"model": "Model A", "text": "Generated description A", "model_id": 1},
                        {"model": "Model B", "text": "Generated description B", "model_id": 2}
                    ]
                },
                {
                    "id": 2,
                    "name": "Sample Product 2",
                    "original": "Original description for product 2",
                    "evaluated": True,
                    "vote": "Model A",
                    "descriptions": [
                        {"model": "Model A", "text": "Generated description A", "model_id": 1},
                        {"model": "Model B", "text": "Generated description B", "model_id": 2}
                    ]
                }
            ]
        
        session = Session()
        try:
            # Trae todos los productos que tienen al menos una descripción
            products = (
                session.query(Product)
                .options(joinedload(Product.descriptions).joinedload(Description.model_ref),
                         joinedload(Product.model_ref))
                .all()
            )
            result = []

            for product in products:
                if not product.descriptions:
                    continue  # Saltar productos sin descripciones

                descriptions = [
                    {
                        "model": desc.model_ref.name,
                        "text": desc.generated_description,
                        "model_id": desc.model_ref.id,
                    }
                    for desc in product.descriptions
                ]

                result.append({
                    "id": product.id,
                    "name": product.name,
                    "original": product.og_description,
                    "evaluated": product.evaluated,
                    "vote": product.model_ref.name if product.model_ref else None,
                    "descriptions": descriptions
                })

            return result
        finally:
            session.close()

    @staticmethod
    def get_product_by_id(product_id):
        """Get a single product by ID"""
        if not Session:
            # Return mock data for development
            if product_id == 1:
                return {
                    "id": 1,
                    "name": "Sample Product 1",
                    "original": "Original description for product 1",
                    "evaluated": False,
                    "vote": None,
                    "descriptions": [
                        {"model": "Model A", "text": "Generated description A", "model_id": 1},
                        {"model": "Model B", "text": "Generated description B", "model_id": 2}
                    ]
                }
            return None
        
        session = Session()
        try:
            product = (
                session.query(Product)
                .options(joinedload(Product.descriptions).joinedload(Description.model_ref),
                         joinedload(Product.model_ref))
                .filter_by(id=product_id)
                .first()
            )
            
            if not product:
                return None

            descriptions = [
                {
                    "model": desc.model_ref.name,
                    "text": desc.generated_description,
                    "model_id": desc.model_ref.id,
                }
                for desc in product.descriptions
            ]

            return {
                "id": product.id,
                "name": product.name,
                "original": product.og_description,
                "evaluated": product.evaluated,
                "vote": product.model_ref.name if product.model_ref else None,
                "descriptions": descriptions
            }
        finally:
            session.close()

    @staticmethod
    def register_vote(product_id, model_id):
        """Register a vote for a product"""
        if not Session:
            # Mock success for development
            print(f"Mock vote registered: product_id={product_id}, model_id={model_id}")
            return True
            
        session = Session()
        try:
            product = session.query(Product).filter_by(id=product_id).first()
            if not product:
                return None

            product.evaluated = True
            product.vote = model_id

            session.commit()
            return True
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()