import { getActiveTheme } from '~/lib/theme/theme-service'

/**
 * Simple debug component to see what's happening with themes
 */
export async function ThemeDebug() {
  let debugInfo = 'Starting theme debug...'
  let activeTheme = null
  
  try {
    activeTheme = await getActiveTheme()
    if (activeTheme) {
      debugInfo = `✅ Found active theme: "${activeTheme.name}" (ID: ${activeTheme.id})`
    } else {
      debugInfo = '❌ No active theme found in database'
    }
  } catch (error) {
    debugInfo = `❌ Error loading theme: ${error instanceof Error ? error.message : 'Unknown error'}`
  }

  return (
    <div 
      id="theme-debug"
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: '#000',
        color: '#fff',
        padding: '10px',
        fontSize: '12px',
        zIndex: 9999,
        borderRadius: '4px',
        fontFamily: 'monospace'
      }}
    >
      <div>Theme Debug:</div>
      <div>{debugInfo}</div>
      {activeTheme && (
        <div style={{ marginTop: '5px', fontSize: '10px', opacity: 0.7 }}>
          CSS Length: {activeTheme.cssVariables.length} chars
        </div>
      )}
    </div>
  )
}
