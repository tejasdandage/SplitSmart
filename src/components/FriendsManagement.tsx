
import { useState } from "react";
import { useExpenseStore } from "@/store/expenseStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { PlusCircle, Trash2, UserPlus, Users } from "lucide-react";
import UserAvatar from "./UserAvatar";

const FriendsManagement = () => {
  const { friends, addFriend, removeFriend } = useExpenseStore();
  const [open, setOpen] = useState(false);
  const [newFriendName, setNewFriendName] = useState("");
  
  const handleAddFriend = () => {
    if (!newFriendName.trim()) {
      toast.error("Please enter a friend's name");
      return;
    }
    
    addFriend(newFriendName.trim());
    setNewFriendName("");
    toast.success(`${newFriendName} added to your friends`);
  };
  
  const handleRemoveFriend = (id: string, name: string) => {
    removeFriend(id);
    toast.success(`${name} removed from your friends`);
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl">Friends</CardTitle>
            <CardDescription>Manage your friends list</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <UserPlus className="h-4 w-4 mr-1" />
                Add Friend
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a New Friend</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Friend's Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter name"
                    value={newFriendName}
                    onChange={(e) => setNewFriendName(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  handleAddFriend();
                  setOpen(false);
                }}>
                  Add Friend
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {friends.length === 0 ? (
          <div className="text-center p-6">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No friends added yet. Add friends to start splitting expenses.</p>
          </div>
        ) : (
          <ScrollArea className={`h-[${Math.min(friends.length * 60, 240)}px]`}>
            <div className="space-y-3">
              {friends.map((friend) => (
                <div 
                  key={friend.id}
                  className="flex items-center justify-between p-3 rounded-md hover:bg-secondary/50"
                >
                  <div className="flex items-center gap-3">
                    <UserAvatar friend={friend} />
                    <span className="font-medium">{friend.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveFriend(friend.id, friend.name)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default FriendsManagement;
