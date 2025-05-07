from flask import Flask, render_template, send_from_directory

appl = Flask(__name__)

@appl.route('/')
@appl.route("/index.html")
def index():
    return render_template('index.html')

@appl.route('/Manifest.json')
def manifest():
    return send_from_directory('static', '../Manifest.json')

@appl.route('/serviceWorker.js')
def sw_js():
    return send_from_directory('static', '../serviceWorker.js')

if __name__ == '__main__':
    appl.run(debug=True)