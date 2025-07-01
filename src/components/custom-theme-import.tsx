'use client'

import { useState } from 'react'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Textarea } from '~/components/ui/textarea'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Badge } from '~/components/ui/badge'
import {
  createCustomThemeAction,
  validateThemeAction,
} from '~/lib/actions/theme-actions'
import { parseCSS, extractThemeName } from '~/lib/theme/css-parser'
import { toast } from 'sonner'
import { Upload, Check, AlertCircle } from 'lucide-react'

interface CustomThemeImportProps {
  onThemeCreated?: () => void
}

export function CustomThemeImport({ onThemeCreated }: CustomThemeImportProps) {
  const [cssInput, setCssInput] = useState('')
  const [themeName, setThemeName] = useState('')
  const [loading, setLoading] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    errors: string[]
    variables: Record<string, string>
  } | null>(null)

  const handleCssChange = (value: string) => {
    setCssInput(value)
    setValidationResult(null)

    // Auto-extract theme name if available
    const extractedName = extractThemeName(value)
    if (extractedName && !themeName) {
      setThemeName(extractedName)
    }
  }

  const handleValidate = async () => {
    if (!cssInput.trim()) {
      toast.error('Please enter CSS variables')
      return
    }

    setLoading(true)
    try {
      const result = await validateThemeAction(cssInput)
      setValidationResult(result)

      if (result.isValid) {
        toast.success(
          `Theme is valid with ${Object.keys(result.variables).length} variables`,
        )
      } else {
        toast.error(`Validation failed: ${result.errors.join(', ')}`)
      }
    } catch (error) {
      toast.error('Failed to validate theme')
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async (activate = false) => {
    if (!cssInput.trim() || !themeName.trim()) {
      toast.error('Please provide both CSS variables and theme name')
      return
    }

    if (!validationResult?.isValid) {
      toast.error('Please validate the theme first')
      return
    }

    setLoading(true)
    try {
      const result = await createCustomThemeAction(
        themeName,
        cssInput,
        activate,
      )

      if (result.success) {
        toast.success(
          `Theme "${themeName}" ${activate ? 'created and activated' : 'created'} successfully`,
        )
        setCssInput('')
        setThemeName('')
        setValidationResult(null)
        onThemeCreated?.()
      } else {
        toast.error(result.error || 'Failed to create theme')
      }
    } catch (error) {
      toast.error('Failed to create theme')
    } finally {
      setLoading(false)
    }
  }

  const handlePasteExample = () => {
    const exampleCSS = `:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 262.1 83.3% 57.8%;
  --primary-foreground: 0 0% 98%;
  --secondary: 240 4.8% 95.9%;
  --secondary-foreground: 240 5.9% 10%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --accent: 240 4.8% 95.9%;
  --accent-foreground: 240 5.9% 10%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 5.9% 90%;
  --input: 240 5.9% 90%;
  --ring: 262.1 83.3% 57.8%;
  --radius: 0.5rem;
}`
    setCssInput(exampleCSS)
    setThemeName('Custom Purple Theme')
  }

  const parsedVariables = cssInput ? parseCSS(cssInput).variables : {}

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import Custom Theme
        </CardTitle>
        <CardDescription>
          Paste CSS variables from tweakcn, shadcn/ui generators, or create your
          own
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="css-input">CSS Variables</Label>
            <Button
              variant="link"
              size="sm"
              onClick={handlePasteExample}
              className="text-xs"
            >
              Paste Example
            </Button>
          </div>
          <Textarea
            id="css-input"
            placeholder={`Paste your CSS variables here:

:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  /* ... more variables */
}`}
            value={cssInput}
            onChange={(e) => handleCssChange(e.target.value)}
            className="min-h-[200px] font-mono text-sm"
          />
          {Object.keys(parsedVariables).length > 0 && (
            <div className="text-sm text-muted-foreground">
              Found {Object.keys(parsedVariables).length} CSS variables
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="theme-name">Theme Name</Label>
          <Input
            id="theme-name"
            placeholder="My Custom Theme"
            value={themeName}
            onChange={(e) => setThemeName(e.target.value)}
          />
        </div>

        {validationResult && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {validationResult.isValid ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm font-medium">
                {validationResult.isValid ? 'Valid Theme' : 'Invalid Theme'}
              </span>
            </div>

            {!validationResult.isValid && (
              <div className="space-y-1">
                {validationResult.errors.map((error, index) => (
                  <Badge key={index} variant="destructive" className="text-xs">
                    {error}
                  </Badge>
                ))}
              </div>
            )}

            {validationResult.isValid && (
              <div className="text-sm text-muted-foreground">
                {Object.keys(validationResult.variables).length} variables
                detected
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            variant="outline"
            onClick={handleValidate}
            disabled={loading || !cssInput.trim()}
          >
            {loading ? 'Validating...' : 'Validate'}
          </Button>

          <Button
            onClick={() => handleImport(false)}
            disabled={
              loading || !validationResult?.isValid || !themeName.trim()
            }
          >
            {loading ? 'Creating...' : 'Create Theme'}
          </Button>

          <Button
            onClick={() => handleImport(true)}
            disabled={
              loading || !validationResult?.isValid || !themeName.trim()
            }
          >
            {loading ? 'Creating...' : 'Create & Apply'}
          </Button>
        </div>

        <div className="mt-4 rounded-lg bg-muted p-3">
          <p className="text-sm text-muted-foreground">
            <strong>Tip:</strong> Visit{' '}
            <a
              href="https://ui.shadcn.com/themes"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              shadcn/ui themes
            </a>{' '}
            or{' '}
            <a
              href="https://tweakcn.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              tweakcn.com
            </a>{' '}
            to generate custom themes, then copy the CSS variables here.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
