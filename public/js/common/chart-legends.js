/**
 * Custom chart legend handling for better legend placement and formatting
 */

document.addEventListener('DOMContentLoaded', function() {
  // Wait for charts to be initialized
  setTimeout(function() {
    // Update all pie/doughnut charts to have consistent legend formatting
    const charts = ['eventsByCategory', 'registrationStatus'];
    
    charts.forEach(function(chartId) {
      const chartElement = document.getElementById(chartId);
      if (!chartElement) return;
      
      // Find the chart instance
      const chartInstance = Chart.instances[Object.keys(Chart.instances).find(
        key => Chart.instances[key].canvas.id === chartId
      )];
      
      if (chartInstance) {
        // Apply consistent legend formatting
        chartInstance.options.legend = {
          position: 'right',
          align: 'start',
          labels: {
            boxWidth: 12,
            padding: 15,
            usePointStyle: true,
            fontColor: '#666'
          }
        };
        
        // Update the chart
        chartInstance.update();
      }
    });
  }, 200);  // Allow time for charts to initialize
});
