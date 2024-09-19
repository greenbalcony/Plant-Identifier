document.getElementById('allow-access').addEventListener('change', function() {
  const isChecked = this.checked;

  // Enable or disable the form fields based on the checkbox state
  document.getElementById('plant-image').disabled = !isChecked;
  document.getElementById('organs').disabled = !isChecked;
  document.querySelector('#plant-form button').disabled = !isChecked;

  // Optionally, change button style based on state
  document.querySelector('#plant-form button').style.cursor = isChecked ? 'pointer' : 'not-allowed';
});

document.getElementById('plant-form').addEventListener('submit', function(event) {
  event.preventDefault(); // Prevent the default form submission

  const fileInput = document.getElementById('plant-image');
  const organSelect = document.getElementById('organs');
  const file = fileInput.files[0];
  const organ = organSelect.value;

  if (file) {
    console.log('Image and organ selected, starting identification...');
    showLoading(); // Show loading indicator
    identifyPlant(file, organ);
  } else {
    alert('Please select an image file.');
  }
});

function identifyPlant(imageFile, organ) {
  const apiUrl = 'https://19160996-b54d-455f-b5b3-1be2b287e2a1-00-263mou67ugjrr.picard.replit.dev/identify'; // Full Replit URL

  const formData = new FormData();
  formData.append('organ', organ);
  formData.append('image', imageFile);

  console.log('Sending request to /identify API endpoint...');

  fetch(apiUrl, {
    method: 'POST',
    body: formData,
  })
  .then(response => {
    console.log('Received response from server:', response);
    return response.json();
  })
  .then(data => {
    console.log('Received data:', data); // Log the data
    hideLoading(); // Hide loading indicator when done
    displayResults(data);
  })
  .catch(error => {
    console.error('Error:', error); // Log the error
    hideLoading(); // Hide loading indicator even if there's an error
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = 'An error occurred while identifying the plant.';
  });
}

function displayResults(data) {
  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = ''; // Clear previous results

  if (data.results && data.results.length > 0) {
    let resultsFound = false;

    data.results.forEach((plant) => {
      const species = plant.species;
      const scientificName = species.scientificName;
      const commonNames = species.commonNames ? species.commonNames.join(', ') : 'N/A';
      const score = (plant.score * 100).toFixed(2); // Convert to percentage

      // Only show plants with confidence score above 10%
      if (score >= 10) {
        resultsFound = true;

        // Create a div to hold plant info
        const plantInfo = document.createElement('div');
        plantInfo.innerHTML = `
          <h3>${scientificName}</h3>
          <p><strong>Common Names:</strong> ${commonNames}</p>
          <p><strong>Confidence:</strong> ${score}%</p>
        `;

        // Display related images if available
        if (plant.images && plant.images.length > 0) {
          plant.images.forEach((img) => {
            const imgElement = document.createElement('img');
            imgElement.src = img.url.s; // Small image URL
            imgElement.alt = `${scientificName} - ${img.organ}`;
            plantInfo.appendChild(imgElement);
          });
        }

        resultDiv.appendChild(plantInfo);
      }
    });

    // If no plants had a score above 10%
    if (!resultsFound) {
      resultDiv.innerHTML = 'No plants with a confidence score above 10% were found.';
    }
  } else {
    resultDiv.innerHTML = 'No matching plants found.';
  }
}

// Loading indicator functions
function showLoading() {
  const loadingDiv = document.getElementById('loading');
  loadingDiv.style.display = 'block'; // Show the loading div
}

function hideLoading() {
  const loadingDiv = document.getElementById('loading');
  loadingDiv.style.display = 'none'; // Hide the loading div
}
