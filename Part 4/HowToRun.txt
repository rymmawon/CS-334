1. 
python -m venv .venv
# For Mac or Linux:
source .venv/bin/activate
# For Windows:
.venv\Scripts\activate

2.
pip install -r requirements.txt

3. 
pip install flask-migrate

4. 
python init_db.py

5.
python run.py

6. 
http://172.20.10.2:5001 or whatever the server

# for manager:
http://172.20.10.2:5001/admin/orders 

email: manager@teashop.com
password: admin123
