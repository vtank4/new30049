import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error, explained_variance_score
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, BatchNormalization, Dropout
from tensorflow.keras.regularizers import l2
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.losses import MeanSquaredError

# Load the dataset
data = pd.read_csv('housepricesdata.csv', names=['year', 'suburb', 'type', 'median_price', 'transaction_count'])

# Check for NaN values
print("Checking for NaN values in the dataset:")
print(data.isna().sum())

# Drop rows with NaN values in 'median_price'
data = data.dropna(subset=['median_price'])

# Fill NaN values in other columns with appropriate values (e.g., 0 for transaction_count)
data['transaction_count'] = data['transaction_count'].fillna(0)

# Convert 'median_price' to numeric (float)
data['median_price'] = pd.to_numeric(data['median_price'], errors='coerce')

# Drop rows with NaN values in 'median_price' after conversion
data = data.dropna(subset=['median_price'])

# Convert 'year' to numeric (int)
data['year'] = pd.to_numeric(data['year'], errors='coerce')

# Drop rows with NaN values in 'year' after conversion
data = data.dropna(subset=['year'])

# Convert 'year' to integer
data['year'] = data['year'].astype(int)

# Handle outliers by capping the 'median_price' at the 99th percentile
upper_limit = data['median_price'].quantile(0.99)
data['median_price'] = np.where(data['median_price'] > upper_limit, upper_limit, data['median_price'])

# Feature Engineering: Create new features
data['property_age'] = 2023 - data['year']

# Print basic statistics of the dataset
print(data.describe())

# Print the first few rows of the dataset
print(data.head())

# Print the columns to verify the column names
print("Columns in the dataset:", data.columns)

# Assuming the target variable is 'median_price' and the rest are features
if 'median_price' not in data.columns:
    raise KeyError("The column 'median_price' is not found in the dataset. Please check the column names.")

X = data.drop('median_price', axis=1)
y = data['median_price']

# Define the preprocessing steps
numeric_features = ['year', 'transaction_count', 'property_age']
categorical_features = ['suburb', 'type']

preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numeric_features),
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
    ])

# Preprocess the data
X = preprocessor.fit_transform(X)

# Normalize the target variable
scaler_y = StandardScaler()
y = scaler_y.fit_transform(y.values.reshape(-1, 1)).flatten()

# Define the model architecture
def create_model():
    model = Sequential([
        Dense(64, input_shape=(X.shape[1],), activation='relu', kernel_regularizer=l2(0.01)),
        BatchNormalization(),
        Dropout(0.3),
        Dense(32, activation='relu', kernel_regularizer=l2(0.01)),
        BatchNormalization(),
        Dropout(0.3),
        Dense(1, activation='linear')
    ])
    model.compile(optimizer=Adam(learning_rate=0.001), loss=MeanSquaredError())
    return model

# Train the model on the entire dataset
model = create_model()
model.fit(X, y, epochs=100, batch_size=32, validation_split=0.2, verbose=1)

import joblib
model.save('neural_network_model.h5')
joblib.dump(preprocessor, 'nn_preprocessor.joblib')
joblib.dump(scaler_y, 'nn_scaler_y.joblib')

# Make predictions for the entire dataset
y_pred = model.predict(X)

# Inverse transform the predictions and actual values
y_inv = scaler_y.inverse_transform(y.reshape(-1, 1)).flatten()
y_pred_inv = scaler_y.inverse_transform(y_pred).flatten()

# Calculate additional metrics
r2 = r2_score(y_inv, y_pred_inv)
mae = mean_absolute_error(y_inv, y_pred_inv)
rmse = np.sqrt(mean_squared_error(y_inv, y_pred_inv))
explained_var = explained_variance_score(y_inv, y_pred_inv)

# Print the results
print(f'R^2 Score: {r2}')
print(f'Mean Absolute Error: {mae}')
print(f'Root Mean Squared Error: {rmse}')
print(f'Explained Variance Score: {explained_var}')

# Make predictions for each unique suburb
unique_suburbs = data['suburb'].unique()
predictions = {}

for suburb in unique_suburbs:
    suburb_data = data[data['suburb'] == suburb]
    if not suburb_data.empty:
        X_suburb = suburb_data.drop('median_price', axis=1)
        X_suburb = preprocessor.transform(X_suburb)
        y_pred = model.predict(X_suburb)
        y_pred_inv = scaler_y.inverse_transform(y_pred).flatten()
        predictions[suburb] = y_pred_inv.mean()

# Print the predicted prices for each suburb
for suburb, price in predictions.items():
    print(f"Neural Network predicted average price for {suburb}: is {price}")