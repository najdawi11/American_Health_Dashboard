# Import dependencies
import pandas as pd
import numpy as np
from sodapy import Socrata

# Initialize the Socrata client
client = Socrata("data.cdc.gov", "RR1JGCh5rZDwjeVYEvT9cDvj6")

# Define the dataset ID for the CDC dataset you want to access
#dataset_id = "your_dataset_id_here"

# Query the data
results22 = client.get("epbn-9bv3", limit=500000)

# Process the data as needed
# Example: Print the first 10 records
for record in results[:10]:
    print(record)

from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import confusion_matrix, classification_report

knn = KNeighborsClassifier(n_neighbors=3)
X = checkup_df.copy()
X.drop(['stateabbr_x','statedesc_x','locationname','datasource_x','category_x','measure_x','data_value_unit_x',
        'data_value_type_x','low_confidence_limit_x','high_confidence_limit_x','totalpopulation_x','geolocation_x','short_question_text_x',
        'low_confidence_limit_y','high_confidence_limit_y','short_question_text_y','y'],axis=1, inplace=True)

y = checkup_df['y'].values

X_train, X_test, y_train, y_test = train_test_split(X,y,random_state=78)

scaler = StandardScaler()
X_scaler = scaler.fit(X_train)
X_train_scaled = X_scaler.transform(X_train)
X_test_scaled = X_scaler.transform(X_test)

knn.fit(X_train_scaled,y_train)

prediction = knn.predict(X_test_scaled)

print(accuracy_score(y_test,prediction))
print(confusion_matrix(prediction,y_test))
print(classification_report(y_test,prediction))

# Save your model
import joblib
joblib.dump(knn, 'model.pkl')
print("Model dumped!")

# Load the model that you just saved
lr = joblib.load('model.pkl')

# Saving the data columns from training
model_columns = list(X_train.columns)
joblib.dump(model_columns, 'model_columns.pkl')
print("Models columns dumped!")