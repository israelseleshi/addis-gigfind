export function buildRoleMenu(role: string) {
  if (role === 'client') {
    return [
      'Available actions:',
      '- Post a gig',
      '- View my gigs',
      '- Review applicants',
    ].join('\n')
  }

  if (role === 'admin' || role === 'regulator') {
    return [
      'Available actions:',
      '- Review verifications',
      '- View platform stats',
      '- Moderate users and gigs',
    ].join('\n')
  }

  return [
    'Available actions:',
    '- Browse gigs',
    '- Apply to gigs',
    '- View my applications',
    '- Check active jobs',
  ].join('\n')
}

export function buildRoleHomePrompt(role: string) {
  if (role === 'client') {
    return 'Choose a client action below.'
  }

  if (role === 'admin' || role === 'regulator') {
    return 'Choose an admin action below.'
  }

  return 'Choose a freelancer action below.'
}

export function buildLinkInstructions() {
  return [
    'Your Telegram account is not linked yet.',
    '',
    'On the Addis GigFind website, generate a Telegram link code, then send:',
    '<code>/link YOURCODE</code>',
  ].join('\n')
}

export function buildTemporaryUnavailableMessage() {
  return [
    'The bot is online, but account linking is not ready yet.',
    'Please finish the Addis GigFind backend setup and try again.',
  ].join('\n')
}

export function buildStartupStatusMessage() {
  return [
    'Addis GigFind bot is online.',
    'Checking your account link status...',
  ].join('\n')
}

export function buildLinkedWelcomeMessage(name: string, role: string) {
  return [
    `Welcome back, ${name}.`,
    '',
    `Role: ${role}`,
    buildRoleMenu(role),
    '',
    buildRoleHomePrompt(role),
  ].join('\n')
}

export function buildScaffoldingPlaceholderMessage() {
  return [
    'Core bot scaffolding is live.',
    'Next implementation step is role-specific gig and review flows.',
  ].join('\n')
}

export function buildUnrecognizedInputMessage() {
  return [
    'Use the Telegram buttons below to continue.',
    'Role-specific workflows are being added step by step.',
  ].join('\n')
}
