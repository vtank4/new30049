import pandas as pd
from sklearn.model_selection import train_test_split, GridSearchCV, cross_val_score
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
import joblib
import matplotlib.pyplot as plt

# Load the dataset
data = pd.read_csv('data.csv')

# Print the columns to verify the column names
print("Columns in the dataset:", data.columns)

# Check for missing values
if data.isnull().sum().any():
    print("Missing values found in the dataset. Please handle them before proceeding.")

# Assuming the target variable is 'median_price' and the rest are features
if 'median_price' not in data.columns:
    raise KeyError("The column 'median_price' is not found in the dataset. Please check the column names.")

X = data.drop('median_price', axis=1)
y = data['median_price']

# Convert categorical variables to dummy variables
X = pd.get_dummies(X, drop_first=True)

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Hyperparameter tuning using GridSearchCV
param_grid = {
    'n_estimators': [100, 200, 300],
    'max_depth': [10, 20, 30],
    'min_samples_split': [2, 5, 10]
}

grid_search = GridSearchCV(estimator=RandomForestRegressor(random_state=42), param_grid=param_grid, cv=5, n_jobs=-1, scoring='neg_mean_squared_error')
grid_search.fit(X_train, y_train)

# Best parameters from GridSearchCV
best_params = grid_search.best_params_
print(f'Best parameters: {best_params}')

# Initialize the model with the best hyperparameters
model = RandomForestRegressor(**best_params, random_state=42)

# Cross-validation scores
cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring='neg_mean_squared_error')
print(f'Cross-validation MSE scores: {-cv_scores}')
print(f'Average cross-validation MSE: {-cv_scores.mean()}')
print(f'Standard Deviation of cross-validation MSE: {cv_scores.std()}')

# Train the model
model.fit(X_train, y_train)

# Save the model
joblib.dump(model, 'random_forest_model.joblib')

# Make predictions
y_pred = model.predict(X_test)

# Calculate metrics
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)
mae = mean_absolute_error(y_test, y_pred)
rmse = mse ** 0.5  # Calculate RMSE
mean_price = y_test.mean()
predicted_mean_price = y_pred.mean()

# Print the results
print(f'Mean Squared Error: {mse}')
print(f'Root Mean Squared Error: {rmse}')
print(f'R^2 Score: {r2}')
print(f'Mean Absolute Error: {mae}')
print(f'Mean Actual Price: {mean_price}')
print(f'Mean Predicted Price: {predicted_mean_price}')

# Feature importance
feature_importances = model.feature_importances_
features = X.columns
importance_df = pd.DataFrame({'Feature': features, 'Importance': feature_importances})

# Print feature importance
print(importance_df.sort_values(by='Importance', ascending=False))

# Visualize feature importance
plt.figure(figsize=(10, 6))
plt.barh(importance_df['Feature'], importance_df['Importance'], color='skyblue')
plt.xlabel('Importance')
plt.title('Feature Importance for Median Price Prediction')
plt.gca().invert_yaxis()
plt.show()
