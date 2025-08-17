"use client"
import Galaxy from "../components/Galaxy"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0">
        <Galaxy
          mouseInteraction={false}
          mouseRepulsion={false}
          density={1.2}
          glowIntensity={0.4}
          saturation={0.3}
          hueShift={240}
          twinkleIntensity={0.5}
          rotationSpeed={0.05}
          speed={0.8}
          transparent={false}
        />
      </div>

      <h1 className="text-6xl font-serif font-bold text-white tracking-wider z-10">imdef</h1>
    </div>
  )
}
