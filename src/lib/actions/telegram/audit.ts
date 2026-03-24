'use server'

import { createServiceRoleClient } from '@/lib/supabase/service-role'

type LogTelegramAuditEntryInput = {
  userId: string
  telegramUserId: string
  role: string
  action: string
  entityType: string
  entityId: string
  metadata?: Record<string, string | number | boolean | null>
}

export async function logTelegramAuditEntry(input: LogTelegramAuditEntryInput) {
  const supabase = await createServiceRoleClient()

  const { error } = await supabase.from('telegram_bot_audit_logs').insert({
    user_id: input.userId,
    telegram_user_id: input.telegramUserId,
    role: input.role,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId,
    metadata: input.metadata ?? {},
  })

  if (error) {
    throw new Error(error.message)
  }
}
