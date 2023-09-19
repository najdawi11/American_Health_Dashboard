# Load libraries
import flask
import pandas as pd
import tensorflow as tf
import keras
from keras.models import load_model


global graph

def auc(y_true, y_pred):
    auc = tf.metrics.auc(y_true, y_pred)[1]
    keras.backend.get_session().run(tf.local_variables_initializer())
    return auc
graph = tf.Graph()
model = load_model('example.h5', custom_objects={'auc': auc})

json_in=[
    {"Age": 85, "Sex": "male", "Embarked": "S"},
    {"Age": 24, "Sex": "female", "Embarked": "C"},
    {"Age": 3, "Sex": "female", "Embarked": "C"},
    {"Age": 21, "Sex": "male", "Embarked": "S"}
]

data = {"success": False}

params = json_in
if (params == None):
    params = ''

# if parameters are found, return a prediction
if (params != None):
    x=pd.DataFrame.from_dict(params)
    x=pd.get_dummies(x)
    model_columns = ['Age', 'Embarked_C', 'Embarked_Q', 'Embarked_S', 'Embarked_nan',
       'Sex_male'] # Load "model_columns.pkl"
    x= x.reindex(columns=model_columns, fill_value=0)

    print ('Model columns loaded')
    # print(x.(0))
    print(model.predict(x))
    # with graph.as_default():

    #     x["prediction"] = str(model.predict(x)[0][0])
    #     x["success"] = True
