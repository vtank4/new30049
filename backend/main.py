from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
from tensorflow.keras.models import load_model
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

app = FastAPI()

# CORS Middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this to restrict origins as needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the new request body model
class PredictionRequest(BaseModel):
    Distance: float
    BuildingArea: float
    CouncilArea: str
    Regionname: str
    Method: str
    SellerG: str
    Suburb: str
    Landsize: float
    Type: str  # This should match the model type names

# Load models
models = {
    "xgboost": joblib.load('xgboost_model.joblib'),  # Load XGBoost model
    "random_forest": joblib.load('random_forest_model.joblib'),  # Load Random Forest model
    "neural_net": load_model('neural_network_model.h5')  # Load Neural Network model
}

# Load the preprocessor for the neural network
neural_net_preprocessor = joblib.load('nn_preprocessor.joblib')  

@app.post("/predict")
async def predict_price(input_data: PredictionRequest):
    try:
        # Prepare input data for prediction
        input_features = {
            'Distance': input_data.Distance,
            'BuildingArea': input_data.BuildingArea,
            'CouncilArea': input_data.CouncilArea,
            'Regionname': input_data.Regionname,
            'Method': input_data.Method,
            'SellerG': input_data.SellerG,
            'Suburb': input_data.Suburb,
            'Landsize': input_data.Landsize,
            'Type': input_data.Type
        }

        # Convert to DataFrame for better compatibility with preprocessors
        input_df = pd.DataFrame([input_features])

        # Select the model to use based on input Type
        selected_model = models.get(input_data.Type.lower())  # Ensure case-insensitive match
        if selected_model is None:
            raise HTTPException(status_code=400, detail="Invalid model type selected")

        # Check if the selected model is the neural network
        if input_data.Type.lower() == "neural_net":
            # Transform data using the neural network preprocessor
            transformed_data = neural_net_preprocessor.transform(input_df)
            predicted_price = selected_model.predict(transformed_data)
        else:
            # For other models, just predict directly
            predicted_price = selected_model.predict(input_df)

        return {"predicted_price": predicted_price.tolist()}

    except Exception as e:
        # Log the exception for debugging
        print(f"Error: {e}")  # Detailed error logging
        raise HTTPException(status_code=500, detail="An error occurred while predicting the price.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
