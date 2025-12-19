import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query) return NextResponse.json([])

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  // We search for either title or code matching the query
  // Using ilike for case-insensitive partial match
  const { data, error } = await supabase
    .from('occupations')
    .select('title, code')
    .or(`title.ilike.%${query}%,code.ilike.%${query}%`)
    .limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

