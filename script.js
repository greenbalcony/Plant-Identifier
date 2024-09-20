document.getElementById('allow-access').addEventListener('change', function() {
  const isChecked = this.checked;

  document.getElementById('plant-image').disabled = !isChecked;
  document.querySelector('#plant-form button').disabled = !isChecked;

  document.querySelector('#plant-form button').style.cursor = isChecked ? 'pointer' : 'not-allowed';
});

document.getElementById('plant-form').addEventListener('submit', function(event) {
  event.preventDefault();

  const fileInput = document.getElementById('plant-image');
  const file = fileInput.files[0];

  if (file) {
    console.log('Image selected, starting identification...');
    showLoading(); 
    identifyPlant(file);
  } else {
    alert('Please select an image file.');
  }
});

function identifyPlant(imageFile) {
  const apiUrl = 'https://plant-identifier-app-private-glxv.vercel.app/identify'; // Updated for Vercel

  const formData = new FormData();
  formData.append('organ', 'auto');
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
    console.log('Received data:', data);
    hideLoading();
    displayResults(data);
  })
  .catch(error => {
    console.error('Error:', error);
    hideLoading();
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = 'An error occurred while identifying the plant.';
  });
}

function displayResults(data) {
  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = '';

  if (data.results && data.results.length > 0) {
    let resultsFound = false;

    data.results.forEach((plant) => {
      const species = plant.species;
      const scientificName = species.scientificName;
      const commonNames = species.commonNames ? species.commonNames.join(', ') : 'N/A';
      const score = (plant.score * 100).toFixed(2);

      if (score >= 10) {
        resultsFound = true;

        const plantInfo = document.createElement('div');
        plantInfo.innerHTML = `
          <h3>${scientificName}</h3>
          <p><strong>Common Names:</strong> ${commonNames}</p>
          <p><strong>Confidence:</strong> ${score}%</p>
        `;

        if (plant.images && plant.images.length > 0) {
          plant.images.forEach((img) => {
            const imgElement = document.createElement('img');
            imgElement.src = img.url.s;
            imgElement.alt = `${scientificName} - ${img.organ}`;
            plantInfo.appendChild(imgElement);
          });
        }

        resultDiv.appendChild(plantInfo);
      }
    });

    if (!resultsFound) {
      resultDiv.innerHTML = 'No plants with a confidence score above 10% were found.';
    }
  } else {
    resultDiv.innerHTML = 'No matching plants found.';
  }
}

function showLoading() {
  const loadingDiv = document.getElementById('loading');
  loadingDiv.style.display = 'block';
}

function hideLoading() {
  const loadingDiv = document.getElementById('loading');
  loadingDiv.style.display = 'none';
}
