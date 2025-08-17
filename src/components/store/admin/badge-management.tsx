'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Switch } from '~/components/ui/switch'
import { Badge } from '~/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { 
  Shield, 
  Truck, 
  Check, 
  Clock,
  Package,
  CreditCard,
  Heart,
  Award,
  Star,
  Gift,
  Lock,
  Zap,
  Users,
  Globe,
  MessageCircle,
  Plus,
  Edit,
  Trash2,
  GripVertical,
  Save
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '~/lib/utils'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '~/components/ui/alert-dialog'

// Predefined badge options
const PREDEFINED_BADGES = [
  { icon: 'Shield', text: '30-day returns', description: 'Money-back guarantee' },
  { icon: 'Truck', text: 'Secure shipping', description: 'Safe delivery guaranteed' },
  { icon: 'Check', text: 'Quality guaranteed', description: 'Premium quality assurance' },
  { icon: 'Clock', text: 'Fast processing', description: 'Quick order processing' },
  { icon: 'Package', text: 'Careful packaging', description: 'Professional packaging' },
  { icon: 'CreditCard', text: 'Secure payment', description: 'Safe payment processing' },
  { icon: 'Heart', text: 'Made with care', description: 'Handcrafted with attention' },
  { icon: 'Award', text: 'Award winning', description: 'Recognition for excellence' },
  { icon: 'Star', text: '5-star rated', description: 'Top customer ratings' },
  { icon: 'Gift', text: 'Gift wrapping', description: 'Available gift options' },
  { icon: 'Lock', text: 'Privacy protected', description: 'Data security guaranteed' },
  { icon: 'Zap', text: 'Lightning fast', description: 'Quick delivery' },
  { icon: 'Users', text: 'Trusted by thousands', description: 'Large customer base' },
  { icon: 'Globe', text: 'Worldwide shipping', description: 'Global delivery available' },
  { icon: 'MessageCircle', text: '24/7 support', description: 'Round-the-clock assistance' },
]

const ICON_COMPONENTS = {
  Shield, Truck, Check, Clock, Package, CreditCard, Heart, Award, Star, Gift, Lock, Zap, Users, Globe, MessageCircle
}

interface StoreBadge {
  id: string
  name: string
  icon: string
  text: string
  order: number
  active: boolean
  isDefault: boolean
}

interface BadgeManagementProps {
  className?: string
}

export function BadgeManagement({ className }: BadgeManagementProps) {
  const [badges, setBadges] = useState<StoreBadge[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingBadge, setEditingBadge] = useState<StoreBadge | null>(null)
  const [draggedItem, setDraggedItem] = useState<StoreBadge | null>(null)
  const [newBadge, setNewBadge] = useState({
    name: '',
    icon: 'Shield',
    text: '',
    active: true
  })

  // Simulate loading badges (replace with actual API call)
  useEffect(() => {
    const loadBadges = async () => {
      setLoading(true)
      try {
        // Simulate API call - replace with actual implementation
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Default badges
        setBadges([
          {
            id: '1',
            name: '30-day returns',
            icon: 'Shield',
            text: '30-day returns',
            order: 0,
            active: true,
            isDefault: true
          },
          {
            id: '2',
            name: 'Secure shipping',
            icon: 'Truck',
            text: 'Secure shipping',
            order: 1,
            active: true,
            isDefault: true
          }
        ])
      } catch (error) {
        toast.error('Failed to load badges')
      } finally {
        setLoading(false)
      }
    }
    
    loadBadges()
  }, [])

  const handleAddBadge = async () => {
    if (!newBadge.name.trim() || !newBadge.text.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const badge: StoreBadge = {
        id: Date.now().toString(),
        name: newBadge.name,
        icon: newBadge.icon,
        text: newBadge.text,
        order: badges.length,
        active: newBadge.active,
        isDefault: false
      }

      setBadges(prev => [...prev, badge])
      setNewBadge({ name: '', icon: 'Shield', text: '', active: true })
      setShowAddDialog(false)
      toast.success('Badge added successfully')
    } catch (error) {
      toast.error('Failed to add badge')
    }
  }

  const handleUpdateBadge = async (badgeId: string, updates: Partial<StoreBadge>) => {
    try {
      setBadges(prev => prev.map(badge => 
        badge.id === badgeId ? { ...badge, ...updates } : badge
      ))
      toast.success('Badge updated successfully')
    } catch (error) {
      toast.error('Failed to update badge')
    }
  }

  const handleDeleteBadge = async (badgeId: string) => {
    try {
      setBadges(prev => prev.filter(badge => badge.id !== badgeId))
      toast.success('Badge deleted successfully')
    } catch (error) {
      toast.error('Failed to delete badge')
    }
  }

  const handleReorderBadges = (startIndex: number, endIndex: number) => {
    const result = Array.from(badges)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)
    
    // Update order
    const reorderedBadges = result.map((badge, index) => ({
      ...badge,
      order: index
    }))
    
    setBadges(reorderedBadges)
    toast.success('Badge order updated')
  }

  const handlePredefinedBadgeSelect = (predefined: typeof PREDEFINED_BADGES[0]) => {
    setNewBadge({
      name: predefined.text,
      icon: predefined.icon,
      text: predefined.text,
      active: true
    })
  }

  const renderIcon = (iconName: string) => {
    const IconComponent = ICON_COMPONENTS[iconName as keyof typeof ICON_COMPONENTS]
    return IconComponent ? <IconComponent className="h-4 w-4" /> : <Shield className="h-4 w-4" />
  }

  const activeBadges = badges.filter(badge => badge.active).sort((a, b) => a.order - b.order)

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Badge Management</CardTitle>
          <CardDescription>Loading badges...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Badge Management
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Badge
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Badge</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Choose from predefined options</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {PREDEFINED_BADGES.map((predefined, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handlePredefinedBadgeSelect(predefined)}
                        className="justify-start"
                      >
                        {renderIcon(predefined.icon)}
                        <span className="ml-2 text-xs">{predefined.text}</span>
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4 border-t pt-4">
                  <div>
                    <Label htmlFor="badge-name">Badge Name</Label>
                    <Input
                      id="badge-name"
                      value={newBadge.name}
                      onChange={(e) => setNewBadge(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter badge name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="badge-text">Display Text</Label>
                    <Input
                      id="badge-text"
                      value={newBadge.text}
                      onChange={(e) => setNewBadge(prev => ({ ...prev, text: e.target.value }))}
                      placeholder="Enter display text"
                    />
                  </div>
                  <div>
                    <Label htmlFor="badge-icon">Icon</Label>
                    <Select value={newBadge.icon} onValueChange={(value) => setNewBadge(prev => ({ ...prev, icon: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(ICON_COMPONENTS).map((iconName) => (
                          <SelectItem key={iconName} value={iconName}>
                            <div className="flex items-center">
                              {renderIcon(iconName)}
                              <span className="ml-2">{iconName}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="badge-active"
                      checked={newBadge.active}
                      onCheckedChange={(checked) => setNewBadge(prev => ({ ...prev, active: checked }))}
                    />
                    <Label htmlFor="badge-active">Active</Label>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddBadge}>Add Badge</Button>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
        <CardDescription>
          Manage the badges displayed on product pages. Drag to reorder.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Preview */}
          <div>
            <Label className="text-sm font-medium">Preview (Active badges only)</Label>
            <div className="mt-2 p-4 border rounded-lg bg-gray-50">
              {activeBadges.length > 0 ? (
                <div className="flex flex-wrap justify-center items-center gap-4 text-center text-sm text-gray-600">
                  {activeBadges.map((badge) => (
                    <div key={badge.id} className="flex flex-col items-center gap-1 min-w-0 flex-shrink-0">
                      {renderIcon(badge.icon)}
                      <span className="whitespace-nowrap">{badge.text}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">No active badges</p>
              )}
            </div>
          </div>

          {/* Badge List */}
          <div>
            <Label className="text-sm font-medium">All Badges</Label>
            <div className="mt-2 space-y-2">
              {badges.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No badges created yet. Add your first badge to get started.
                </div>
              ) : (
                badges.map((badge, index) => (
                  <div
                    key={badge.id}
                    className={cn(
                      "flex items-center justify-between p-3 border rounded-lg",
                      badge.active ? "bg-white" : "bg-gray-50 opacity-60"
                    )}
                    draggable
                    onDragStart={() => setDraggedItem(badge)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (draggedItem) {
                        const dragIndex = badges.findIndex(b => b.id === draggedItem.id)
                        const dropIndex = index
                        handleReorderBadges(dragIndex, dropIndex)
                        setDraggedItem(null)
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
                      {renderIcon(badge.icon)}
                      <div>
                        <div className="font-medium">{badge.name}</div>
                        <div className="text-sm text-gray-500">{badge.text}</div>
                      </div>
                      {badge.isDefault && (
                        <Badge variant="secondary" className="text-xs">Default</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={badge.active}
                        onCheckedChange={(checked) => handleUpdateBadge(badge.id, { active: checked })}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingBadge(badge)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {!badge.isDefault && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Badge</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{badge.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteBadge(badge.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>

      {/* Edit Badge Dialog */}
      {editingBadge && (
        <Dialog open={!!editingBadge} onOpenChange={() => setEditingBadge(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Badge</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-badge-name">Badge Name</Label>
                <Input
                  id="edit-badge-name"
                  value={editingBadge.name}
                  onChange={(e) => setEditingBadge(prev => prev ? { ...prev, name: e.target.value } : null)}
                  placeholder="Enter badge name"
                />
              </div>
              <div>
                <Label htmlFor="edit-badge-text">Display Text</Label>
                <Input
                  id="edit-badge-text"
                  value={editingBadge.text}
                  onChange={(e) => setEditingBadge(prev => prev ? { ...prev, text: e.target.value } : null)}
                  placeholder="Enter display text"
                />
              </div>
              <div>
                <Label htmlFor="edit-badge-icon">Icon</Label>
                <Select 
                  value={editingBadge.icon} 
                  onValueChange={(value) => setEditingBadge(prev => prev ? { ...prev, icon: value } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(ICON_COMPONENTS).map((iconName) => (
                      <SelectItem key={iconName} value={iconName}>
                        <div className="flex items-center">
                          {renderIcon(iconName)}
                          <span className="ml-2">{iconName}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => {
                  if (editingBadge) {
                    handleUpdateBadge(editingBadge.id, editingBadge)
                    setEditingBadge(null)
                  }
                }}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditingBadge(null)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  )
}