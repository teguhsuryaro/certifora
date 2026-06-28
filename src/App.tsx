import { useEffect } from 'react'
import { supabase } from './lib/supabase'

function App() {
  useEffect(() => {
    const testConnection = async () => {
      const { data, error } = await supabase.from('events').select('*').limit(1)
      if (error) {
        console.log('Supabase connected, but table may not exist yet:', error.message)
      } else {
        console.log('Supabase connected successfully:', data)
      }
    }
    testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <h1 className="text-3xl font-bold text-indigo-600">
        Certifora — Coming Soon
      </h1>
    </div>
  )
}

export default App
