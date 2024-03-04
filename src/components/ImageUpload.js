import React, { useState,useRef } from 'react';

function ImageUpload({ handlePredictions }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setSelectedImage(file);

    const reader = new FileReader();
    reader.onload = function (event) {
      const imageUrl = event.target.result;

      localStorage.setItem('uploadedImage', imageUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSendImage = () => {
    console.log("Sending image data:", selectedImage);
    fileInputRef.current.value = '';
    setSelectedImage(null);
  };

  return (
    <div className="mb-3">
      <label htmlFor="imageUpload" className="form-label" >Upload Image</label>
      <input
        type="file"
        className="form-control"
        id="imageUpload"
        accept="image/*"
        onChange={handleImageChange}
        ref={fileInputRef}
      />
       <button className="btn btn-primary" onClick={handleSendImage}>Send</button>
    </div>
  );
}

export default ImageUpload;
