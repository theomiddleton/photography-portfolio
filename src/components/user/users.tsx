'use client'
import React, { useState, useEffect } from 'react'
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
} from '~/components/ui/dropdown-menu'
import { Button } from '~/components/ui/button'
import { MoreHorizontal } from 'lucide-react'
import {
  getUsers,
  deleteUser,
  promoteUser,
  demoteUser,
  type User,
} from '~/lib/auth/userActions'

import {
  DeleteUserDialog,
  PromoteUserDialog,
  DemoteUserDialog,
} from '~/components/user/user-dialogs'

export function UsersTable() {
  const [users, setUsers] = useState<User[]>([])
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [userToPromote, setUserToPromote] = useState<User | null>(null)
  const [userToDemote, setUserToDemote] = useState<User | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    const fetchedUsers = await getUsers()
    setUsers(fetchedUsers)
  }

  const handleDeleteUser = async (userId: number) => {
    await deleteUser(userId)
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId))
    setUserToDelete(null)
  }

  const handlePromoteUser = async (userId: number) => {
    await promoteUser(userId)
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, role: 'admin' } : user,
      ),
    )
    setUserToPromote(null)
  }

  const handleDemoteUser = async (userId: number) => {
    await demoteUser(userId)
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, role: 'user' } : user,
      ),
    )
    setUserToDemote(null)
  }

  const formatDate = (date: Date): string => {
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>See all registered users</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden md:table-cell">Name</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="hidden md:table-cell">Role</TableHead>
              <TableHead className="hidden md:table-cell">
                Last Modified
              </TableHead>
              <TableHead>
                <span className="hidden md:table-cell">User Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {user.email}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={user.role === 'admin' ? 'default' : 'secondary'}
                  >
                    {user.role === 'admin' ? 'Admin' : 'User'}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {formatDate(user.modifiedAt)}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
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
                      <DropdownMenuItem onClick={() => setUserToDelete(user)}>
                        Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="text-muted-foreground text-xs">
          Showing <strong>1-{users.length}</strong> of{' '}
          <strong>{users.length}</strong> users
        </div>
      </CardFooter>

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
    </Card>
  )
}
