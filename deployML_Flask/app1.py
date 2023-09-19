from flask import Flask, jsonify
from sodapy import Socrata

app = Flask(__name__)

# Socrata API client initialization
client = Socrata("data.cdc.gov", "RR1JGCh5rZDwjeVYEvT9cDvj6")

# Define the dataset IDs for the CDC datasets you want to access
dataset_id22 = "epbn-9bv3"
dataset_id23 = "eav7-hnsx"

@app.route('/api/cdc-data22')
def get_cdc_data22():
    try:
        # Query the data from the 2022 dataset
        results1 = client.get(dataset_id22, limit=500000)
        data1 = results1[:10]

        # Return a valid response tuple (body, status)
        return jsonify(data1), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/cdc-data23')
def get_cdc_data23():
    try:
        # Query the data from the 2023 dataset
        results2 = client.get(dataset_id23, limit=500000)
        data2 = results2[:10]

        # Return a valid response tuple (body, status)
        return jsonify(data2), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
