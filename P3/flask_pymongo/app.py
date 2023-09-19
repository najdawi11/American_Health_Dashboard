from flask import Flask, render_template, jsonify
from bson import json_util
from pymongo import MongoClient
import pandas as pd
import pprint
from flask_cors import CORS, cross_origin
app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
client = MongoClient('mongodb://localhost:27017/')
db = client['Project3']
collection = db['data1']

@app.route('/')
def home():
    # Fetch data from MongoDB
    print('welcome to our website')
    return "Welcome to our 'Home' page! please use this link to see the data: http://127.0.0.1:5000/api/data"

@app.route('/api/data')
def get_data():
    # Fetch data from MongoDB
    data = list(collection.find({}))  # Retrieve all documents from the 'data1' collection

    # Return data as JSON using bson.json_util.dumps() 
    return json_util.dumps(data)

if __name__ == '__main__':
    app.run(debug=True)