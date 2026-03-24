import { consumeTelegramLinkCode } from '@/lib/telegram/account-link'
import type { TelegramBotContext } from '@/lib/telegram/context'
import { buildTelegramLogContext } from '@/lib/telegram/log-context'
import { telegramLogger } from '@/lib/telegram/logger'
import { buildRoleMenu, buildTemporaryUnavailableMessage } from '@/lib/telegram/messages'

export async function handleLinkCommand(ctx: TelegramBotContext) {
  try {
    const from = ctx.from
    const chat = ctx.chat
    if (!from || !chat) {
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
      telegramChatId: String(chat.id),
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
  } catch (error) {
    telegramLogger.error(
      { error, ...buildTelegramLogContext(ctx, { handler: 'link' }) },
      'Telegram /link handler failed'
    )
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}
