import { PasswordGate } from './components/PasswordGate'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { OverviewSection } from './components/overview/OverviewSection'
import { ModelsSection } from './components/models/ModelsSection'
import { PrototypeSection } from './components/prototype/PrototypeSection'

export default function App() {
  return (
    <PasswordGate>
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="pt-16">
          <OverviewSection />
          <ModelsSection />
          <PrototypeSection />
        </main>
        <Footer />
      </div>
    </PasswordGate>
  )
}
