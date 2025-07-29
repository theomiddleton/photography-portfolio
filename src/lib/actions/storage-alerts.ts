import { Resend } from 'resend'
import { env } from '~/env'
import { UsageAlertEmail } from '~/components/emails/usage-alert-email'

const resend = new Resend(env.RESEND_API_KEY)

interface UsageAlertData {
  bucketName: string
  usageBytes: number
  maxBytes: number
  usagePercent: number
  alertType: 'warning' | 'critical'
  objectCount: number
}

export async function sendUsageAlert(data: UsageAlertData) {
  try {
    const formattedUsage = formatBytes(data.usageBytes)
    const formattedMax = formatBytes(data.maxBytes)
    
    const subject = `${data.alertType === 'critical' ? '🚨 CRITICAL' : '⚠️ WARNING'}: ${data.bucketName} Storage Alert`
    
    await resend.emails.send({
      from: 'Portfolio System <noreply@portfolio.com>',
      to: [env.ADMIN_EMAIL],
      subject,
      react: UsageAlertEmail({
        bucketName: data.bucketName,
        usageBytes: data.usageBytes,
        maxBytes: data.maxBytes,
        usagePercent: data.usagePercent,
        alertType: data.alertType,
        objectCount: data.objectCount,
        formattedUsage,
        formattedMax,
      }),
    })

    console.log(`Sent ${data.alertType} usage alert for ${data.bucketName}`)
  } catch (error) {
    console.error('Failed to send usage alert email:', error)
    throw error
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}