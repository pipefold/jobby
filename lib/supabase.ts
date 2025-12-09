import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { Platform } from 'react-native'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || ''
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''

// Web-compatible storage adapter
const webStorage = {
  getItem: (key: string) => {
    if (typeof window !== 'undefined') {
      return Promise.resolve(window.localStorage.getItem(key))
    }
    return Promise.resolve(null)
  },
  setItem: (key: string, value: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, value)
    }
    return Promise.resolve()
  },
  removeItem: (key: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key)
    }
    return Promise.resolve()
  },
}

// Use localStorage for web, AsyncStorage for native
const storage = Platform.OS === 'web' ? webStorage : AsyncStorage

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: storage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
