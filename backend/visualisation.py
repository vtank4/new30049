import pandas as pd
import folium
from folium.plugins import MarkerCluster

def load_data(filepath):
    """ Load the normalized data from a CSV file. """
    return pd.read_csv(filepath)

def create_price_scatter_map(data, output_filename):
    """ Create a scatter map with price data using Folium. """
    # Calculate the center of the map
    center_lat = data['Lattitude'].mean()
    center_lon = data['Longtitude'].mean()
    
    # Create a Folium map
    m_scatter = folium.Map(location=[center_lat, center_lon], zoom_start=11)
    
    # Add a marker cluster to the map
    marker_cluster = MarkerCluster().add_to(m_scatter)
    
    # Loop through the data and create markers colored by price per sqm
    for _, row in data.iterrows():
        # Choose a color based on the price per sqm
        price = row['Price_per_sqm']
        color = 'lightred' if price < 8000 else 'red' if price < 12000 else 'darkred'
        
        # Add the marker to the map with the corresponding color
        folium.CircleMarker(
            location=(row['Lattitude'], row['Longtitude']),
            radius=5,
            color=color,
            fill=True,
            fill_opacity=0.7,
            popup=f"Suburb: {row['Suburb']}, Price/sqm: ${price:.2f}"
        ).add_to(marker_cluster)
    
    # Save the map to an HTML file
    m_scatter.save(output_filename)
    print(f"Map saved as {output_filename}")

if __name__ == '__main__':
    # Load data from a CSV file
    data = load_data('4normalized_data.csv')  # Update with your actual file path
    
    # Create and save the map
    create_price_scatter_map(data, 'price_scatter_map.html')
