from flask import Blueprint, render_template, request, send_from_directory
import os

bp = Blueprint('main', __name__)

@bp.route('/')
def index():
    return render_template('index.html')

@bp.route('/shop')
def shop():
    return render_template('shop.html')

@bp.route('/cart')
def cart():
    return render_template('cart.html')

@bp.route('/contact')
def contact():
    return render_template('contact.html')

# Admin routes
@bp.route('/admin/dashboard')
def admin_dashboard():
    return render_template('admin_dashboard.html')

@bp.route('/admin/items')
def items():
    return render_template('items.html')

@bp.route('/admin/orders')
def orders():
    return render_template('orders.html')

@bp.route('/admin/login')
def admin_login():
    print("Admin login route accessed")  # Debug print
    return render_template('admin_login.html')

@bp.route('/admin/register')
def admin_register():
    return render_template('admin_register.html')

# Catch-all route for debugging
@bp.route('/<path:path>')
def catch_all(path):
    if path.startswith('static/') or path.startswith('images/'):
        static_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'static')
        file_path = path[7:] if path.startswith('static/') else path
        if os.path.isfile(os.path.join(static_path, file_path)):
            return send_from_directory(static_path, file_path)
    print(f"404: Requested path: {path}")  # Debug print
    return f"404: Path not found: {path}", 404 