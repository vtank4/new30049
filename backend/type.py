import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix

# Load the dataset
file_path = '4normalized_data.csv'
data = pd.read_csv(file_path)

# Convert 'Date' to datetime object and extract the year
data['Date'] = pd.to_datetime(data['Date'], dayfirst=True)
data['Year'] = data['Date'].dt.year

# Map property type codes to full names
type_map = {'h': 'House', 't': 'Townhouse', 'u': 'Unit'}
data['Type'] = data['Type'].map(type_map)

# Convert 'Price_per_sqm' to numeric, handle infinite and missing values
data['Price_per_sqm'] = pd.to_numeric(data['Price_per_sqm'], errors='coerce')
data.replace([np.inf, -np.inf], np.nan, inplace=True)
data.dropna(subset=['Price_per_sqm'], inplace=True)

# Adding a target variable 'High_demand' that is 1 if the price is above the median, 0 otherwise
median_price = data.groupby(['Type', 'Year'])['Price_per_sqm'].transform('median')
data['High_demand'] = (data['Price_per_sqm'] > median_price).astype(int)

# Select features and target
features = ['Type','Rooms', 'Bathroom', 'Price_per_sqm']
X = pd.get_dummies(data[features], drop_first=True)  # Convert categorical data to dummy variables
y = data['High_demand']  # Target variable (1 = above median price, 0 = below)

# Split the dataset into train and test sets (80% train, 20% test)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Scale features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Train a Logistic Regression model
model = LogisticRegression()
model.fit(X_train_scaled, y_train)

# Make predictions on the test set
y_pred = model.predict(X_test_scaled)

# Evaluate the model using classification report and confusion matrix
print("Classification Report:")
print(classification_report(y_test, y_pred))

print("Confusion Matrix:")
print(confusion_matrix(y_test, y_pred))

# Visualize the confusion matrix
conf_matrix = confusion_matrix(y_test, y_pred)
sns.heatmap(conf_matrix, annot=True, fmt="d", cmap="Blues")
plt.title('Confusion Matrix')
plt.ylabel('True label')
plt.xlabel('Predicted label')
plt.show()

# Prepare data for exporting
average_price_by_bedroom = data.groupby(['Type', 'Rooms'])['Price_per_sqm'].mean().reset_index()
#average_price_by_bedroom.to_csv('average_price_by_bedroom.csv', index=False)

# Sales count by property type and year
sales_count = data.groupby(['Type', 'Year']).size().reset_index(name='Number of Sales')
#sales_count.to_csv('sales_count_by_type_year.csv', index=False)

# Data visualization - Price and Bedroom Count Market Performance
plt.figure(figsize=(14, 6))

palette = sns.color_palette("Set2", n_colors=len(data['Rooms'].unique()))

# Grouped bar chart for average prices by property type and bedroom count
plt.subplot(121)
sns.barplot(x='Type', y='Price_per_sqm', hue='Rooms', data=average_price_by_bedroom, dodge=True, palette=palette)
plt.title('Property Type and Bedroom Count Market Performance Overall')
plt.xlabel('Property Type')
plt.ylabel('Average Price per Square Meter')
plt.legend(title='Number of Bedrooms', bbox_to_anchor=(1.05, 1), loc='upper left')

# Visualization for the number of sales by property type and year
plt.subplot(122)
sns.barplot(x='Year', y='Number of Sales', hue='Type', data=sales_count, palette="viridis")
plt.title('Number of Sales by Property Type Overall')
plt.xlabel('Year')
plt.ylabel('Number of Sales')

plt.tight_layout()
plt.show()


