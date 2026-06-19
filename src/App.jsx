import { useState } from 'react'
import { useTrack } from './hooks/useTrack'
import { StepNav } from './components/StepNav'
import { Step1Upload } from './components/steps/Step1Upload'
import { Step2Metadata } from './components/steps/Step2Metadata'
import { Step3Distribute } from './components/steps/Step3Distribute'
import { Step4Social } from './components/steps/Step4Social'
import { Step5Launch } from './components/steps/Step5Launch'

export default function App() {
  const [currentStep, setCurrentStep] = useState(1)
  const [aiMeta, setAiMeta] = useState(null)
  const [social, setSocial] = useState(null)
  const [loading, setLoading] = useState('')
  const { track, updateTrack } = useTrack()

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Upload
            track={track}
            onTrackUpdate={updateTrack}
            onStepChange={setCurrentStep}
          />
        )
      case 2:
        return (
          <Step2Metadata
            track={track}
            aiMeta={aiMeta}
            onAiMetaUpdate={setAiMeta}
            onTrackUpdate={updateTrack}
            onStepChange={setCurrentStep}
            loading={loading}
          />
        )
      case 3:
        return (
          <Step3Distribute
            track={track}
            onStepChange={setCurrentStep}
          />
        )
      case 4:
        return (
          <Step4Social
            track={track}
            social={social}
            onSocialUpdate={setSocial}
            onStepChange={setCurrentStep}
            loading={loading}
          />
        )
      case 5:
        return <Step5Launch onStepChange={setCurrentStep} />
      default:
        return null
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ background: 'rgba(6,6,17,0.95)', borderBottom: '1px solid rgba(124,58,237,0.1)' }}>
        <div style={{ padding: '16px 24px' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
            🛬 Droplane
          </h1>
          <p style={{ fontSize: 12, color: '#64748b' }}>
            Suno AI music — from upload to launch in 5 steps
          </p>
        </div>
        <StepNav currentStep={currentStep} onStepChange={setCurrentStep} />
      </div>
      {renderStep()}
    </div>
  )
}
