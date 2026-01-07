import { Routes, Route } from 'react-router-dom';
import Experience from './Experience';
import PhotoFrameLightbox from './PhotoFrameLightbox';
// ...other imports...

function App() {
  return (
    <Routes>
      <Route path="/" element={<Experience />} />
      <Route path="/photoframe/:id" element={<PhotoFrameLightbox />} />
      {/* ...other routes... */}
    </Routes>
  );
}

export default App;
