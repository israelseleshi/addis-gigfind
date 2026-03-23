import { Bot } from 'grammy'

import { consumeTelegramLinkCode, getTelegramAccountByTelegramUserId, touchTelegramAccount } from '@/lib/telegram/account-link'
import { getTelegramBotToken, isTelegramConfigured } from '@/lib/telegram/config'
import { telegramLogger } from '@/lib/telegram/logger'

let botSingleton: Bot | null = null

function buildRoleMenu(role: string) {
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

function buildLinkInstructions() {
  return [
    'Your Telegram account is not linked yet.',
    '',
    'On the Addis GigFind website, generate a Telegram link code, then send:',
    '<code>/link YOURCODE</code>',
  ].join('\n')
}

function registerHandlers(bot: Bot) {
  bot.command('start', async (ctx) => {
    const telegramUserId = String(ctx.from?.id ?? '')
    if (!telegramUserId) {
      await ctx.reply('Could not identify your Telegram account.')
      return
    }

    const account = await getTelegramAccountByTelegramUserId(telegramUserId)
    if (!account) {
      await ctx.reply(buildLinkInstructions(), { parse_mode: 'HTML' })
      return
    }

    await touchTelegramAccount(telegramUserId)
    const profile = Array.isArray(account.profiles) ? account.profiles[0] : account.profiles
    const name = profile?.full_name ?? 'there'
    const role = profile?.role ?? 'freelancer'

    await ctx.reply(
      [`Welcome back, ${name}.`, '', `Role: ${role}`, buildRoleMenu(role)].join('\n'),
      { parse_mode: 'HTML' }
    )
  })

  bot.command('link', async (ctx) => {
    const from = ctx.from
    if (!from) {
      await ctx.reply('Could not identify your Telegram account.')
      return
    }

    const text = ctx.message?.text ?? ''
    const code = text.replace('/link', '').trim()

    if (!code) {
      await ctx.reply('Usage: /link YOURCODE')
      return
    }

    const result = await consumeTelegramLinkCode({
      code,
      telegramUserId: String(from.id),
      telegramChatId: String(ctx.chat.id),
      username: from.username,
      firstName: from.first_name,
      lastName: from.last_name,
    })

    if (!result.ok) {
      await ctx.reply(result.error)
      return
    }

    await ctx.reply(
      [
        `Linked successfully to ${result.fullName}.`,
        '',
        `Role: ${result.role}`,
        buildRoleMenu(result.role),
      ].join('\n')
    )
  })

  bot.on('message:text', async (ctx) => {
    const input = ctx.message.text.trim()
    if (input.startsWith('/')) {
      return
    }

    const account = await getTelegramAccountByTelegramUserId(String(ctx.from.id))
    if (!account) {
      await ctx.reply(buildLinkInstructions(), { parse_mode: 'HTML' })
      return
    }

    await touchTelegramAccount(String(ctx.from.id))
    await ctx.reply(
      [
        'Core bot scaffolding is live.',
        'Next implementation step is role-specific gig and review flows.',
      ].join('\n')
    )
  })
}

export function getTelegramBot() {
  if (!isTelegramConfigured()) {
    return null
  }

  if (botSingleton) {
    return botSingleton
  }

  const bot = new Bot(getTelegramBotToken())
  registerHandlers(bot)

  bot.catch((error) => {
    telegramLogger.error({ error }, 'Telegram bot error')
  })

  botSingleton = bot
  return botSingleton
}
