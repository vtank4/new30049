import sys
sys.dont_write_bytecode = True
import json
import os
import uvicorn
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np

# Initialize FastAPI app globally
app = FastAPI()

# CORS configuration to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to your frontend origin if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define Pydantic model for input validation
class PropertyData(BaseModel):
    cbd_distance: float
    bedroom: int
    bathroom: int
    car_garage: int
    landsize: float
    building_area: float
    built_year: int = 2024
    suburb_name: str = 'Other'
    prop_type: str = 'u'

# Class for handling the property price model
class PropertyPriceModel:
    def __init__(self):
        # Load the Random Forest model from a joblib file
        self.model = joblib.load("random_forest_model.joblib")

    def predict_price(self, input_data):
        # Prepare the input data as a numpy array
        input_features = np.array([
            input_data['cbd_distance'],
            input_data['bedroom'],
            input_data['bathroom'],
            input_data['car_garage'],
            input_data['landsize'],
            input_data['building_area'],
            input_data['built_year'],
        ]).reshape(1, -1)  # Reshape for a single sample
        
        # Make the prediction using the Random Forest model
        predicted_price = self.model.predict(input_features)
        return predicted_price[0]  # Return the predicted price

# Initialize the property price model
property_price_model = PropertyPriceModel()

# Prediction history file
PREDICTION_FILE = "predictions.json"

# Function to save predictions to a JSON file
def save_prediction_to_json(input_data, predicted_price):
    if os.path.exists(PREDICTION_FILE):
        try:
            with open(PREDICTION_FILE, "r") as f:
                data = json.load(f)
        except json.JSONDecodeError:
            data = []
    else:
        data = []

    # Determine ID for each record
    new_id = len(data) + 1

    # Append new prediction data
    new_entry = {
        "id": new_id,
        "house_data": input_data,
        "predicted_price": round(predicted_price, 2)
    }
    data.append(new_entry)

    # Write the updated data back to the JSON file
    with open(PREDICTION_FILE, "w") as f:
        json.dump(data, f, indent=4)

# Endpoint for predicting house prices
@app.post("/predict")
async def predict_price(property_data: PropertyData):
    input_data = property_data.dict()
    predicted_price = property_price_model.predict_price(input_data)
    save_prediction_to_json(input_data, predicted_price)
    return {"predicted_price": round(predicted_price, 2)}

# Endpoint for fetching all predictions
@app.get("/prediction-history/")
async def get_predictions():
    try:
        if os.path.exists(PREDICTION_FILE):
            with open(PREDICTION_FILE, "r") as f:
                predictions = json.load(f)
            return {"predictions": predictions}
        else:
            return {"predictions": []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Custom 404 error handler
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

# Entry point for running the FastAPI app
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
