import React, { useState } from 'react';
import SignLog from './components/SignLogin';
import ImageUpload from './components/ImageUpload';
import FileDisplay from './components/FileDisplay';
import Whiteboard from './components/Whiteboard';
import 'bootstrap/dist/css/bootstrap.min.css';

import './App.css';

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [predictions, setPredictions] = useState([]);

  const handlePredictions = (newPredictions) => {
    setPredictions(newPredictions);
  };

  const handleSignup = () => {
    setAuthenticated(true);
  };

  return (
    <div className="App">
      {!authenticated && <SignLog onSignup={handleSignup} />}
      {authenticated && (
        <div>
          <FileDisplay predictions={predictions} />
          <ImageUpload />
          <Whiteboard />
        </div>
      )}
    </div>
  );
}

export default App;
