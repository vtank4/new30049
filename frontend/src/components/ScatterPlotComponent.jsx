import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import dataCBD from '../data/denormalized_price_cbd.json'; // CBD dataset (Distance to CBD and Price)
import dataLandsize from '../data/denormalized_price_landsize.json'; // Landsize dataset (Landsize and Price)

const ScatterPlotComponent = () => {
    const [currentData, setCurrentData] = useState(dataCBD); // Default dataset is CBD
    const [xField, setXField] = useState('CBD Distance'); // Default x-axis field
    const [yField, setYField] = useState('Price'); // y-axis field remains as Price
    const [isCBD, setIsCBD] = useState(true); // Boolean to toggle between datasets (CBD or Landsize)

    const margin = { top: 20, right: 30, bottom: 70, left: 150 }; // Increased bottom and right margins
    const width = 800 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    useEffect(() => {
        // Set up SVG dimensions and groups
        const svg = d3.select("#scatterPlot")
            .append("svg")
            .attr("width", width + margin.left + margin.right)  // SVG width with margins
            .attr("height", height + margin.top + margin.bottom) // SVG height with margins
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Scales for x, y axes, and colors
        const xScale = d3.scaleLinear().range([0, width]); // Linear scale for x-axis
        const yScale = d3.scaleLinear().range([height, 0]); // Linear scale for y-axis
        const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

         // Axes for the scatter plot
        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);

        // Add x-axis and y-axis groups to the SVG
        svg.append("g").attr("class", "x-axis").attr("transform", `translate(0,${height})`);
        svg.append("g").attr("class", "y-axis");

        // Add axis labels
        svg.append("text")
            .attr("class", "x-axis-label axis-label")
            .attr("x", width / 2)
            .attr("y", height + 50)
            .attr("text-anchor", "middle");

        svg.append("text")
            .attr("class", "y-axis-label axis-label")
            .attr("x", -height / 2)
            .attr("y", -120)
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)");

        // Tooltip setup for interactivity
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("display", "none") // Initially hidden
            .style("position", "absolute")
            .style("background", "white")
            .style("border", "1px solid black")
            .style("padding", "10px")
            .style("border-radius", "5px")
            .style("pointer-events", "none"); // Tooltip style settings

       // Function to update chart when data changes
        const updateChart = (data) => {
            // Update x and y scales based on data range
            xScale.domain(d3.extent(data, d => d[xField])); 
            yScale.domain(d3.extent(data, d => d[yField]));

            // Update axes
            svg.select(".x-axis").transition().duration(1000).call(xAxis);
            svg.select(".y-axis").transition().duration(1000).call(yAxis);

            // Update axis labels
            svg.select(".x-axis-label").text(xField);
            svg.select(".y-axis-label").text(yField);

            // Bind data to circles
            const circles = svg.selectAll("circle").data(data);

            // Enter new circles, update existing, and position based on data
            circles.enter().append("circle")
                .attr("data-cluster", d => d.kmeans_3) // Add data attribute for cluster
                .attr("fill", d => colorScale(d.kmeans_3))
                .attr("r", 5) // Reduced radius to prevent overlap
                .merge(circles)
                .transition()
                .duration(1000)
                .attr("cx", d => xScale(d[xField]))
                .attr("cy", d => yScale(d[yField]));

            // Remove extra circles not in new dataset
            circles.exit().remove();

            // Add interactivity with detailed tooltip
            svg.selectAll("circle")
                .on("mouseover", function (event, d) {
                    d3.select(this)
                        .transition()
                        .duration(100)
                        .attr("r", 8) // Increase on hover for emphasis
                        .attr("stroke", "black")
                        .attr("stroke-width", 2);
                    tooltip.style("display", "block")
                        .html(`
                            <strong>Cluster:</strong> ${d.kmeans_3}<br>
                            <strong>${xField}:</strong> ${d[xField]}<br>
                            <strong>${yField}:</strong> ${d[yField].toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                        `); // Tooltip details
                })
                .on("mousemove", function (event) {
                    tooltip.style("left", (event.pageX + 15) + "px")
                        .style("top", (event.pageY - 28) + "px"); // Position tooltip
                })
                .on("mouseout", function () {
                    d3.select(this)
                        .transition()
                        .duration(100)
                        .attr("r", 5) // Reset size on mouse out
                        .attr("stroke", "none");
                    tooltip.style("display", "none"); // Hide tooltip
                });

            // Cluster selection legend
            const clusters = [...new Set(data.map(d => d.kmeans_3))]; // Unique cluster groups

            const legend = svg.append("g")
                .attr("transform", `translate(${width - 150}, 10)`); // Position legend

            clusters.forEach((cluster, index) => {
                // Legend item for each cluster
                legend.append("rect")
                    .attr("x", 0)
                    .attr("y", index * 25)
                    .attr("width", 20)
                    .attr("height", 20)
                    .attr("fill", colorScale(cluster))
                    .on("click", () => handleClusterClick(cluster)); // Filter on click

                legend.append("text")
                    .attr("x", 30)
                    .attr("y", index * 25 + 15)
                    .text(`Group ${cluster}`)
                    .style("cursor", "pointer"); // Cluster label
            });
        };

        // Function to handle cluster filtering
        const handleClusterClick = (cluster) => {
            const isActive = svg.selectAll("circle").filter(d => d.kmeans_3 === cluster).classed("highlighted");

            // Dim non-selected clusters
            svg.selectAll("circle")
                .transition()
                .duration(500)
                .attr("opacity", isActive ? 1 : 0.2); // Fade out others if this is active

            svg.selectAll("circle.highlighted")
                .classed("highlighted", false);

            // Highlight selected cluster
            if (!isActive) {
                svg.selectAll(`circle[data-cluster='${cluster}']`)
                    .classed("highlighted", true)
                    .transition()
                    .duration(500)
                    .attr("opacity", 1); // Bring back highlighted ones
            }
        };

        // Initial chart load with the current data
        updateChart(currentData);

        // Zoom functionality for the scatter plot
        const zoomHandler = d3.zoom()
            .scaleExtent([1, 10]) // Set the zoom limits
            .on("zoom", (event) => {
                const new_xScale = event.transform.rescaleX(xScale);
                const new_yScale = event.transform.rescaleY(yScale);

                svg.selectAll("circle")
                    .attr("cx", d => new_xScale(d[xField]))
                    .attr("cy", d => new_yScale(d[yField]));

                svg.select(".x-axis").call(xAxis.scale(new_xScale));
                svg.select(".y-axis").call(yAxis.scale(new_yScale));
            });

        svg.call(zoomHandler);

        // Cleanup on component unmount
        return () => {
            d3.select("#scatterPlot").select("svg").remove();
        };
    }, [currentData, xField, yField]); // Depend on currentData, xField, and yField

    // Switch datasets between CBD and Landsize
    const handleSwitchData = () => {
        if (isCBD) {
            setCurrentData(dataLandsize);
            setXField('Landsize'); // Update xField for Landsize
        } else {
            setCurrentData(dataCBD);
            setXField('CBD Distance'); // Update xField for CBD
        }
        setIsCBD(!isCBD); // Toggle the dataset state
    };

    // Reset button to clear any filters
    const handleReset = () => {
        d3.selectAll("circle")
            .transition()
            .duration(500)
            .attr("opacity", 1); // Show all points
    };

    return (
        <div>
            <h1>Scatter plot for housing market distributions</h1>
            <button onClick={handleSwitchData}>
                Switch to {isCBD ? "Landsize" : "CBD"} Data
            </button>
            <button onClick={handleReset}>
                Reset Filter
            </button>
            <div id="scatterPlot"></div>
        </div>
    );
};

export default ScatterPlotComponent;
