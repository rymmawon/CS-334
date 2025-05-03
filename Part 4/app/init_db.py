from app import create_app, db
from app.models.models import Product

def init_db():
    app = create_app()
    with app.app_context():
        db.create_all()
        if Product.query.first() is None:
            # Initial products
            products = [
                {
                    'name': 'Black Tea',
                    'price': 8.99,
                    'stock': 100,
                    'image_url': 'images/tea-1.jpg'
                },
                {
                    'name': 'Green Tea',
                    'price': 10.99,
                    'stock': 100,
                    'image_url': 'images/tea-2.jpg'
                },
                {
                    'name': 'White Tea',
                    'price': 12.50,
                    'stock': 100,
                    'image_url': 'images/tea-3.jpg'
                },
                {
                    'name': 'Chamomile Tea',
                    'price': 7.99,
                    'stock': 100,
                    'image_url': 'images/tea-4.jpg'
                },
                {
                    'name': 'Mint Tea',
                    'price': 6.99,
                    'stock': 100,
                    'image_url': 'images/tea-5.jpg'
                },
                {
                    'name': 'Hibiscus Tea',
                    'price': 8.50,
                    'stock': 0,
                    'image_url': 'images/tea-6.jpg'
                },
                {
                    'name': 'Oolong Tea',
                    'price': 14.99,
                    'stock': 100,
                    'image_url': 'images/tea-7.jpg'
                },
                {
                    'name': 'Matcha Tea',
                    'price': 18.99,
                    'stock': 100,
                    'image_url': 'images/tea-8.jpg'
                }
            ]
            
            # Add products to database
            for product_data in products:
                product = Product(**product_data)
                db.session.add(product)
            db.session.commit()
            print("Database initialized with initial products!")

if __name__ == '__main__':
    init_db() 