type FreelancerPromptKind = 'browse_category' | 'browse_location'

type FreelancerBrowseFilters = {
  category: string | null
  location: string | null
}

type FreelancerApplicationDraft = {
  gigId: string
  gigTitle: string
  coverNote: string | null
}

type FreelancerConversationState = {
  filters: FreelancerBrowseFilters
  pendingPrompt: FreelancerPromptKind | null
  applicationDraft: FreelancerApplicationDraft | null
  updatedAt: number
}

const FREELANCER_CONVERSATION_TTL_MS = 30 * 60 * 1000

const freelancerConversationStore = new Map<string, FreelancerConversationState>()

function getDefaultState(): FreelancerConversationState {
  return {
    filters: {
      category: null,
      location: null,
    },
    pendingPrompt: null,
    applicationDraft: null,
    updatedAt: Date.now(),
  }
}

function getState(userId: string) {
  const existing = freelancerConversationStore.get(userId)
  if (!existing) {
    const created = getDefaultState()
    freelancerConversationStore.set(userId, created)
    return created
  }

  if (Date.now() - existing.updatedAt > FREELANCER_CONVERSATION_TTL_MS) {
    const reset = getDefaultState()
    freelancerConversationStore.set(userId, reset)
    return reset
  }

  return existing
}

function saveState(userId: string, state: FreelancerConversationState) {
  freelancerConversationStore.set(userId, {
    ...state,
    updatedAt: Date.now(),
  })
}

export function getFreelancerBrowseFilters(userId: string) {
  return getState(userId).filters
}

export function setFreelancerBrowsePrompt(userId: string, prompt: FreelancerPromptKind) {
  const state = getState(userId)
  saveState(userId, {
    ...state,
    pendingPrompt: prompt,
  })
}

export function consumeFreelancerBrowsePrompt(userId: string) {
  const state = getState(userId)
  const prompt = state.pendingPrompt

  if (!prompt) {
    return null
  }

  saveState(userId, {
    ...state,
    pendingPrompt: null,
  })

  return prompt
}

export function updateFreelancerBrowseFilters(
  userId: string,
  updates: Partial<FreelancerBrowseFilters>
) {
  const state = getState(userId)

  saveState(userId, {
    ...state,
    filters: {
      category: updates.category === undefined ? state.filters.category : updates.category,
      location: updates.location === undefined ? state.filters.location : updates.location,
    },
  })
}

export function clearFreelancerBrowseFilters(userId: string) {
  const state = getState(userId)

  saveState(userId, {
    ...state,
    filters: {
      category: null,
      location: null,
    },
    pendingPrompt: null,
  })
}

export function startFreelancerApplicationDraft(
  userId: string,
  draft: Omit<FreelancerApplicationDraft, 'coverNote'>
) {
  const state = getState(userId)

  saveState(userId, {
    ...state,
    applicationDraft: {
      ...draft,
      coverNote: null,
    },
  })
}

export function getFreelancerApplicationDraft(userId: string) {
  return getState(userId).applicationDraft
}

export function saveFreelancerApplicationDraftCoverNote(userId: string, coverNote: string) {
  const state = getState(userId)
  if (!state.applicationDraft) {
    return null
  }

  const nextDraft = {
    ...state.applicationDraft,
    coverNote,
  }

  saveState(userId, {
    ...state,
    applicationDraft: nextDraft,
  })

  return nextDraft
}

export function clearFreelancerApplicationDraft(userId: string) {
  const state = getState(userId)

  saveState(userId, {
    ...state,
    applicationDraft: null,
  })
}
