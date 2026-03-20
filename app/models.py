from app import db
from datetime import datetime
from . import db

class Role(db.Model):
    __tablename__ = "roles"

    id = db.Column(db.Integer, primary_key=True)
    role_name = db.Column(db.String(50), unique=True, nullable=False)

    users = db.relationship("User", backref="role", lazy=True)

    def __repr__(self):
        return f"<Role {self.role_name}>"


class User(db.Model):

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(100), nullable=False)

    email = db.Column(db.String(120), unique=True, nullable=False)

    password = db.Column(db.String(200), nullable=False)

    role_id = db.Column(
        db.Integer,
        db.ForeignKey("roles.id")
    )
    

class Product(db.Model):
    __tablename__ = "products"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    sku = db.Column(db.String(100), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey("categories.id"), nullable=False)
    selling_price = db.Column(db.Float, nullable=False)
    cost_price = db.Column(db.Float, nullable=False)
    quantity = db.Column(db.Integer, default=0)
    image = db.Column(db.String(255)) 


class Category(db.Model):
    __tablename__ = "categories"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)

    products = db.relationship("Product", backref="category", lazy=True)

    def __repr__(self):
        return f"<Category {self.name}>"    



class Sale(db.Model):

    __tablename__ = "sales"

    id = db.Column(db.Integer, primary_key=True)

    product_id = db.Column(db.Integer, db.ForeignKey("products.id"))
    product = db.relationship("Product")

    customer_id = db.Column(db.Integer, db.ForeignKey("customers.id"))
    customer = db.relationship("Customer")

    quantity_sold = db.Column(db.Integer)
    total_price = db.Column(db.Float)
    profit = db.Column(db.Float)

    sold_by = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)



class Invoice(db.Model):
    __tablename__ = "invoices"

    id = db.Column(db.Integer, primary_key=True)
    invoice_number = db.Column(db.String(50), unique=True, nullable=False)

    sale_id = db.Column(db.Integer, db.ForeignKey("sales.id"))

    total_amount = db.Column(db.Float, nullable=False)
    total_profit = db.Column(db.Float, nullable=False)

    sold_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    items = db.relationship("InvoiceItem", backref="invoice", cascade="all, delete")


class InvoiceItem(db.Model):
    __tablename__ = "invoice_items"

    id = db.Column(db.Integer, primary_key=True)

    invoice_id = db.Column(db.Integer, db.ForeignKey("invoices.id"), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False)

    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Float, nullable=False)
    total_price = db.Column(db.Float, nullable=False)
    profit = db.Column(db.Float, nullable=False)

    product = db.relationship("Product")    


class Supplier(db.Model):
    __tablename__ = "suppliers"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(50))
    email = db.Column(db.String(120))
    address = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Purchase(db.Model):
    __tablename__ = "purchases"

    id = db.Column(db.Integer, primary_key=True)
    supplier_id = db.Column(db.Integer, db.ForeignKey("suppliers.id"))
    total_amount = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    supplier = db.relationship("Supplier")


class PurchaseItem(db.Model):
    __tablename__ = "purchase_items"

    id = db.Column(db.Integer, primary_key=True)
    purchase_id = db.Column(db.Integer, db.ForeignKey("purchases.id"))
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"))

    quantity = db.Column(db.Integer)
    cost_price = db.Column(db.Float)
    subtotal = db.Column(db.Float)

    product = db.relationship("Product")    


class Customer(db.Model):
    __tablename__ = "customers"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20))
    email = db.Column(db.String(100))
    address = db.Column(db.Text)

class ActivityLog(db.Model):

    __tablename__ = "activity_logs"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    action = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    user = db.relationship("User")    