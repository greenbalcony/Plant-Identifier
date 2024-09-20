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
  const apiUrl = '/identify'; // Use relative URL
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
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `An error occurred while identifying the plant: ${error.message}`;
  });
}

// ... rest of the functions (displayResults, showLoading, hideLoading) remain the same