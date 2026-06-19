import { STEPS } from '../constants'
import { S } from '../styles/tokens'

export function StepNav({ currentStep, onStepChange }) {
  return (
    <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(124,58,237,0.1)' }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        {STEPS.map((step, idx) => (
          <div key={step.n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => onStepChange(step.n)}
              style={S.pill(currentStep === step.n)}
            >
              {step.n} · {step.label}
            </button>
            {idx < STEPS.length - 1 && <span style={{ color: '#475569' }}>→</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
