import AdminLayout from "@/components/admin/admin-layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, 
  UserPlus,
  MoreVertical, 
  RefreshCw,
  Edit, 
  Trash, 
  CheckCircle, 
  XCircle,
  ShieldAlert
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

// Mock user data for demonstration
const users = [
  { 
    id: 1, 
    username: "admin", 
    email: "admin@shopnest.com", 
    firstName: "Admin", 
    lastName: "User", 
    isAdmin: true, 
    createdAt: "2023-10-01",
    status: "active"
  },
  { 
    id: 2, 
    username: "johndoe", 
    email: "john@example.com", 
    firstName: "John", 
    lastName: "Doe", 
    isAdmin: false, 
    createdAt: "2023-10-15",
    status: "active"
  },
  { 
    id: 3, 
    username: "janedoe", 
    email: "jane@example.com", 
    firstName: "Jane", 
    lastName: "Doe", 
    isAdmin: false, 
    createdAt: "2023-10-20",
    status: "active"
  },
  { 
    id: 4, 
    username: "mikebrown", 
    email: "mike@example.com", 
    firstName: "Mike", 
    lastName: "Brown", 
    isAdmin: false, 
    createdAt: "2023-11-01",
    status: "inactive"
  },
  { 
    id: 5, 
    username: "sarahsmith", 
    email: "sarah@example.com", 
    firstName: "Sarah", 
    lastName: "Smith", 
    isAdmin: false, 
    createdAt: "2023-11-05",
    status: "active"
  },
];

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  // This would normally fetch users from an API
  // For now, we're using the mock data
  const { data, isLoading } = useQuery({
    queryKey: ["/api/users"],
    queryFn: () => Promise.resolve(users),
  });

  const filteredUsers = data?.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const toggleSelectUser = (userId: number) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const refreshData = () => {
    // This would normally trigger a refetch
    // Since we're using mock data, it's just a placeholder
  };

  const handleDelete = (userId: number) => {
    // This would normally make an API call to delete the user
    console.log(`Delete user ${userId}`);
  };

  const handleEdit = (userId: number) => {
    // This would normally navigate to an edit form or open a modal
    console.log(`Edit user ${userId}`);
  };

  const handleToggleAdmin = (userId: number, makeAdmin: boolean) => {
    // This would normally make an API call to toggle the admin status
    console.log(`${makeAdmin ? 'Make' : 'Remove'} admin for user ${userId}`);
  };

  const handleToggleStatus = (userId: number, activate: boolean) => {
    // This would normally make an API call to toggle the status
    console.log(`${activate ? 'Activate' : 'Deactivate'} user ${userId}`);
  };

  return (
    <AdminLayout title="User Management">
      <div className="space-y-4">
        {/* Header with search and actions */}
        <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={refreshData}>
              <RefreshCw className="mr-1 h-4 w-4" />
              Refresh
            </Button>
            <Button size="sm">
              <UserPlus className="mr-1 h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>

        {/* Users Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    <div className="flex items-center space-x-1">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                        onChange={toggleSelectAll}
                      />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Created
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      Loading users...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleSelectUser(user.id)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                              <span className="text-sm font-medium leading-none text-gray-900">
                                {user.firstName[0]}{user.lastName[0]}
                              </span>
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                            <div className="text-sm text-gray-500">@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {user.isAdmin ? (
                          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                            <ShieldAlert className="mr-1 h-3 w-3" />
                            Admin
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-600">
                            Customer
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {user.status === 'active' ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                            Inactive
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.createdAt}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEdit(user.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.isAdmin ? (
                              <DropdownMenuItem onClick={() => handleToggleAdmin(user.id, false)}>
                                <XCircle className="mr-2 h-4 w-4" />
                                Remove Admin
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleToggleAdmin(user.id, true)}>
                                <ShieldAlert className="mr-2 h-4 w-4" />
                                Make Admin
                              </DropdownMenuItem>
                            )}
                            {user.status === 'active' ? (
                              <DropdownMenuItem onClick={() => handleToggleStatus(user.id, false)}>
                                <XCircle className="mr-2 h-4 w-4" />
                                Deactivate
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleToggleStatus(user.id, true)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Activate
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600" 
                              onClick={() => handleDelete(user.id)}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}