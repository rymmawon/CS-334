from app import create_app, db
from app.models.models import Manager
from werkzeug.security import generate_password_hash

app = create_app()

with app.app_context():
    # Delete existing manager if exists
    Manager.query.filter_by(email='manager@teashop.com').delete()
    db.session.commit()
    # Create new manager
    manager = Manager(
        name='Admin Manager',
        email='manager@teashop.com',
        password=generate_password_hash('admin123')
    )
    db.session.add(manager)
    db.session.commit()
    print('Manager created successfully!') 