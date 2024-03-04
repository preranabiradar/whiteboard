import React, { useRef, useState,useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import io from 'socket.io-client';

function Whiteboard() {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [canvasUrl, setCanvasUrl] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [brushColor, setBrushColor] = useState('#000000'); 
  const [brushSize, setBrushSize] = useState(5);  
  const [socket, setSocket] = useState(null);
  const [remoteCursors, setRemoteCursors] = useState({});
  const [cursors, setCursors] = useState({});

  useEffect(() => {
    const newSocket = io('ws://localhost:3000'); 
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);
  
  useEffect(() => {
    if (!socket) return;
    socket.on('cursorPosition', (cursor) => {
      setCursors((prevCursors) => ({
        ...prevCursors,
        [cursor.userId]: cursor.position,
      }));
    });
    return () => {
      socket.off('cursorPosition');
    };
  }, [socket]);

  function handleMouse (e) {
    if (!socket) return;

    const { clientX, clientY } = e;
    const position = { x: clientX, y: clientY };
    socket.emit('cursorPosition', { userId: socket.id, position });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.lineCap = 'round';
    context.strokeStyle = brushColor;
    context.lineWidth = brushSize;
    contextRef.current = context;
  }, [brushColor, brushSize]);

  const saveAsImage = () => {
    const canvas = canvasRef.current;
    html2canvas(canvas)
      .then((canvas) => {
        const imageUrl = canvas.toDataURL('image/png');
        setCanvasUrl(imageUrl);
      })
      .catch((error) => {
        console.error('Error saving as image:', error);
      });
  };

  const saveAsPdf = () => {
    const canvas = canvasRef.current;
    const pdf = new jsPDF();
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0);
    pdf.save('whiteboard.pdf');
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.8;
    const context = canvas.getContext('2d');
    context.lineCap = 'round';
    context.strokeStyle = 'black';
    context.lineWidth = 5;
    contextRef.current = context;
  }, []);



const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasUrl('');
  };

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const finishDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
    recordAction('stroke');
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) {
        return;
    }
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    const lastAction = undoStack.pop();
    setRedoStack([...redoStack, lastAction]);
    redrawCanvas([...undoStack, lastAction]);
  };

 
  const redo = () => {
    if (redoStack.length === 0) return;
  
    const lastRedoAction = redoStack[redoStack.length - 1]; 
    setRedoStack(prevRedoStack => prevRedoStack.slice(0, -1));
    setUndoStack(prevUndoStack => [...prevUndoStack, lastRedoAction]);
    redrawCanvas([...undoStack, lastRedoAction]);
  };
  

  const redrawCanvas = ( actions) => {
    const context = contextRef.current;
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    actions.forEach(({ type, params }) => {
      if (type === 'beginPath') {
        context.beginPath();
      } else if (type === 'moveTo') {
        context.moveTo(...params);
      } else if (type === 'lineTo') {
        context.lineTo(...params);
      } else if (type === 'stroke') {
        context.stroke();
      }
    });
  };
  const recordAction = (type, params) => {
    const newAction = { type, params };
    setUndoStack([...undoStack, newAction]);
    setRedoStack([]);
  };

  const handleChangeColor = (e) => {
    setBrushColor(e.target.value);
    contextRef.current.strokeStyle = e.target.value;
  };

  const handleChangeSize = (e) => {
    setBrushSize(parseInt(e.target.value));
    contextRef.current.lineWidth = parseInt(e.target.value);
  };


  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }} onMouseMove={handleMouse}>
      {Object.entries(cursors).map(([userId, position]) => (
        <div
          key={userId}
          style={{
            position: 'absolute',
            left: position.x,
            top: position.y,
            width: '10px',
            height: '10px',
            backgroundColor: 'red', 
            borderRadius: '50%',
          }}
        />
      ))}
    <div className="whiteboard-container  d-flex flex-column align-items-center">
      <h1 className="mt-5 mb-4 text-center">Whiteboard App</h1>

      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseUp={finishDrawing}
        onMouseMove={draw}
      />
      
       <div className="controls-container">
        <div className="color-picker">
          <label htmlFor="colorPicker">Color:</label>
          <input type="color" id="colorPicker" value={brushColor} onChange={handleChangeColor} />
        </div>
        <div className="brush-size">
          <label htmlFor="brushSize">Brush Size:</label>
          <input type="range" id="brushSize" min="1" max="40" value={brushSize} onChange={handleChangeSize} />
        </div>
       <div className="buttons-container mt-3">
        <button className="btn btn-primary mr-2" onClick={saveAsImage}>Save as Image</button>
        <button className="btn btn-primary mr-2" onClick={saveAsPdf}>Save as PDF</button>
        <button className="btn btn-danger mr-2" onClick={undo} disabled={undoStack.length === 0}>Undo</button>
        <button className="btn btn-primary" onClick={redo} disabled={redoStack.length === 0}>Redo</button>
        <button className="btn btn-danger" onClick={clearCanvas}>Clear</button>
        </div>
      </div>
      {Object.keys(remoteCursors).map((id) => 
      <div
          key={id}
          style={{
            position: 'absolute',
            left: remoteCursors[id].x,
            top: remoteCursors[id].y,
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: 'red', 
          }}
        />
      )}
      {canvasUrl && (
        <div className="mt-3">
          <img src={canvasUrl} alt="Whiteboard" />
        </div>
      )}
    </div>
    </div>
  );
}

export default Whiteboard;
