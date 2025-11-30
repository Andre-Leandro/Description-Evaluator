from models import Product, Description, Model, Condition, Evaluation
from sqlalchemy.orm import joinedload, subqueryload
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
        if not Session:
            raise Exception("Database connection not available. Please check database credentials.")
            
        session = Session()
        try:
            # Get all products with their descriptions and evaluations
            products = (
                session.query(Product)
                .options(
                    subqueryload(Product.descriptions).joinedload(Description.model_ref),
                    subqueryload(Product.descriptions).joinedload(Description.condition_ref),
                    subqueryload(Product.evaluations).joinedload(Evaluation.model_ref),
                    subqueryload(Product.evaluations).joinedload(Evaluation.condition_ref)
                )
                .all()
            )
            
            result = []
            for product in products:
                # Convert product to dict with all relationships
                product_dict = product.to_dict(include_descriptions=True, include_evaluations=True)
                
                # Don't override the evaluated property from the model
                # The to_dict method already includes the correct evaluated property
                # that checks if ANY evaluation exists for this product
                
                result.append(product_dict)
                
            return result
        except Exception as e:
            print(f"Error in get_all_products: {str(e)}")
            raise
        finally:
            session.close()

    @staticmethod
    def get_product_by_id(product_id):
        """Get a single product by ID with all its descriptions and evaluations"""
        if not Session:
            raise Exception("Database connection not available. Please check database credentials.")
        
        session = Session()
        try:
            product = (
                session.query(Product)
                .options(
                    joinedload(Product.descriptions).joinedload(Description.model_ref),
                    subqueryload(Product.evaluations).joinedload(Evaluation.model_ref),
                    subqueryload(Product.evaluations).joinedload(Evaluation.condition_ref)
                )
                .filter(Product.id == product_id)
                .first()
            )

            if not product:
                return None

            # Convert product to dict with all relationships
            product_dict = product.to_dict(include_descriptions=True, include_evaluations=True)
            
            # For backward compatibility, include the first evaluation's vote if any
            if product.evaluations:
                first_eval = product.evaluations[0]
                product_dict["evaluated"] = first_eval.evaluated
                product_dict["vote"] = first_eval.vote
            else:
                product_dict["evaluated"] = False
                product_dict["vote"] = None
            
            return product_dict
            
        except Exception as e:
            print(f"Error in get_product_by_id: {str(e)}")
            raise
        finally:
            session.close()

    @staticmethod
    def register_vote(product_id, model_id, condition_id):
        """
        Register a vote for a product
        
        Args:
            product_id: ID of the product being voted on
            model_id: ID of the model being voted for
            condition_id: ID of the condition/context for this evaluation (defaults to 1)
        """
        if not Session:
            raise Exception("Database connection not available. Please check database credentials.")
            
        session = Session()
        try:
            # Check if product exists
            product = session.query(Product).get(product_id)
            if not product:
                return None
                
            # Check if model exists
            model = session.query(Model).get(model_id)
            if not model:
                raise ValueError(f"Model with ID {model_id} not found")
                
            # Check if condition exists
            condition = session.query(Condition).get(condition_id)
            if not condition:
                raise ValueError(f"Condition with ID {condition_id} not found")
            
            # Check if an evaluation already exists for this product and condition
            evaluation = (
                session.query(Evaluation)
                .filter(
                    Evaluation.product == product_id,  # Using 'product' instead of 'product_id'
                    Evaluation.condition == condition_id
                )
                .first()
            )
            
            if evaluation:
                # Update existing evaluation
                evaluation.vote = model_id
                evaluation.evaluated = True
            else:
                # Create new evaluation
                evaluation = Evaluation(
                    product=product_id,
                    condition=condition_id,
                    vote=model_id,
                    evaluated=True
                )
                session.add(evaluation)
            
            session.commit()
            return True
            
        except Exception as e:
            session.rollback()
            print(f"Error registering vote: {str(e)}")
            raise
        finally:
            session.close()