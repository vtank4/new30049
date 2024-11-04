import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from xgboost import XGBRegressor
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
import joblib

# Load the dataset
file_path = 'Melbourne_housing_FULL.csv'
housing_data = pd.read_csv(file_path)

# Data cleaning and feature engineering
housing_data.replace([np.inf, -np.inf], np.nan, inplace=True)
housing_data.dropna(subset=['Price', 'Lattitude', 'Longtitude', 'BuildingArea'], inplace=True)

# Remove outliers
housing_data = housing_data[housing_data['Price'] < housing_data['Price'].quantile(0.99)]
housing_data = housing_data[housing_data['Landsize'] < housing_data['Landsize'].quantile(0.99)]

# Create 'Price_per_sqm'
housing_data['Price_per_sqm'] = housing_data['Price'] / housing_data['BuildingArea']
housing_data.dropna(subset=['Price_per_sqm'], inplace=True)

# Save cleaned data
housing_data.to_csv('4cleaned_data.csv', index=False)

# Display Price Statistics
price_mean = housing_data['Price'].mean()
price_median = housing_data['Price'].median()
price_std = housing_data['Price'].std()
print(f"Price Statistics:\nMean Price: {price_mean:.2f}\nMedian Price: {price_median:.2f}\nStandard Deviation of Price: {price_std:.2f}")

# Separate features and target
features = housing_data.drop(columns=['Price'])
target = housing_data['Price']

# Fill missing values
features.fillna(features.median(numeric_only=True), inplace=True)
features.fillna(features.mode().iloc[0], inplace=True)

# Preprocessing pipeline
numeric_columns = ['Distance', 'Landsize', 'BuildingArea']
categorical_columns = ['Suburb', 'Type', 'Method', 'SellerG', 'CouncilArea', 'Regionname']

preprocessing_pipeline = ColumnTransformer(
    transformers=[
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_columns),
        ('num', StandardScaler(), numeric_columns)
    ]
)

# Split the dataset
X_train, X_test, y_train, y_test = train_test_split(features, target, test_size=0.2, random_state=42)

# XGBoost model
xgb_model = XGBRegressor(learning_rate=0.05, n_estimators=500, max_depth=6, subsample=0.8, random_state=42)
model_pipeline = Pipeline(steps=[('preprocessor', preprocessing_pipeline), ('xgb_model', xgb_model)])
model_pipeline.fit(X_train, y_train)

# Predictions
predictions = model_pipeline.predict(X_test)

# Save the model
joblib.dump(model_pipeline, 'xgboost_model.joblib')

# Model Evaluation
mse = mean_squared_error(y_test, predictions)
mae = mean_absolute_error(y_test, predictions)
rmse = np.sqrt(mse)
r2 = r2_score(y_test, predictions)

print(f'Mean Squared Error (MSE): {mse:.2f}')
print(f'Mean Absolute Error (MAE): {mae:.2f}')
print(f'Root Mean Squared Error (RMSE): {rmse:.2f}')
print(f'R² Score: {r2:.2f}')

# Feature Importance
feature_importance = model_pipeline.named_steps['xgb_model'].feature_importances_
feature_names = preprocessing_pipeline.transformers[0][1].get_feature_names_out(categorical_columns).tolist() + numeric_columns
importance_df = pd.DataFrame({'Feature': feature_names, 'Importance': feature_importance}).sort_values(by='Importance', ascending=False)

# Plotting feature importance
plt.figure(figsize=(10, 6))
plt.barh(importance_df['Feature'], importance_df['Importance'], color='skyblue')
plt.xlabel('Importance')
plt.title('Feature Importance for Housing Prices')
plt.gca().invert_yaxis()
plt.show()
