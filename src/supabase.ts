import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(url, key)

// ── Quick helpers ────────────────────────────────────
export async function insertContact(data: {
  name: string; email: string; subject?: string; message: string
}) {
  const { error } = await supabase
    .from('contact_messages')
    .insert([{ ...data, created_at: new Date().toISOString() }])
  if (error) throw error
  return true
}

export async function trackView(projectId: string) {
  try {
    await supabase.from('project_views').insert([{ project_id: projectId }])
  } catch { /* non-critical */ }
}
