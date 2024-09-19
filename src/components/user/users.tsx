'use client'

import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
import { Button } from '~/components/ui/button'
import { MoreHorizontal } from 'lucide-react'

import { getUsers, deleteUser, promoteUser, demoteUser } from '~/lib/auth/userActions'

interface User {
  id: number
  name: string
  email: string
  role: string
  createdAt: Date
  modifiedAt: Date
}

export function UsersTable() {
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    const fetchedUsers = await getUsers()
    setUsers(fetchedUsers)
  }

  const handleDeleteUser = async (userId: number) => {
    const updatedUsers = await deleteUser(userId)
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId))
  }

  const handlePromoteUser = async (userId: number) => {
    const updatedUsers = await promoteUser(userId)
    setUsers(prevUsers => prevUsers.map(user => 
      user.id === userId ? { ...user, role: 'admin' } : user
    ))
  }

  const handleDemoteUser = async (userId: number) => {
    const updatedUsers = await demoteUser(userId)
    setUsers(prevUsers => prevUsers.map(user => 
      user.id === userId ? { ...user, role: 'user' } : user
    ))
  }

  const formatDate = (date: Date): string => {
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>
          See all registered users
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden md:table-cell">Name</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="hidden md:table-cell">Role</TableHead>
              <TableHead className="hidden md:table-cell">Last Modified</TableHead>
              <TableHead>
                <span className="hidden md:table-cell">User Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.name}
                </TableCell>
                <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                    {user.role === "admin" ? "Admin" : "User"}
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
                        <DropdownMenuItem onClick={() => handlePromoteUser(user.id)}>
                          Promote to Admin
                        </DropdownMenuItem>
                      )}
                      {user.role === 'admin' && (
                        <DropdownMenuItem onClick={() => handleDemoteUser(user.id)}>
                          Demote to User
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleDeleteUser(user.id)}>
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
        <div className="text-xs text-muted-foreground">
          Showing <strong>1-{users.length}</strong> of <strong>{users.length}</strong> users
        </div>
      </CardFooter>
    </Card>
  )
}