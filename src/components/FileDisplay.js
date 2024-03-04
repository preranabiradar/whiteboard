import React from 'react';

function FileDisplay ({ predictions }) {
  return(
<div>
{predictions && predictions.length > 0 ? (
  <div>
    <h2>Predictions:</h2>
    <ul>
      {predictions.map((prediction, index) => (
        <li key={index}>{prediction}</li>
      ))}
    </ul>
  </div>
) : (
  <div>
    <p>No predictions available.</p>
  </div>
)}
</div>
);
}
export default FileDisplay;
