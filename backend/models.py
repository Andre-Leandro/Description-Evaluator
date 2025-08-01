from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, BigInteger
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class Model(Base):
    __tablename__ = "model"

    id = Column(BigInteger, primary_key=True)
    name = Column(String, nullable=False, unique=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    descriptions = relationship("Description", back_populates="model_ref")
    evaluations = relationship("Evaluation", back_populates="model_ref")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class Condition(Base):
    __tablename__ = "condition"

    id = Column(BigInteger, primary_key=True)
    description = Column(Text)
    temperature = Column(BigInteger)

    evaluations = relationship("Evaluation", back_populates="condition_ref")
    descriptions = relationship("Description", back_populates="condition_ref")

    def to_dict(self):
        return {
            "id": self.id,
            "description": self.description,
            "temperature": self.temperature
        }

class Product(Base):
    __tablename__ = "product"

    id = Column(BigInteger, primary_key=True)
    name = Column(String, nullable=False)
    og_description = Column(Text)

    descriptions = relationship("Description", back_populates="product_ref")
    evaluations = relationship("Evaluation", back_populates="product_ref")

    @property
    def evaluated(self):
        return any(eval.evaluated for eval in self.evaluations)

    @property
    def vote(self):
        # For backward compatibility, return the first evaluation's vote if any
        if self.evaluations:
            return self.evaluations[0].vote
        return None

    def to_dict(self, include_descriptions=True, include_evaluations=True):
        result = {
            "id": self.id,
            "name": self.name,
            "og_description": self.og_description,
            "evaluated": self.evaluated,
            "vote": self.vote
        }
        
        if include_descriptions:
            result["descriptions"] = [desc.to_dict() for desc in self.descriptions]
            
        if include_evaluations:
            result["evaluations"] = [eval.to_dict() for eval in self.evaluations]
            
        return result

class Description(Base):
    __tablename__ = "description"

    id = Column(BigInteger, primary_key=True)
    generated_description = Column(Text, nullable=False)
    product = Column(BigInteger, ForeignKey("product.id"), nullable=False)
    model = Column(BigInteger, ForeignKey("model.id"), nullable=False)
    condition = Column(BigInteger, ForeignKey("condition.id"), nullable=False)

    product_ref = relationship("Product", back_populates="descriptions")
    model_ref = relationship("Model", back_populates="descriptions")
    condition_ref = relationship("Condition", back_populates="descriptions")

    def to_dict(self):
        return {
            "id": self.id,
            "generated_description": self.generated_description,
            "product_id": self.product,
            "model": self.model_ref.to_dict() if self.model_ref else None,
            "condition": self.condition_ref.to_dict() if self.condition_ref else None
        }

class Evaluation(Base):
    __tablename__ = "evaluation"

    id = Column(BigInteger, primary_key=True)
    evaluated = Column(Boolean, nullable=False, default=False)
    vote = Column(BigInteger, ForeignKey("model.id"), nullable=True)
    product = Column("product", BigInteger, ForeignKey("product.id"), nullable=False)
    condition = Column("condition", BigInteger, ForeignKey("condition.id"), nullable=False)

    # Relationships
    product_ref = relationship("Product", back_populates="evaluations")
    model_ref = relationship("Model", back_populates="evaluations")
    condition_ref = relationship("Condition", back_populates="evaluations")

    def to_dict(self):
        return {
            "id": self.id,
            "evaluated": self.evaluated,
            "vote": self.vote,
            "product_id": self.product,  # Using self.product to match the column name
            "condition": self.condition_ref.to_dict() if self.condition_ref else None,
            "model": self.model_ref.to_dict() if self.model_ref and self.vote is not None else None
        }
