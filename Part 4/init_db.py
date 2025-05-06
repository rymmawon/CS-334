from app import create_app, db
from app.models.models import Product, Manager
from werkzeug.security import generate_password_hash

app = create_app()

with app.app_context():
    # Create all tables
    db.create_all()
    # Create a manager account
    if not Manager.query.filter_by(email='manager@teashop.com').first():
        manager = Manager(
            name='Admin Manager',
            email='manager@teashop.com',
            password=generate_password_hash('admin123')
        )
        db.session.add(manager)
        db.session.commit()
    # Add demo products
    if not Product.query.first():
        products = [
            {
                'name': 'Black Tea',
                'price': 12.99,
                'stock': 100,
                'image_url': '/static/images/tea-1.jpg'
            },
            {
                'name': 'Green Tea',
                'price': 14.99,
                'stock': 75,
                'image_url': '/static/images/tea-2.jpg'
            },
            {
                'name': 'White Tea',
                'price': 16.99,
                'stock': 50,
                'image_url': '/static/images/tea-3.jpg'
            },
            {
                'name': 'Camomile Tea',
                'price': 16.99,
                'stock': 50,
                'image_url': '/static/images/tea-4.jpg'
            },
            {
                'name': 'Peppermint Tea',
                'price': 16.99,
                'stock': 50,
                'image_url': '/static/images/tea-5.jpg'
            },
            {
                'name': 'Rhubarb Tea',
                'price': 16.99,
                'stock': 50,
                'image_url': '/static/images/tea-6.jpg'
            },
            {
                'name': 'Oolong Tea',
                'price': 16.99,
                'stock': 50,
                'image_url': '/static/images/tea-7.jpg'
            },
            {
                'name': 'Matcha Tea',
                'price': 16.99,
                'stock': 50,
                'image_url': '/static/images/tea-8.jpg'
            }
        ]

        for product_data in products:
            product = Product(**product_data)
            db.session.add(product)
        
        db.session.commit()

    print("Database initialized with initial data!") 