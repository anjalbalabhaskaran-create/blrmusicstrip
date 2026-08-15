import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import MusicStrip from './MusicStrip.jsx'
import './style.css'
import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState } from 'react'

// Import components from the other version
import Experience from './Experience.jsx'
import Page1Loader from './1loader.jsx'
import Page2 from './2.jsx'
import Page3 from './3.jsx'
import BeginningLoading from './BeginningLoading.jsx'
import { GlobalAudioProvider } from './GlobalAudioContext.jsx'

function App() {
  const [step, setStep] = useState('page1Loader')
  
  return (
    <Routes>
      <Route path="/" element={
        <>
          {step === 'page1Loader' && <Page1Loader onNext={() => setStep('page2')} />}
          {step === 'page2' && <Page2 onFinish={() => setStep('page3')} />}
          {step === 'page3' && <Page3 onFinish={() => setStep('experience')} />}
          {step === 'experience' && <Experience />}
          {step === 'musicstrip' && <MusicStrip />}
        </>
      } />
      <Route path="/musicstrip" element={<MusicStrip />} />
      <Route path="/experience" element={<Experience />} />
      <Route path="/loading" element={<BeginningLoading onComplete={() => console.log('Loading complete!')} />} />
      <Route path="/1loader" element={<Page1Loader onNext={() => console.log('1loader finished')} />} />
      <Route path="/2" element={<Page2 onFinish={() => console.log('Finish clicked')} />} />
      <Route path="/3" element={<Page3 onFinish={() => console.log('Finish clicked')} />} />
    </Routes>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <GlobalAudioProvider>
        <App />
      </GlobalAudioProvider>
    </BrowserRouter>
  </StrictMode>,
)