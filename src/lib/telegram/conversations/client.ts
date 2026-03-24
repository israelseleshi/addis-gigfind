type ClientPostGigStep = 'title' | 'category' | 'location' | 'budget' | 'description' | 'review'

export type ClientPostGigDraft = {
  step: ClientPostGigStep
  title: string | null
  category: string | null
  location: string | null
  budget: number | null
  description: string | null
}

type ClientConversationState = {
  postGigDraft: ClientPostGigDraft | null
  updatedAt: number
}

const CLIENT_CONVERSATION_TTL_MS = 30 * 60 * 1000

const clientConversationStore = new Map<string, ClientConversationState>()

function getDefaultState(): ClientConversationState {
  return {
    postGigDraft: null,
    updatedAt: Date.now(),
  }
}

function getState(userId: string) {
  const existing = clientConversationStore.get(userId)
  if (!existing) {
    const created = getDefaultState()
    clientConversationStore.set(userId, created)
    return created
  }

  if (Date.now() - existing.updatedAt > CLIENT_CONVERSATION_TTL_MS) {
    const reset = getDefaultState()
    clientConversationStore.set(userId, reset)
    return reset
  }

  return existing
}

function saveState(userId: string, state: ClientConversationState) {
  clientConversationStore.set(userId, {
    ...state,
    updatedAt: Date.now(),
  })
}

export function startClientPostGigDraft(userId: string) {
  const state = getState(userId)
  saveState(userId, {
    ...state,
    postGigDraft: {
      step: 'title',
      title: null,
      category: null,
      location: null,
      budget: null,
      description: null,
    },
  })
}

export function getClientPostGigDraft(userId: string) {
  return getState(userId).postGigDraft
}

export function updateClientPostGigDraft(
  userId: string,
  updates: Partial<Omit<ClientPostGigDraft, 'step'>>,
  step?: ClientPostGigStep
) {
  const state = getState(userId)
  if (!state.postGigDraft) {
    return null
  }

  const nextDraft: ClientPostGigDraft = {
    ...state.postGigDraft,
    ...updates,
    step: step ?? state.postGigDraft.step,
  }

  saveState(userId, {
    ...state,
    postGigDraft: nextDraft,
  })

  return nextDraft
}

export function clearClientPostGigDraft(userId: string) {
  const state = getState(userId)
  saveState(userId, {
    ...state,
    postGigDraft: null,
  })
}
