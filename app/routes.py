from flask import Blueprint, request, jsonify, send_file, send_from_directory
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from sqlalchemy import func, or_

from app import db
from app.models import (
    User, Role, Product, Category, Sale,
    Supplier, Purchase, PurchaseItem,
    Customer, Invoice, InvoiceItem
)

from app.utils import admin_required, log_activity

import bcrypt
import os
import io
import uuid
from datetime import datetime, timedelta
from werkzeug.utils import secure_filename
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas


auth_bp = Blueprint("auth", __name__)



BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@auth_bp.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)


def generate_invoice_number():
    last_invoice = Invoice.query.order_by(Invoice.id.desc()).first()

    if not last_invoice:
        return "INV-2026-0001"

    last_number = int(last_invoice.invoice_number.split("-")[-1])
    new_number = last_number + 1

    return f"INV-2026-{str(new_number).zfill(4)}"



@auth_bp.route("/create-invoice", methods=["POST"])
@jwt_required()
def create_invoice():

    data = request.get_json()
    items = data.get("items")

    if not items or len(items) == 0:
        return jsonify({"message": "No items provided"}), 400

    user_id = get_jwt_identity()
    invoice_number = generate_invoice_number()

    total_amount = 0
    total_profit = 0

    invoice = Invoice(
        invoice_number=invoice_number,
        total_amount=0,
        total_profit=0,
        sold_by=user_id
    )

    db.session.add(invoice)
    db.session.flush()

    for item in items:
        product = Product.query.get(item["product_id"])
        quantity = item["quantity"]

        if not product:
            return jsonify({"message": "Product not found"}), 404

        if product.quantity < quantity:
            return jsonify({"message": f"Not enough stock for {product.name}"}), 400

        product.quantity -= quantity

        total_price = product.selling_price * quantity
        profit = (product.selling_price - product.cost_price) * quantity

        total_amount += total_price
        total_profit += profit

        invoice_item = InvoiceItem(
            invoice_id=invoice.id,
            product_id=product.id,
            quantity=quantity,
            unit_price=product.selling_price,
            total_price=total_price,
            profit=profit
        )

        db.session.add(invoice_item)

    invoice.total_amount = total_amount
    invoice.total_profit = total_profit

    db.session.commit()

    return jsonify({
        "message": "Invoice created",
        "invoice_number": invoice_number,
        "total_amount": total_amount,
        "total_profit": total_profit
    }), 201    

@auth_bp.route("/invoices", methods=["GET"])
@jwt_required()
def get_invoices():

    invoices = Invoice.query.order_by(Invoice.created_at.desc()).all()

    output = []

    for inv in invoices:
        output.append({
            "invoice_id": inv.id,
            "invoice_number": inv.invoice_number,
            "total_amount": inv.total_amount,
            "total_profit": inv.total_profit,
            "created_at": inv.created_at.strftime("%Y-%m-%d %H:%M:%S")
        })

    return jsonify({"invoices": output}), 200


@auth_bp.route("/invoice/<int:invoice_id>", methods=["GET"])
@jwt_required()
def get_invoice(invoice_id):

    invoice = Invoice.query.get(invoice_id)

    if not invoice:
        return jsonify({"message": "Invoice not found"}), 404

    items = []

    for item in invoice.items:
        items.append({
            "product_name": item.product.name,
            "quantity": item.quantity,
            "unit_price": item.unit_price,
            "total_price": item.total_price,
            "profit": item.profit
        })

    return jsonify({
        "invoice_number": invoice.invoice_number,
        "total_amount": invoice.total_amount,
        "total_profit": invoice.total_profit,
        "created_at": invoice.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        "items": items
    }), 200


@auth_bp.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role_id = data.get("role_id")

    if not name or not email or not password:
        return jsonify({"message": "Missing fields"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email already exists"}), 400

    # Hash password
    hashed_password = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    new_user = User(
        name=name,
        email=email,
        password=hashed_password,
        role_id=role_id
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201



# Login API
@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "Email and password required"}), 400

    # Find user
    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"message": "Invalid credentials"}), 401

    # Check password
    if not bcrypt.checkpw(password.encode("utf-8"), user.password.encode("utf-8")):
        return jsonify({"message": "Invalid credentials"}), 401

    # Check role
    if not user.role:
        return jsonify({"message": "User role not assigned"}), 500

    # Create token
    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={
            "role": user.role.role_name
        }
    )

    return jsonify({
        "message": "Login successful",
        "token": access_token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role.role_name
        }
    }), 200


    from flask_jwt_extended import jwt_required, get_jwt_identity

@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def profile():
    current_user_id = get_jwt_identity()
    return jsonify({
        "message": "Protected route working",
        "user_id": current_user_id
    })



@auth_bp.route("/add-product", methods=["POST"])
@jwt_required()
def add_product():

    try:
        claims = get_jwt()

        # 🔒 Role check
        if claims["role"] not in ["Admin", "Manager"]:
            return jsonify({"message": "Not authorized"}), 403

        # 📦 Get form data
        name = request.form.get("name")
        sku = request.form.get("sku")
        category_id = request.form.get("category_id")
        selling_price = request.form.get("selling_price")
        cost_price = request.form.get("cost_price")
        quantity = request.form.get("quantity")

        image = request.files.get("image")

        # 🔍 Validate fields
        if not all([name, sku, category_id, selling_price, cost_price]):
            return jsonify({"message": "All fields are required"}), 400

        # 🔢 Convert types
        category_id = int(category_id)
        selling_price = float(selling_price)
        cost_price = float(cost_price)
        quantity = int(quantity) if quantity else 0

        # 🔍 Check duplicate SKU
        existing_product = Product.query.filter_by(sku=sku).first()
        if existing_product:
            return jsonify({"message": "SKU already exists"}), 400

        # 🖼 Handle image upload
        filename = None

        if image:
            ext = image.filename.split(".")[-1]
            filename = f"{uuid.uuid4()}.{ext}"
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            image.save(filepath)

        # 📦 Create product
        product = Product(
            name=name,
            sku=sku,
            category_id=category_id,
            selling_price=selling_price,
            cost_price=cost_price,
            quantity=quantity,
            image=filename
        )

        db.session.add(product)
        db.session.commit()

        # 📝 Activity log
        log_activity(f"Created product {product.name}")

        return jsonify({
            "message": "Product added successfully"
        }), 201

    except Exception as e:
        db.session.rollback()

        print("ERROR:", str(e))

        return jsonify({
            "message": "Failed to create product",
            "error": str(e)
        }), 500




@auth_bp.route("/update-stock/<int:product_id>", methods=["PUT"])
@jwt_required()
def update_stock(product_id):
    claims = get_jwt()

    # 🔒 Only Admin & Manager
    if claims["role"] not in ["Admin", "Manager"]:
        return jsonify({"message": "Not authorized"}), 403

    product = Product.query.get(product_id)

    if not product:
        return jsonify({"message": "Product not found"}), 404

    data = request.get_json()
    change = data.get("change")

    if change is None:
        return jsonify({"message": "Stock change value required"}), 400

    try:
        change = int(change)
    except:
        return jsonify({"message": "Change must be a number"}), 400

    new_quantity = product.quantity + change

    if new_quantity < 0:
        return jsonify({"message": "Stock cannot be negative"}), 400

    product.quantity = new_quantity
    db.session.commit()

    return jsonify({
        "message": "Stock updated successfully",
        "new_quantity": product.quantity
    }), 200


@auth_bp.route("/product/<int:product_id>", methods=["GET"])
@jwt_required()
def get_single_product(product_id):

    product = Product.query.get(product_id)

    if not product:
        return jsonify({"message": "Product not found"}), 404

    return jsonify({
        "id": product.id,
        "name": product.name,
        "sku": product.sku,
        "category_id": product.category_id,
        "selling_price": float(product.selling_price),
        "cost_price": float(product.cost_price),
        "quantity": product.quantity
    }), 200


from sqlalchemy import or_

@auth_bp.route("/products", methods=["GET"])
@jwt_required()
def get_products():

    page = request.args.get("page", 1, type=int)
    limit = request.args.get("limit", 5, type=int)
    search = request.args.get("search")

    query = Product.query

    if search:
        query = query.filter(
            or_(
                Product.name.ilike(f"%{search}%"),
                Product.sku.ilike(f"%{search}%")
            )
        )

    pagination = query.paginate(page=page, per_page=limit, error_out=False)

    products = pagination.items

    result = []

    for product in products:
        result.append({
    "id": product.id,
    "name": product.name,
    "sku": product.sku,
    "category_id": product.category_id,
    "selling_price": float(product.selling_price),
    "cost_price": float(product.cost_price),
    "quantity": product.quantity,
    "image": product.image
})

    return jsonify({
        "total_products": pagination.total,
        "total_pages": pagination.pages,
        "current_page": pagination.page,
        "products": result
    }), 200



@auth_bp.route("/update-product/<int:id>", methods=["PUT"])
@jwt_required()
def update_product(id):

    try:

        claims = get_jwt()

        if claims["role"] not in ["Admin", "Manager"]:
            return jsonify({"message": "Not authorized"}), 403

        product = Product.query.get(id)

        if not product:
            return jsonify({"message": "Product not found"}), 404

        # Get form data
        name = request.form.get("name")
        sku = request.form.get("sku")
        category_id = request.form.get("category_id")
        selling_price = request.form.get("selling_price")
        cost_price = request.form.get("cost_price")
        quantity = request.form.get("quantity")

        image = request.files.get("image")

        # Convert types
        category_id = int(category_id)
        selling_price = float(selling_price)
        cost_price = float(cost_price)
        quantity = int(quantity)

        # Update fields
        product.name = name
        product.sku = sku
        product.category_id = category_id
        product.selling_price = selling_price
        product.cost_price = cost_price
        product.quantity = quantity

        # Image update
        if image:

            filename = secure_filename(image.filename)

            filepath = os.path.join(UPLOAD_FOLDER, filename)

            image.save(filepath)

            product.image = filename

        db.session.commit()

        log_activity(f"Updated product {product.name}")

        return jsonify({"message": "Product updated"}), 200

    except Exception as e:

        db.session.rollback()

        print("ERROR:", str(e))

        return jsonify({"error": str(e)}), 500



@auth_bp.route("/delete-product/<int:product_id>", methods=["DELETE"])
@jwt_required()
def delete_product(product_id):

    claims = get_jwt()

    # Only Admin allowed
    if claims["role"] != "Admin":
        return jsonify({"message": "Only Admin can delete products"}), 403

    product = Product.query.get(product_id)

    if not product:
        return jsonify({"message": "Product not found"}), 404

    # Check if product exists in invoices
    invoice_item = InvoiceItem.query.filter_by(product_id=product_id).first()

    if invoice_item:
        return jsonify({
            "message": "Cannot delete product because it exists in invoices"
        }), 400

    db.session.delete(product)
    db.session.commit()

    return jsonify({"message": "Product deleted successfully"}), 200


@auth_bp.route("/low-stock", methods=["GET"])
@jwt_required()
def get_low_stock_products():

    threshold = request.args.get("threshold", 5, type=int)

    products = Product.query.filter(Product.quantity < threshold).all()

    result = []

    for product in products:
        result.append({
            "id": product.id,
            "name": product.name,
            "sku": product.sku,
            "quantity": product.quantity,
            "selling_price": float(product.selling_price)
        })

    return jsonify({
        "threshold": threshold,
        "low_stock_count": len(result),
        "products": result
    }), 200

@auth_bp.route("/sell", methods=["POST"])
@jwt_required()
def sell_product():

    data = request.get_json()

    product_id = data.get("product_id")
    customer_id = data.get("customer_id")
    quantity = data.get("quantity")

    if not product_id or not quantity or not customer_id:
        return jsonify({"message": "Customer, Product and quantity required"}), 400

    product = Product.query.get(product_id)

    if not product:
        return jsonify({"message": "Product not found"}), 404

    if product.quantity < quantity:
        return jsonify({"message": "Not enough stock"}), 400

    customer = Customer.query.get(customer_id)

    if not customer:
        return jsonify({"message": "Customer not found"}), 404

    # Calculate totals
    total_price = float(product.selling_price) * int(quantity)
    cost_total = float(product.cost_price) * int(quantity)
    profit = total_price - cost_total

    # Reduce stock
    product.quantity -= int(quantity)

    # Get current user
    user_id = int(get_jwt_identity())

    # Create sale
    sale = Sale(
        product_id=product.id,
        customer_id=customer.id,
        quantity_sold=int(quantity),
        total_price=total_price,
        profit=profit,
        sold_by=user_id
    )

    db.session.add(sale)
    db.session.commit()
    log_activity(f"Sold {quantity} {product.name}")

    return jsonify({
        "message": "Sale completed",
        "sale_id": sale.id,
        "product_name": product.name,
        "customer_name": customer.name,
        "quantity_sold": int(quantity),
        "unit_price": float(product.selling_price),
        "total_price": total_price,
        "profit": profit,
        "remaining_stock": product.quantity
    }), 201




@auth_bp.route("/add-category", methods=["POST"])
@jwt_required()
def add_category():
    data = request.get_json()
    new_category = Category(name=data.get("name"))
    db.session.add(new_category)
    db.session.commit()
    return jsonify({"message": "Category added"}), 201



@auth_bp.route("/categories", methods=["GET"])
@jwt_required()
def get_categories():

    categories = Category.query.all()

    result = []

    for category in categories:

        products = Product.query.filter_by(category_id=category.id).all()

        product_names = [p.name for p in products]

        result.append({
            "id": category.id,
            "name": category.name,
            "products": product_names,
            "total_products": len(products)
        })

    return jsonify({"categories": result}), 200



@auth_bp.route("/sales", methods=["GET"])
@jwt_required()
@admin_required
def get_sales():

    sales = Sale.query.order_by(Sale.created_at.desc()).all()

    result = []

    total_revenue = 0
    total_items_sold = 0
    total_profit = 0

    for sale in sales:

        product = sale.product
        customer = sale.customer

        revenue = float(sale.total_price)
        cost_total = float(product.cost_price) * sale.quantity_sold
        profit = revenue - cost_total

        total_revenue += revenue
        total_items_sold += sale.quantity_sold
        total_profit += profit

        result.append({
            "sale_id": sale.id,
            "product_id": product.id,
            "product_name": product.name,
            "customer_name": customer.name if customer else "Walk-in Customer",
            "quantity_sold": sale.quantity_sold,
            "unit_price": float(product.selling_price),
            "revenue": revenue,
            "profit": profit,
            "sold_by": sale.sold_by,
            "created_at": sale.created_at.strftime("%Y-%m-%d %H:%M:%S")
        })

    return jsonify({
        "summary": {
            "total_sales": len(result),
            "total_items_sold": total_items_sold,
            "total_revenue": total_revenue,
            "total_profit": total_profit
        },
        "sales": result
    }), 200



@auth_bp.route("/sales-report", methods=["GET"])
@jwt_required()
def sales_report():

    start_date = request.args.get("start")
    end_date = request.args.get("end")
    product_id = request.args.get("product_id")

    if not start_date or not end_date:
        return jsonify({"message": "Start and end date required"}), 400

    try:
        start = datetime.strptime(start_date, "%Y-%m-%d")
        end = datetime.strptime(end_date, "%Y-%m-%d")
    except:
        return jsonify({"message": "Invalid date format"}), 400

    query = Sale.query.filter(
        Sale.created_at >= start,
        Sale.created_at <= end
    )

    if product_id:
        query = query.filter(Sale.product_id == int(product_id))

    sales = query.all()

    total_revenue = 0
    total_profit = 0
    total_quantity = 0

    result = []

    for sale in sales:
        total_revenue += float(sale.total_price)
        total_profit += float(sale.profit)
        total_quantity += sale.quantity_sold

        result.append({
            "sale_id": sale.id,
            "product_name": sale.product.name,
            "quantity_sold": sale.quantity_sold,
            "revenue": float(sale.total_price),
            "profit": float(sale.profit),
            "created_at": sale.created_at.strftime("%Y-%m-%d %H:%M:%S")
        })

    return jsonify({
        "summary": {
            "total_sales": len(result),
            "total_quantity": total_quantity,
            "total_revenue": total_revenue,
            "total_profit": total_profit
        },
        "sales": result
    }), 200

    

@auth_bp.route("/top-products", methods=["GET"])
@jwt_required()
def top_selling_products():

    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    # 🔐 Admin Only
    if user.role.role_name.lower() != "admin":
        return jsonify({"message": "Access denied. Admin only."}), 403

    results = db.session.query(
        Product.id,
        Product.name,
        func.sum(Sale.quantity_sold).label("total_quantity_sold"),
        func.sum(Sale.total_price).label("total_revenue"),
        func.sum(Sale.profit).label("total_profit")
    ).join(Sale, Product.id == Sale.product_id)\
     .group_by(Product.id, Product.name)\
     .order_by(func.sum(Sale.quantity_sold).desc())\
     .all()

    output = []

    for row in results:
        output.append({
            "product_id": row.id,
            "product_name": row.name,
            "total_quantity_sold": int(row.total_quantity_sold),
            "total_revenue": float(row.total_revenue),
            "total_profit": float(row.total_profit)
        })

    return jsonify({
        "top_products": output
    }), 200    




from datetime import datetime, timedelta
from sqlalchemy import func
from flask import request, jsonify

@auth_bp.route("/dashboard-stats", methods=["GET"])
@jwt_required()
def dashboard_stats():

    period = request.args.get("period", "7")

    try:
        days = int(period)
    except:
        days = 7

    start_date = datetime.utcnow() - timedelta(days=days)

    # -------- Basic Stats --------
    total_products = Product.query.count()
    total_sales = Sale.query.count()

    total_revenue = db.session.query(
        func.sum(Sale.total_price)
    ).scalar() or 0

    total_profit = db.session.query(
        func.sum(Sale.profit)
    ).scalar() or 0

    period_profit = db.session.query(
        func.sum(Sale.profit)
    ).filter(
        Sale.created_at >= start_date
    ).scalar() or 0

    low_stock_count = Product.query.filter(Product.quantity < 5).count()

    # -------- Chart Data (Revenue + Profit) --------
    daily_stats = db.session.query(
        func.DATE(Sale.created_at).label("day"),
        func.sum(Sale.total_price).label("revenue"),
        func.sum(Sale.profit).label("profit")
    ).filter(
        Sale.created_at >= start_date
    ).group_by("day").order_by("day").all()

    chart_data = []

    for row in daily_stats:
        chart_data.append({
            "date": str(row.day),
            "revenue": float(row.revenue or 0),
            "profit": float(row.profit or 0)
        })

    return jsonify({
        "summary": {
            "total_products": total_products,
            "total_sales": total_sales,
            "total_revenue": float(total_revenue),
            "total_profit": float(total_profit),
            "period_profit": float(period_profit),
            "low_stock_count": low_stock_count
        },
        "chart_data": chart_data
    }), 200



@auth_bp.route("/generate-invoice/<int:sale_id>", methods=["POST"])
@jwt_required()
def generate_invoice_from_sale(sale_id):

    user_id = get_jwt_identity()

    sale = Sale.query.get(sale_id)

    if not sale:
        return jsonify({"message": "Sale not found"}), 404

    # Check if invoice already exists for this sale
    existing_invoice = Invoice.query.filter_by(sale_id=sale.id).first()
    if existing_invoice:
        return jsonify({"message": "Invoice already generated"}), 400

    invoice_number = generate_invoice_number()

    invoice = Invoice(
        invoice_number=invoice_number,
        total_amount=sale.total_price,
        total_profit=sale.profit,
        sold_by=user_id,
        sale_id=sale.id
    )

    db.session.add(invoice)
    db.session.flush()

    invoice_item = InvoiceItem(
        invoice_id=invoice.id,
        product_id=sale.product_id,
        quantity=sale.quantity_sold,
        unit_price=sale.total_price / sale.quantity_sold,
        total_price=sale.total_price,
        profit=sale.profit
    )

    db.session.add(invoice_item)
    db.session.commit()

    return jsonify({
        "message": "Invoice generated successfully",
        "invoice_number": invoice.invoice_number
    }), 201



@auth_bp.route("/purchase", methods=["POST"])
@jwt_required()
@admin_required
def create_purchase():

    data = request.get_json()

    supplier_id = data.get("supplier_id")
    items = data.get("items")

    purchase = Purchase(
        supplier_id=supplier_id,
        total_amount=0
    )

    db.session.add(purchase)
    db.session.flush()

    total = 0

    for item in items:

        product = Product.query.get(item["product_id"])

        quantity = item["quantity"]
        price = item["cost_price"]

        subtotal = quantity * price

        purchase_item = PurchaseItem(
            purchase_id=purchase.id,
            product_id=product.id,
            quantity=quantity,
            cost_price=price,
            subtotal=subtotal
        )

        # Increase stock
        product.quantity += quantity

        total += subtotal

        db.session.add(purchase_item)

    purchase.total_amount = total

    db.session.commit()

    return jsonify({"message": "Purchase recorded successfully"})


@auth_bp.route("/purchases", methods=["GET"])
@jwt_required()
def get_purchases():

    purchases = Purchase.query.order_by(Purchase.created_at.desc()).all()

    result = []

    for p in purchases:

        supplier = Supplier.query.get(p.supplier_id)

        result.append({
            "id": p.id,
            "supplier": supplier.name if supplier else "Unknown",
            "total": p.total_amount,
            "date": p.created_at.strftime("%Y-%m-%d %H:%M:%S")
        })

    return jsonify({
        "purchases": result
    }), 200


@auth_bp.route("/suppliers", methods=["GET"])
@jwt_required()
def get_suppliers():

    suppliers = Supplier.query.all()

    result = []

    for s in suppliers:
        result.append({
            "id": s.id,
            "name": s.name,
            "phone": s.phone,
            "email": s.email,
            "address": s.address
        })

    return jsonify({"suppliers": result})


@auth_bp.route("/suppliers", methods=["POST"])
@jwt_required()
def create_supplier():

    data = request.get_json()

    supplier = Supplier(
        name=data.get("name"),
        phone=data.get("phone"),
        email=data.get("email"),
        address=data.get("address")
    )

    db.session.add(supplier)
    db.session.commit()
    log_activity(f"Sold {quantity} {product.name}")

    return jsonify({"message": "Supplier created"}), 201



@auth_bp.route("/suppliers/<int:supplier_id>", methods=["DELETE"])
@jwt_required()
def delete_supplier(supplier_id):

    try:

        claims = get_jwt()

        # Only Admin can delete supplier
        if claims["role"] != "Admin":
            return jsonify({"message": "Not authorized"}), 403

        supplier = Supplier.query.get(supplier_id)

        if not supplier:
            return jsonify({"message": "Supplier not found"}), 404

        supplier_name = supplier.name

        db.session.delete(supplier)
        db.session.commit()

        # Activity Log
        log_activity(f"Deleted supplier {supplier_name}")

        return jsonify({"message": "Supplier deleted"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "message": "Error deleting supplier",
            "error": str(e)
        }), 500



@auth_bp.route("/suppliers/<int:id>", methods=["PUT"])
@jwt_required()
@admin_required
def update_supplier(id):

    supplier = Supplier.query.get(id)

    if not supplier:
        return jsonify({"message": "Supplier not found"}), 404

    data = request.get_json()

    supplier.name = data.get("name")
    supplier.phone = data.get("phone")
    supplier.email = data.get("email")
    supplier.address = data.get("address")

    db.session.commit()

    return jsonify({"message": "Supplier updated successfully"}), 200    


@auth_bp.route("/suppliers/<int:id>/purchases", methods=["GET"])
@jwt_required()
def supplier_purchases(id):

    purchases = Purchase.query.filter_by(supplier_id=id)\
        .order_by(Purchase.created_at.desc()).all()

    result = []

    for p in purchases:

        items = PurchaseItem.query.filter_by(purchase_id=p.id).all()

        product_list = []

        for item in items:
            product = Product.query.get(item.product_id)

            product_list.append({
                "product": product.name,
                "quantity": item.quantity,
                "cost": item.cost_price,
                "subtotal": item.subtotal
            })

        result.append({
            "purchase_id": p.id,
            "total": p.total_amount,
            "date": p.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            "items": product_list
        })

    return jsonify({"purchases": result}), 200    



@auth_bp.route("/purchase/<int:id>/invoice", methods=["GET"])
@jwt_required()
def purchase_invoice(id):

    purchase = Purchase.query.get(id)

    if not purchase:
        return jsonify({"message": "Purchase not found"}), 404

    supplier = Supplier.query.get(purchase.supplier_id)
    items = PurchaseItem.query.filter_by(purchase_id=id).all()

    buffer = io.BytesIO()

    p = canvas.Canvas(buffer, pagesize=letter)

    y = 750

    p.setFont("Helvetica-Bold", 18)
    p.drawString(200, y, "Purchase Invoice")

    y -= 40
    p.setFont("Helvetica", 12)

    p.drawString(50, y, f"Supplier: {supplier.name}")
    y -= 20
    p.drawString(50, y, f"Date: {purchase.created_at}")

    y -= 40
    p.drawString(50, y, "Product")
    p.drawString(250, y, "Qty")
    p.drawString(320, y, "Cost")
    p.drawString(400, y, "Total")

    y -= 20

    for item in items:

        product = Product.query.get(item.product_id)

        p.drawString(50, y, product.name)
        p.drawString(250, y, str(item.quantity))
        p.drawString(320, y, str(item.cost_price))
        p.drawString(400, y, str(item.subtotal))

        y -= 20

    y -= 20

    p.drawString(50, y, f"Total Amount: ₹{purchase.total_amount}")

    p.save()

    buffer.seek(0)

    return send_file(
        buffer,
        as_attachment=True,
        download_name=f"purchase_{id}.pdf",
        mimetype="application/pdf"
    )    


@auth_bp.route("/customers", methods=["POST"])
@jwt_required()
def add_customer():

    data = request.get_json()

    customer = Customer(
        name=data.get("name"),
        phone=data.get("phone"),
        email=data.get("email"),
        address=data.get("address")
    )

    db.session.add(customer)
    db.session.commit()

    return jsonify({"message": "Customer added"}), 201


@auth_bp.route("/customers", methods=["GET"])
@jwt_required()
def get_customers():

    customers = Customer.query.all()

    result = []

    for c in customers:
        result.append({
            "id": c.id,
            "name": c.name,
            "phone": c.phone,
            "email": c.email,
            "address": c.address
        })

    return jsonify({"customers": result}), 200


@auth_bp.route("/customers/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_customer(id):

    customer = Customer.query.get(id)

    if not customer:
        return jsonify({"message":"Customer not found"}),404

    db.session.delete(customer)
    db.session.commit()

    return jsonify({"message":"Customer deleted"})    


@auth_bp.route("/customers/<int:id>", methods=["PUT"])
@jwt_required()
def update_customer(id):

    customer = Customer.query.get(id)

    if not customer:
        return jsonify({"message": "Customer not found"}), 404

    data = request.get_json()

    customer.name = data.get("name")
    customer.phone = data.get("phone")
    customer.email = data.get("email")
    customer.address = data.get("address")

    db.session.commit()

    return jsonify({"message": "Customer updated successfully"})    


@auth_bp.route("/users", methods=["GET"])
@jwt_required()
@admin_required
def get_users():

    users = User.query.all()

    result = []

    for user in users:
        result.append({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role.role_name
        })

    return jsonify({"users": result}), 200



@auth_bp.route("/users", methods=["POST"])
@jwt_required()
@admin_required
def add_user():

    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role_name = data.get("role")

    if not name or not email or not password:
        return jsonify({"message": "Missing fields"}), 400

    # find role object
    role = Role.query.filter_by(role_name=role_name).first()

    if not role:
        return jsonify({"message": "Invalid role"}), 400

    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

    new_user = User(
        name=name,
        email=email,
        password=hashed.decode("utf-8"),
        role_id=role.id
    )

    db.session.add(new_user)
    db.session.commit()
    log_activity(f"Created user {name}")

    return jsonify({"message": "User created"}), 201



@auth_bp.route("/users/<int:user_id>", methods=["DELETE"])
@jwt_required()
@admin_required
def delete_user(user_id):

    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    db.session.delete(user)
    db.session.commit()

    return jsonify({"message": "User deleted"}), 200    


@auth_bp.route("/activity-logs", methods=["GET"])
@jwt_required()
@admin_required
def get_logs():

    logs = ActivityLog.query.order_by(ActivityLog.created_at.desc()).limit(50).all()

    result = []

    for log in logs:
        result.append({
            "id": log.id,
            "user": log.user.name,
            "action": log.action,
            "date": log.created_at.strftime("%Y-%m-%d %H:%M:%S")
        })

    return jsonify({"logs": result}), 200