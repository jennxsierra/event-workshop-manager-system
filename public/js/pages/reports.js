/**
 * JavaScript for report-related pages
 */
document.addEventListener("DOMContentLoaded", function() {
  // Initialize charts if we're on a reports page with charts
  initializeReportCharts();

  // Set up any report-specific controls
  setupReportControls();
});

/**
 * Initialize charts for reports pages
 */
function initializeReportCharts() {
  // Get all chart canvases with data-chart attribute
  const charts = document.querySelectorAll("canvas[data-chart]");

  charts.forEach((canvas) => {
    const chartType = canvas.dataset.chart;

    try {
      // Parse chart data from data attributes
      let chartData;
      let chartOptions;

      if (canvas.dataset.chartData) {
        // If all chart data is provided in one attribute
        chartData = JSON.parse(decodeURIComponent(canvas.dataset.chartData));
      } else {
        // Otherwise build from separate attributes
        const labels = JSON.parse(
          decodeURIComponent(canvas.dataset.chartLabels || "[]")
        );
        const datasets = [];

        // Handle multiple datasets if present
        if (canvas.dataset.chartMultipleDatasets) {
          const datasetsData = JSON.parse(
            decodeURIComponent(canvas.dataset.chartMultipleDatasets)
          );
          datasetsData.forEach((dataset) => {
            datasets.push({
              label: dataset.label,
              data: dataset.data,
              backgroundColor: dataset.backgroundColor || generateColors(1)[0],
              borderColor: dataset.borderColor || "rgba(0, 0, 0, 0.1)",
              borderWidth: 1,
            });
          });
        } else {
          // Single dataset
          const values = JSON.parse(
            decodeURIComponent(canvas.dataset.chartValues || "[]")
          );
          
          // Handle background colors if provided as an array
          let backgroundColor;
          if (canvas.dataset.chartBgColors) {
            backgroundColor = JSON.parse(decodeURIComponent(canvas.dataset.chartBgColors));
          } else {
            backgroundColor = canvas.dataset.chartBgColor || "rgba(13, 110, 253, 0.7)";
          }
          
          datasets.push({
            label: canvas.dataset.chartLabel || "Value",
            data: values,
            backgroundColor: backgroundColor,
            borderColor:
              canvas.dataset.chartBorderColor || "rgba(0, 0, 0, 0.2)",
            borderWidth: 1,
          });
        }

        chartData = { labels, datasets };
      }

      // Parse options if available
      if (canvas.dataset.chartOptions) {
        chartOptions = JSON.parse(
          decodeURIComponent(canvas.dataset.chartOptions)
        );
      } else {
        chartOptions = {
          responsive: true,
          maintainAspectRatio: false,
        };

        // Add specific options based on chart type
        if (chartType === "pie" || chartType === "doughnut") {
          // For Chart.js 2.x, legend is a top-level property
          chartOptions.legend = { 
            position: "right",
            align: "center",
            labels: {
              boxWidth: 15,
              padding: 20,
              usePointStyle: true,
              fontColor: "#666"
            }
          };
          
          // Apply special formatting for charts with legends
          if (canvas.id === "eventsByCategory" || canvas.id === "registrationStatus") {
            chartOptions.legend = {
              position: "right", 
              align: "start",
              labels: {
                boxWidth: 12,
                padding: 15,
                usePointStyle: true,
                fontColor: "#666"
              }
            };
          }
        } else if (chartType === "bar" || chartType === "line") {
          chartOptions.scales = {
            yAxes: [
              {
                ticks: { beginAtZero: true },
              },
            ],
          };
        }
      }

      // For pie and doughnut charts, ensure consistent presentation
      if (chartType === "pie" || chartType === "doughnut") {
        chartOptions.maintainAspectRatio = true;
      }
      
      // Create the chart
      new Chart(canvas.getContext("2d"), {
        type: chartType,
        data: chartData,
        options: chartOptions,
      });
    } catch (e) {
      console.error(`Error initializing chart ${canvas.id}:`, e);
    }
  });
}

/**
 * Setup report page controls and filters
 */
function setupReportControls() {
  // Handle date filters
  const reportFilterForm = document.querySelector(".report-filter-form");
  if (reportFilterForm) {
    const dateInputs = reportFilterForm.querySelectorAll('input[type="date"]');

    // Validate end date is after start date
    dateInputs.forEach((input) => {
      input.addEventListener("change", validateDateRange);
    });

    // Handle form submission for filters
    reportFilterForm.addEventListener("submit", function (e) {
      if (!validateDateRange()) {
        e.preventDefault();
        alert("End date must be after start date");
      }
    });
  }

  // Handle export buttons
  const exportButtons = document.querySelectorAll("[data-export-report]");
  exportButtons.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      const format = this.dataset.exportFormat || "csv";
      const reportType = this.dataset.exportReport;

      // Build the export URL with current filter parameters
      const currentUrl = new URL(window.location.href);
      const params = currentUrl.searchParams;

      let exportUrl = `/reports/${reportType}/export?format=${format}`;
      params.forEach((value, key) => {
        if (key !== "format" && key !== "page") {
          exportUrl += `&${key}=${value}`;
        }
      });

      // Navigate to export URL
      window.location.href = exportUrl;
    });
  });
}

/**
 * Validate date range in filter forms
 * @returns {boolean} - Whether the date range is valid
 */
function validateDateRange() {
  const startDateInput = document.getElementById("startDate");
  const endDateInput = document.getElementById("endDate");

  if (!startDateInput || !endDateInput) return true;

  const startDate = startDateInput.value;
  const endDate = endDateInput.value;

  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    endDateInput.setCustomValidity("End date must be after start date");
    endDateInput.reportValidity();
    return false;
  } else {
    endDateInput.setCustomValidity("");
    return true;
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
