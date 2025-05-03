from flask import Blueprint, render_template, request

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
    return render_template('admin_login.html')

@bp.route('/admin/register')
def admin_register():
    return render_template('admin_register.html')

# Catch-all route for debugging
@bp.route('/<path:path>')
def catch_all(path):
    print(f"404: Requested path: {path}")
    return f"404: Path not found: {path}", 404 