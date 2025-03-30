
import { Friend } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface UserAvatarProps {
  friend: Friend;
  size?: "sm" | "md" | "lg";
}

const UserAvatar = ({ friend, size = "md" }: UserAvatarProps) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };

  return (
    <Avatar className={sizeClasses[size]}>
      {friend.avatar ? (
        <img
          src={friend.avatar}
          alt={friend.name}
          className="h-full w-full object-cover"
        />
      ) : (
        <AvatarFallback className="bg-primary text-primary-foreground">
          {getInitials(friend.name)}
        </AvatarFallback>
      )}
    </Avatar>
  );
};

export default UserAvatar;
