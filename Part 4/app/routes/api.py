from flask import Blueprint, request, jsonify, current_app
from app import db
from app.models.models import Product, Order, OrderItem, Manager
from app.email_utils import send_receipt
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
import jwt
from datetime import datetime, timedelta

bp = Blueprint('api', __name__)

# JWT token required decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            data = jwt.decode(token.split()[1], 'your-secret-key-here', algorithms=["HS256"])
            current_manager = Manager.query.get(data['manager_id'])
        except:
            return jsonify({'message': 'Token is invalid!'}), 401
        return f(current_manager, *args, **kwargs)
    return decorated

# Manager Authentication
@bp.route('/manager/login', methods=['POST'])
def manager_login():
    data = request.get_json()
    manager = Manager.query.filter_by(email=data['email']).first()
    if manager and check_password_hash(manager.password, data['password']):
        token = jwt.encode({
            'manager_id': manager.id,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, 'your-secret-key-here')
        return jsonify({'token': token})
    return jsonify({'message': 'Invalid credentials'}), 401

# Product Routes
@bp.route('/products', methods=['GET'])
def get_products():
    products = Product.query.all()
    return jsonify([{
        'id': p.id,
        'name': p.name,
        'price': p.price,
        'stock': p.stock,
        'image_url': p.image_url
    } for p in products])

@bp.route('/products/<int:id>', methods=['GET'])
def get_product(id):
    product = Product.query.get_or_404(id)
    return jsonify({
        'id': product.id,
        'name': product.name,
        'price': product.price,
        'stock': product.stock,
        'image_url': product.image_url
    })

@bp.route('/products', methods=['POST'])
@token_required
def create_product(current_manager):
    data = request.get_json()
    product = Product(
        name=data['name'],
        price=data['price'],
        stock=data['stock'],
        image_url=data.get('image_url')
    )
    db.session.add(product)
    db.session.commit()
    return jsonify({'message': 'Product created successfully'}), 201

@bp.route('/products/<int:id>', methods=['PUT'])
@token_required
def update_product(current_manager, id):
    product = Product.query.get_or_404(id)
    data = request.get_json()
    product.name = data.get('name', product.name)
    product.price = data.get('price', product.price)
    product.stock = data.get('stock', product.stock)
    product.image_url = data.get('image_url', product.image_url)
    db.session.commit()
    return jsonify({'message': 'Product updated successfully'})

@bp.route('/products/<int:id>', methods=['DELETE'])
@token_required
def delete_product(current_manager, id):
    product = Product.query.get_or_404(id)
    db.session.delete(product)
    db.session.commit()
    return jsonify({'message': 'Product deleted successfully'})

# Order Routes
@bp.route('/orders', methods=['POST'])
def create_order():
    data = request.get_json()
    order = Order(
        customer_name=data['customer_name'],
        email=data['email'],
        total_amount=data['total_amount']
    )
    db.session.add(order)
    db.session.commit()

    for item in data['items']:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item['product_id'],
            quantity=item['quantity'],
            price=item['price']
        )
        db.session.add(order_item)
        # Update product stock
        product = Product.query.get(item['product_id'])
        product.stock -= item['quantity']
    
    db.session.commit()
    
    try:
        send_receipt(order.email, order)
    except Exception as e:
        current_app.logger.error(f"Failed to send receipt for order {order.id}: {e}")
    return jsonify({'message': 'Order created successfully', 'order_id': order.id}), 201

@bp.route('/orders', methods=['GET'])
@token_required
def get_orders(current_manager):
    orders = Order.query.all()
    return jsonify([{
        'id': o.id,
        'customer_name': o.customer_name,
        'email': o.email,
        'total_amount': o.total_amount,
        'status': o.status,
        'created_at': o.created_at.isoformat(),
        'items': [{
            'product_id': i.product_id,
            'quantity': i.quantity,
            'price': i.price,
            'product': {
                'id': i.product.id,
                'name': i.product.name,
                'price': i.product.price,
                'image_url': i.product.image_url
            }
        } for i in o.items]
    } for o in orders])

@bp.route('/orders/<int:id>', methods=['PUT'])
@token_required
def update_order_status(current_manager, id):
    order = Order.query.get_or_404(id)
    data = request.get_json()
    order.status = data['status']
    db.session.commit()
    return jsonify({'message': 'Order status updated successfully'}) 