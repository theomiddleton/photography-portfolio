'use client'

import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { useState } from 'react'

export default function TestEmailPage() {
  const [sending, setSending] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const sendTestEmail = async () => {
    if (!email) {
      setStatus({ type: 'error', message: 'Please enter an email address' })
      return
    }

    setSending(true)
    setStatus(null)
    try {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          orderId: 'pi_3QmHgKGB7EXgItHD1CraUENK',
          shippingDetails: {
            name: 'Test Customer',
            address: {
              line1: '123 Test Street',
              line2: 'Apt 4B',
              city: 'Test City',
              state: 'Test State',
              postal_code: '12345',
              country: 'GB',
            },
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email')
      }

      setStatus({ type: 'success', message: 'Test email sent successfully!' })
    } catch (error) {
      setStatus({
        type: 'error',
        message: `Failed to send test email: ${error}`,
      })
      console.error('Error sending test email:', error)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="container space-y-4 py-10">
      {status && (
        <Alert variant={status.type === 'success' ? 'default' : 'destructive'}>
          <AlertDescription>{status.message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Test Order Confirmation Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Send test email to:</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button onClick={sendTestEmail} disabled={sending}>
            {sending ? 'Sending...' : 'Send Test Email'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
