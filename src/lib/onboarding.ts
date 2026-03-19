const ONBOARDING_KEY = 'siriuspad:onboarding:v1'

export function hasCompletedOnboarding(): boolean {
  if (typeof window === 'undefined') {
    return true
  }

  return window.localStorage.getItem(ONBOARDING_KEY) === 'done'
}

export function markOnboardingComplete(): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(ONBOARDING_KEY, 'done')
}

export function resetOnboarding(): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(ONBOARDING_KEY)
}
