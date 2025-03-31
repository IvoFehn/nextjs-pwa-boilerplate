interface UserData {
  id: string;
  username: string;
}

interface UserManagementProps {
  onLogin: (user: UserData) => void;
}
