/**
 * Table component JavaScript handling
 * Provides functionality for managing data tables and table interactions
 */

const TableHelpers = {
  /**
   * Initialize a sortable table
   * @param {string} tableId - ID of the table element
   * @param {Object} options - Configuration options
   */
  initSortableTable(tableId, options = {}) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const headers = table.querySelectorAll("th[data-sort]");
    if (!headers.length) return;

    // Add click handlers to sortable headers
    headers.forEach((header) => {
      header.classList.add("sortable");
      header.addEventListener("click", () => {
        this.sortTable(table, header, options);
      });
    });
  },

  /**
   * Sort a table by a specific column
   * @param {HTMLTableElement} table - Table to sort
   * @param {HTMLTableCellElement} header - Header cell to sort by
   * @param {Object} options - Configuration options
   */
  sortTable(table, header, options = {}) {
    const column = header.cellIndex;
    const sortKey = header.dataset.sort;

    // Toggle sort direction
    const currentDirection = header.dataset.sortDirection || "asc";
    const newDirection = currentDirection === "asc" ? "desc" : "asc";

    // Update header attributes and UI
    const headers = table.querySelectorAll("th[data-sort]");
    headers.forEach((h) => {
      h.dataset.sortDirection = "";
      h.classList.remove("sort-asc", "sort-desc");
    });

    header.dataset.sortDirection = newDirection;
    header.classList.add(`sort-${newDirection}`);

    // Get table rows (skip header row)
    const tbody = table.querySelector("tbody");
    const rows = Array.from(tbody.rows);

    // Sort rows
    rows.sort((a, b) => {
      const aValue = this.getCellValue(a.cells[column], sortKey);
      const bValue = this.getCellValue(b.cells[column], sortKey);

      // Compare values
      if (aValue === bValue) return 0;

      const comparison = aValue > bValue ? 1 : -1;
      return newDirection === "asc" ? comparison : -comparison;
    });

    // Reorder rows in the DOM
    rows.forEach((row) => tbody.appendChild(row));

    // Call callback if provided
    if (options.onSort && typeof options.onSort === "function") {
      options.onSort(sortKey, newDirection);
    }
  },

  /**
   * Initialize a searchable/filterable table
   * @param {string} tableId - ID of the table element
   * @param {string} inputId - ID of the search input element
   * @param {Object} options - Configuration options
   */
  initSearchableTable(tableId, inputId, options = {}) {
    const table = document.getElementById(tableId);
    const input = document.getElementById(inputId);
    if (!table || !input) return;

    // Set up search input handler with debounce
    input.addEventListener(
      "input",
      window.Utils?.debounce
        ? window.Utils.debounce((e) => {
            this.filterTable(table, e.target.value, options);
          }, 300)
        : (e) => {
            this.filterTable(table, e.target.value, options);
          }
    );
  },

  /**
   * Filter table rows based on search text
   * @param {HTMLTableElement} table - Table to filter
   * @param {string} searchText - Text to search for
   * @param {Object} options - Configuration options
   */
  filterTable(table, searchText, options = {}) {
    const rows = Array.from(table.querySelectorAll("tbody tr"));
    const columns =
      options.columns || Array.from(Array(rows[0]?.cells.length || 0).keys());
    const searchLower = searchText.toLowerCase();

    let matchCount = 0;

    // Filter rows
    rows.forEach((row) => {
      let match = false;

      if (!searchText.trim()) {
        match = true; // Show all rows when search is empty
      } else {
        // Check each specified column for a match
        columns.forEach((colIdx) => {
          const cell = row.cells[colIdx];
          if (cell && cell.textContent.toLowerCase().includes(searchLower)) {
            match = true;
          }
        });
      }

      // Show/hide row
      if (match) {
        row.classList.remove("d-none");
        matchCount++;
      } else {
        row.classList.add("d-none");
      }
    });

    // Show/hide no-results message
    const noResults = table.nextElementSibling?.classList.contains(
      "no-results-message"
    )
      ? table.nextElementSibling
      : null;

    if (noResults) {
      if (matchCount === 0) {
        noResults.classList.remove("d-none");
      } else {
        noResults.classList.add("d-none");
      }
    }

    // Call callback if provided
    if (options.onFilter && typeof options.onFilter === "function") {
      options.onFilter(searchText, matchCount);
    }
  },

  /**
   * Get the value of a cell for sorting purposes
   * @param {HTMLTableCellElement} cell - Cell to get value from
   * @param {string} type - Type of data in the cell
   * @returns {any} - Appropriately typed value for sorting
   */
  getCellValue(cell, type) {
    const text = cell.textContent.trim();

    switch (type) {
      case "number":
        return parseFloat(text) || 0;

      case "date":
        return new Date(text).getTime() || 0;

      case "text":
      default:
        return text.toLowerCase();
    }
  },
};

// Export for global use
window.TableHelpers = TableHelpers;
