'use client'
import React, { useState, useEffect, useCallback } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '~/components/ui/dropdown-menu'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Pagination } from '~/components/ui/pagination'
import { 
  MoreHorizontal, 
  Search, 
  Users,
  UserCheck,
  Shield,
  Eye,
  RefreshCw,
  Calendar
} from 'lucide-react'
import {
  deleteUser,
  promoteUser,
  demoteUser,
  logoutUser,
  searchUsers,
  getUserStats,
  type User,
  type UserSearchOptions,
} from '~/lib/auth/userActions'

import {
  DeleteUserDialog,
  PromoteUserDialog,
  DemoteUserDialog,
  LogoutUserDialog,
} from '~/components/user/user-dialogs'

const DEFAULT_ITEMS_PER_PAGE = 20

interface UserStats {
  total: number
  admins: number
  active: number
  verified: number
}

export function UsersTable() {
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserStats>({ total: 0, admins: 0, active: 0, verified: 0 })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'locked' | 'unverified'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE)
  const [totalUsers, setTotalUsers] = useState(0)
  
  // Dialog states
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [userToPromote, setUserToPromote] = useState<User | null>(null)
  const [userToDemote, setUserToDemote] = useState<User | null>(null)
  const [userToLogout, setUserToLogout] = useState<User | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const searchOptions: UserSearchOptions = {
        search: searchTerm,
        role: roleFilter,
        status: statusFilter,
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage,
      }

      const result = await searchUsers(searchOptions)
      
      setUsers(result.users)
      setTotalUsers(result.total)
      setCurrentPage(page)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }, [searchTerm, roleFilter, statusFilter, itemsPerPage])

  const fetchStats = async () => {
    try {
      const userStats = await getUserStats()
      setStats(userStats)
    } catch (error) {
      console.error('Failed to fetch user stats:', error)
    }
  }

  useEffect(() => {
    setCurrentPage(1) // Reset to first page when filters change
  }, [searchTerm, roleFilter, statusFilter, itemsPerPage])

  useEffect(() => {
    fetchUsers(currentPage)
  }, [currentPage, fetchUsers])

  useEffect(() => {
    fetchStats()
  }, [])

  const handleDeleteUser = async (userId: number) => {
    await deleteUser(userId)
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId))
    setUserToDelete(null)
    await fetchStats()
  }

  const handlePromoteUser = async (userId: number) => {
    await promoteUser(userId)
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, role: 'admin' } : user,
      ),
    )
    setUserToPromote(null)
    await fetchStats()
  }

  const handleDemoteUser = async (userId: number) => {
    await demoteUser(userId)
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, role: 'user' } : user,
      ),
    )
    setUserToDemote(null)
    await fetchStats()
  }

  const handleLogoutUser = async (userId: number) => {
    await logoutUser(userId)
    setUserToLogout(null)
  }

  const handleRefresh = () => {
    fetchUsers(currentPage)
    fetchStats()
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1) // Reset to first page when changing items per page
  }

  const formatDate = (date: Date | null): string => {
    if (!date) return 'Never'
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(date))
  }

  const getStatusBadge = (user: User) => {
    if (!user.isActive) {
      return <Badge variant="destructive">Inactive</Badge>
    }
    if (user.accountLockedUntil && new Date(user.accountLockedUntil) > new Date()) {
      return <Badge variant="destructive">Locked</Badge>
    }
    if (!user.emailVerified) {
      return <Badge variant="secondary">Unverified</Badge>
    }
    return <Badge variant="default" className="bg-green-500">Active</Badge>
  }

  const totalPages = Math.ceil(totalUsers / itemsPerPage)

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrators</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.admins}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verified}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Users Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Users Management</CardTitle>
              <CardDescription>
                Manage all registered users and their permissions
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={(value: 'all' | 'admin' | 'user') => setRoleFilter(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
                <SelectItem value="user">Users</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value: 'all' | 'active' | 'inactive' | 'locked' | 'unverified') => setStatusFilter(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="locked">Locked</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead className="hidden md:table-cell">Role</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Last Login</TableHead>
                  <TableHead className="hidden lg:table-cell">Joined</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && users.length === 0 ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-muted animate-pulse"></div>
                          <div className="space-y-1">
                            <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
                            <div className="h-3 w-48 bg-muted rounded animate-pulse"></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="h-5 w-16 bg-muted rounded animate-pulse"></div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="h-5 w-16 bg-muted rounded animate-pulse"></div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No users found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                            {user.failedLoginAttempts > 0 && (
                              <div className="text-xs text-red-500">
                                {user.failedLoginAttempts} failed attempts
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge
                          variant={user.role === 'admin' ? 'default' : 'secondary'}
                          className={user.role === 'admin' ? 'bg-purple-600' : ''}
                        >
                          {user.role === 'admin' ? 'Administrator' : 'User'}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {getStatusBadge(user)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="text-sm">
                          {formatDate(user.lastLoginAt)}
                          {user.lastLoginIP && (
                            <div className="text-xs text-muted-foreground">
                              from {user.lastLoginIP}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="mr-1 h-3 w-3" />
                          {formatDate(user.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => setSelectedUser(user)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setUserToLogout(user)}
                            >
                              Force Logout
                            </DropdownMenuItem>
                            {user.role !== 'admin' && (
                              <DropdownMenuItem
                                onClick={() => setUserToPromote(user)}
                              >
                                Promote to Admin
                              </DropdownMenuItem>
                            )}
                            {user.role === 'admin' && (
                              <DropdownMenuItem onClick={() => setUserToDemote(user)}>
                                Demote to User
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => setUserToDelete(user)}
                              className="text-red-600"
                            >
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        <CardFooter>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalUsers}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            className="w-full"
          />
        </CardFooter>
      </Card>

      {/* Dialogs */}
      <DeleteUserDialog
        userToDelete={userToDelete}
        onCancel={() => setUserToDelete(null)}
        onDelete={handleDeleteUser}
      />

      <PromoteUserDialog
        userToPromote={userToPromote}
        onCancel={() => setUserToPromote(null)}
        onPromote={handlePromoteUser}
      />

      <DemoteUserDialog
        userToDemote={userToDemote}
        onCancel={() => setUserToDemote(null)}
        onDemote={handleDemoteUser}
      />

      <LogoutUserDialog
        userToLogout={userToLogout}
        onCancel={() => setUserToLogout(null)}
        onLogout={handleLogoutUser}
      />

      {/* User Details Dialog */}
      {selectedUser && (
        <UserDetailsDialog
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  )
}

// User Details Dialog Component
function UserDetailsDialog({ user, onClose }: { user: User; onClose: () => void }) {
  const formatDate = (date: Date | null): string => {
    if (!date) return 'Never'
    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(date))
  }

  const getDeviceInfo = (userAgent: string | null) => {
    if (!userAgent) return { browser: 'Unknown', os: 'Unknown' }
    
    // Simple user agent parsing (in production, use a proper library)
    const browser = userAgent.includes('Chrome') ? 'Chrome' : 
                   userAgent.includes('Firefox') ? 'Firefox' :
                   userAgent.includes('Safari') ? 'Safari' : 'Unknown'
    
    const os = userAgent.includes('Windows') ? 'Windows' :
               userAgent.includes('Mac') ? 'macOS' :
               userAgent.includes('Linux') ? 'Linux' : 'Unknown'
    
    return { browser, os }
  }

  const device = getDeviceInfo(user.lastLoginUserAgent)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>User Details</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="text-sm">{user.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-sm">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Role</label>
              <div>
                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                  {user.role === 'admin' ? 'Administrator' : 'User'}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div>
                {!user.isActive ? (
                  <Badge variant="destructive">Inactive</Badge>
                ) : !user.emailVerified ? (
                  <Badge variant="secondary">Unverified</Badge>
                ) : user.accountLockedUntil && new Date(user.accountLockedUntil) > new Date() ? (
                  <Badge variant="destructive">Locked</Badge>
                ) : (
                  <Badge variant="default" className="bg-green-500">Active</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Account Dates */}
          <div className="space-y-3">
            <h4 className="font-medium">Account Timeline</h4>
            <div className="grid gap-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Joined</label>
                <p className="text-sm">{formatDate(user.createdAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Modified</label>
                <p className="text-sm">{formatDate(user.modifiedAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Login</label>
                <p className="text-sm">{formatDate(user.lastLoginAt)}</p>
              </div>
            </div>
          </div>

          {/* Security Info */}
          <div className="space-y-3">
            <h4 className="font-medium">Security Information</h4>
            <div className="grid gap-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email Verified</label>
                <p className="text-sm">
                  {user.emailVerified ? (
                    <span className="text-green-600">✓ Verified</span>
                  ) : (
                    <span className="text-red-600">✗ Not Verified</span>
                  )}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Failed Login Attempts</label>
                <p className="text-sm">{user.failedLoginAttempts || 0}</p>
              </div>
              {user.accountLockedUntil && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Account Locked Until</label>
                  <p className="text-sm">{formatDate(user.accountLockedUntil)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Last Login Details */}
          {user.lastLoginAt && (
            <div className="space-y-3">
              <h4 className="font-medium">Last Login Details</h4>
              <div className="grid gap-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">IP Address</label>
                  <p className="text-sm font-mono">{user.lastLoginIP || 'Unknown'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Browser</label>
                  <p className="text-sm">{device.browser}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Operating System</label>
                  <p className="text-sm">{device.os}</p>
                </div>
                {user.lastLoginUserAgent && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">User Agent</label>
                    <p className="text-xs font-mono text-muted-foreground break-all">
                      {user.lastLoginUserAgent}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
