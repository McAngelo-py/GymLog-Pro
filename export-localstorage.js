// Browser script to export localStorage data to a JSON file
// Save this as a separate file and run it in the browser console

// Function to export localStorage data
function exportLocalStorageData() {
  try {
    // Get the check-ins data from localStorage
    const checkIns = JSON.parse(localStorage.getItem('gymCheckIns')) || [];
    
    // Create a JSON string with the data
    const jsonData = JSON.stringify(checkIns, null, 2);
    
    // Create a Blob with the JSON data
    const blob = new Blob([jsonData], { type: 'application/json' });
    
    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);
    
    // Create a link element
    const link = document.createElement('a');
    link.href = url;
    link.download = 'gymlogbook-data.json';
    
    // Append the link to the body
    document.body.appendChild(link);
    
    // Click the link to trigger the download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log(`Exported ${checkIns.length} check-ins to gymlogbook-data.json`);
    return true;
  } catch (error) {
    console.error('Error exporting localStorage data:', error);
    return false;
  }
}

// Execute the export function
exportLocalStorageData();

/*
  HOW TO USE THIS SCRIPT:
  
  1. Open your GymLogBook application in the browser
  2. Open the browser's developer console (F12 or right-click > Inspect > Console)
  3. Copy and paste this entire script into the console
  4. Press Enter to run the script
  5. A file named 'gymlogbook-data.json' will be downloaded
  6. Use this file with the migrate-data.js script to import the data into MySQL
     Example: node migrate-data.js gymlogbook-data.json
*/