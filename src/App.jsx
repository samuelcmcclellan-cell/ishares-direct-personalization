import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { PasswordGate } from './components/PasswordGate'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { OverviewSection } from './components/overview/OverviewSection'
import { ModelsSection } from './components/models/ModelsSection'
import { PrototypeSection } from './components/prototype/PrototypeSection'
import { DeckPage } from './pages/DeckPage'

function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-16">
        <OverviewSection />
        <ModelsSection />
        <PrototypeSection />
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <PasswordGate>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/deck" element={<DeckPage />} />
        </Routes>
      </BrowserRouter>
    </PasswordGate>
  )
}
