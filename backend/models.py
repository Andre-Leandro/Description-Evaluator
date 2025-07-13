from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class Model(Base):
    __tablename__ = "model"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    descriptions = relationship("Description", back_populates="model_ref")


class Product(Base):
    __tablename__ = "product"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    og_description = Column(Text)
    evaluated = Column(Boolean, default=False)

    descriptions = relationship("Description", back_populates="product_ref")


class Description(Base):
    __tablename__ = "description"

    id = Column(Integer, primary_key=True, autoincrement=True)
    generated_description = Column(Text, nullable=False)

    product = Column(Integer, ForeignKey("product.id"), nullable=False)
    model = Column(Integer, ForeignKey("model.id"), nullable=False)

    # Relaciones
    product_ref = relationship("Product", back_populates="descriptions")
    model_ref = relationship("Model", back_populates="descriptions")

    def __repr__(self):
        return f"<Description(id={self.id}, model={self.model}, product={self.product})>"
