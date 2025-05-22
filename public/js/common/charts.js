/**
 * Chart.js utilities for use across the application
 */
const ChartUtils = {
  /**
   * Generate a color palette for charts
   * @param {number} count - Number of colors needed
   * @returns {Array} - Array of color strings
   */
  generateColorPalette(count) {
    const baseColors = [
      "#4e73df",
      "#1cc88a",
      "#36b9cc",
      "#f6c23e",
      "#e74a3b",
      "#5a5c69",
      "#858796",
      "#6f42c1",
      "#20c9a6",
      "#fd7e14",
    ];

    if (count <= baseColors.length) {
      return baseColors.slice(0, count);
    }

    // If we need more colors than in our base palette, generate them
    const palette = [...baseColors];

    for (let i = baseColors.length; i < count; i++) {
      const hue = (i * 137) % 360; // Generate well-distributed hues
      palette.push(`hsl(${hue}, 70%, 60%)`);
    }

    return palette;
  },

  /**
   * Create a chart configuration for Chart.js
   * @param {string} type - Chart type (pie, bar, line, etc.)
   * @param {Object} data - Chart data
   * @param {Object} options - Chart options
   * @returns {Object} - Chart.js configuration object
   */
  createChartConfig(type, data, options = {}) {
    // Default options based on chart type
    const defaultOptions = this.getDefaultOptions(type);

    return {
      type,
      data,
      options: { ...defaultOptions, ...options },
    };
  },

  /**
   * Get default options for different chart types
   * @param {string} type - Chart type
   * @returns {Object} - Default options object
   */
  getDefaultOptions(type) {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
    };

    switch (type) {
      case "pie":
      case "doughnut":
        return {
          ...baseOptions,
          legend: {
            position: "right",
            labels: {
              padding: 20,
            },
          },
          tooltips: {
            callbacks: {
              label: function (tooltipItem, data) {
                const dataset = data.datasets[tooltipItem.datasetIndex];
                const total = dataset.data.reduce((acc, val) => acc + val, 0);
                const value = dataset.data[tooltipItem.index];
                const percentage = Math.round((value / total) * 100);
                return `${
                  data.labels[tooltipItem.index]
                }: ${value} (${percentage}%)`;
              },
            },
          },
        };

      case "bar":
        return {
          ...baseOptions,
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: true,
                },
              },
            ],
          },
          tooltips: {
            callbacks: {
              label: function (tooltipItem, data) {
                return `${data.datasets[tooltipItem.datasetIndex].label}: ${
                  tooltipItem.yLabel
                }`;
              },
            },
          },
        };

      case "line":
        return {
          ...baseOptions,
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: true,
                },
              },
            ],
          },
        };

      default:
        return baseOptions;
    }
  },
};

// Export for global use
window.ChartUtils = ChartUtils;
