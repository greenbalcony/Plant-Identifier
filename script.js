document.addEventListener('DOMContentLoaded', function() {
  const allowAccessCheckbox = document.getElementById('allow-access');
  const plantImageInput = document.getElementById('plant-image');
  const submitButton = document.querySelector('#plant-form button[type="submit"]');
  const plantForm = document.getElementById('plant-form');
  const loadingDiv = document.getElementById('loading');
  const resultDiv = document.getElementById('result');

  allowAccessCheckbox.addEventListener('change', function() {
    const isChecked = this.checked;
    plantImageInput.disabled = !isChecked;
    submitButton.disabled = !isChecked;
    submitButton.style.cursor = isChecked ? 'pointer' : 'not-allowed';

    if (isChecked) {
      submitButton.classList.remove('bg-gray-500');
      submitButton.classList.add('bg-green-500', 'hover:bg-green-600');
    } else {
      submitButton.classList.remove('bg-green-500', 'hover:bg-green-600');
      submitButton.classList.add('bg-gray-500');
    }
  });

  plantForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const file = plantImageInput.files[0];
    if (file) {
      console.log('Image selected, starting identification...');
      showLoading();
      identifyPlant(file);
    } else {
      alert('Please select an image file.');
    }
  });

  function identifyPlant(imageFile) {
    const apiUrl = '/identify';
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
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
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
      resultDiv.innerHTML = `An error occurred while identifying the plant: ${error.message}`;
    });
  }

  function displayResults(data) {
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
    loadingDiv.style.display = 'block';
  }

  function hideLoading() {
    loadingDiv.style.display = 'none';
  }
});