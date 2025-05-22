/**
 * JavaScript for the dashboard pages
 */
document.addEventListener("DOMContentLoaded", function () {
  // Check if we're on the admin dashboard
  const userActivityChart = document.getElementById("userActivityChart");
  const registrationChart = document.getElementById("registrationChart");

  if (userActivityChart || registrationChart) {
    initializeAdminDashboardCharts();
  }
});

/**
 * Initialize charts for the admin dashboard
 */
function initializeAdminDashboardCharts() {
  // Initialize all charts on the page
  const charts = document.querySelectorAll("canvas[data-chart]");

  charts.forEach((canvas) => {
    const chartType = canvas.dataset.chart;

    try {
      // Parse chart data from data attributes
      const labels = JSON.parse(
        decodeURIComponent(canvas.dataset.chartLabels || "[]")
      );
      const values = JSON.parse(
        decodeURIComponent(canvas.dataset.chartValues || "[]")
      );

      // Create chart configuration
      let chartConfig = {
        type: chartType,
        data: {
          labels: labels,
          datasets: [
            {
              label: canvas.dataset.chartLabel || "Value",
              data: values,
              backgroundColor:
                canvas.dataset.chartBgColor || "rgba(13, 110, 253, 0.7)",
              borderColor:
                canvas.dataset.chartBorderColor || "rgba(13, 110, 253, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      };

      // Special configuration for different chart types
      if (chartType === "pie" || chartType === "doughnut") {
        // Generate background colors for each segment
        const colors = generateColors(values.length);
        chartConfig.data.datasets[0].backgroundColor = colors;
      }

      // Create the chart
      new Chart(canvas.getContext("2d"), chartConfig);
    } catch (e) {
      console.error(`Error initializing chart ${canvas.id}:`, e);
    }
  });

  // Special handling for specific charts if needed
  const userActivityChart = document.getElementById("userActivityChart");
  if (userActivityChart) {
    // Additional specific configuration or data loading can go here
  }
}

/**
 * Generate colors for charts
 * @param {number} count - Number of colors to generate
 * @returns {Array} - Array of color strings
 */
function generateColors(count) {
  const baseColors = [
    "rgba(13, 110, 253, 0.7)", // primary
    "rgba(25, 135, 84, 0.7)", // success
    "rgba(13, 202, 240, 0.7)", // info
    "rgba(255, 193, 7, 0.7)", // warning
    "rgba(220, 53, 69, 0.7)", // danger
  ];

  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  }

  // If we need more colors than in our base palette, generate them
  const colors = [...baseColors];
  for (let i = baseColors.length; i < count; i++) {
    const hue = (i * 137) % 360; // Generate well-distributed hues
    colors.push(`hsla(${hue}, 70%, 60%, 0.7)`);
  }

  return colors;
}
