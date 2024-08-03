document.getElementById('fileInput').addEventListener('change', (event) => {
    const fileInput = event.target;
    const file = fileInput.files[0];
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const errorElement = document.getElementById('imageError');
    
    if (file && !allowedTypes.includes(file.type)) {
      errorElement.style.display = 'block';
      fileInput.value = ''; // Clear the input
    } else {
      errorElement.style.display = 'none';
    }
  });
  
  document.getElementById('imageConverterForm').addEventListener('submit', (event) => {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    
    if (file && !allowedTypes.includes(file.type)) {
      event.preventDefault(); // Prevent form submission
      alert('Invalid file type. Please select a JPEG, JPG, or PNG image file.');
    }
  });
  
  document.getElementById('svgFileInput').addEventListener('change', (event) => {
    const fileInput = event.target;
    const file = fileInput.files[0];
    const errorElement = document.getElementById('svgError');
    
    if (file && file.type !== 'image/svg+xml') {
      errorElement.style.display = 'block';
      fileInput.value = ''; // Clear the input
    } else {
      errorElement.style.display = 'none';
    }
  });
  
  document.getElementById('svgConvertForm').addEventListener('submit', (event) => {
    const fileInput = document.getElementById('svgFileInput');
    const file = fileInput.files[0];
    
    if (file && file.type !== 'image/svg+xml') {
      event.preventDefault(); // Prevent form submission
      alert('Invalid file type. Please select an SVG file.');
    }
  });



document.getElementById('imageConverterForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
    // Validate file type
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }
  
    const formData = new FormData();
    formData.append('image', file);

    const loadingSpinner = document.getElementById('loadingSpinner');
    loadingSpinner.style.display = 'block';
    
    try {
      const response = await fetch('/svg', {
        method: 'POST',
        body: formData,
      });

      loadingSpinner.style.display = 'none';
      
      if (response.ok) {
        const svgText = await response.text();
        document.getElementById('svgContainer').innerHTML = svgText;
  
        // Create a blob and link for download
        const svgBlob = new Blob([svgText], { type: 'image/svg+xml' });
        const svgUrl = URL.createObjectURL(svgBlob);
        const downloadButton = document.getElementById('downloadSvgButton');
        downloadButton.href = svgUrl;
        downloadButton.download = 'converted.svg';
        downloadButton.style.display = 'inline';
      } else {
        alert('Error uploading image');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error uploading image');
    }
  });
  
  document.getElementById('svgConvertForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const svgFileInput = document.getElementById('svgFileInput');
    const file = svgFileInput.files[0];
    
    // Validate file type
    if (!file || file.type !== 'image/svg+xml') {
      alert('Please select a valid SVG file.');
      return;
    }
  
    const formData = new FormData();
    formData.append('svg', file);
    //loading
    const loadingSpinner = document.getElementById('imageLoadingSpinner');
    loadingSpinner.style.display = 'block';
    
    try {
      const response = await fetch('/image', {
        method: 'POST',
        body: formData,
      });

      loadingSpinner.style.display = 'none';
      
      if (response.ok) {
        const imageBlob = await response.blob();
        const imageUrl = URL.createObjectURL(imageBlob);
        const imgElement = document.getElementById('convertedImage');
        imgElement.src = imageUrl;
        imgElement.style.display = 'block';
  
        // Create a blob and link for download
        const downloadButton = document.getElementById('downloadImageButton');
        downloadButton.href = imageUrl;
        downloadButton.download = 'converted-image.png';
        downloadButton.style.display = 'inline';
      } else {
        alert('Error converting SVG');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error converting SVG');
    }
  });