
import { useState } from "react";
import { useExpenseStore } from "@/store/expenseStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";
import { CalendarIcon, DollarSign, PlusCircle, Users2 } from "lucide-react";
import UserAvatar from "./UserAvatar";
import { ExpenseSplit } from "@/types";
import { formatCurrency } from "@/utils/expenseUtils";

const expenseCategories = [
  "Food & Drink",
  "Transportation",
  "Housing",
  "Entertainment",
  "Utilities",
  "Travel",
  "Shopping",
  "Other",
];

const AddExpenseForm = () => {
  const { friends, currentUser, addExpense } = useExpenseStore();
  const [open, setOpen] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(expenseCategories[0]);
  const [paidBy, setPaidBy] = useState(currentUser.id);
  const [splitType, setSplitType] = useState<"equal" | "custom">("equal");
  const [splits, setSplits] = useState<ExpenseSplit[]>([]);
  
  // Participants state (including current user)
  const [allParticipants] = useState([currentUser, ...friends]);
  
  // Reset form
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setAmount("");
    setCategory(expenseCategories[0]);
    setPaidBy(currentUser.id);
    setSplitType("equal");
    setSplits([]);
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !amount || isNaN(parseFloat(amount))) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    const totalAmount = parseFloat(amount);
    
    // Generate splits based on splitType
    let expenseSplits: ExpenseSplit[] = [];
    
    if (splitType === "equal") {
      // Equal split among all participants
      const perPersonAmount = totalAmount / allParticipants.length;
      
      expenseSplits = allParticipants.map((person) => ({
        friendId: person.id,
        amount: perPersonAmount,
        paid: person.id === paidBy,
      }));
    } else {
      // Use custom splits
      if (splits.reduce((sum, split) => sum + split.amount, 0).toFixed(2) !== totalAmount.toFixed(2)) {
        toast.error("Split amounts must add up to the total");
        return;
      }
      expenseSplits = splits;
    }
    
    // Create new expense
    addExpense({
      title,
      description,
      totalAmount,
      date: new Date(),
      paidBy,
      category,
      splits: expenseSplits,
    });
    
    toast.success("Expense added successfully");
    resetForm();
    setOpen(false);
  };
  
  // Update splits when amount or splitType changes
  const updateSplits = (newAmount: string, newSplitType: "equal" | "custom") => {
    if (newSplitType === "equal" || !newAmount || isNaN(parseFloat(newAmount))) {
      setSplits([]);
      return;
    }
    
    const totalAmount = parseFloat(newAmount);
    const equalShare = totalAmount / allParticipants.length;
    
    // Initialize custom splits with equal values
    const newSplits = allParticipants.map((person) => ({
      friendId: person.id,
      amount: equalShare,
      paid: person.id === paidBy,
    }));
    
    setSplits(newSplits);
  };
  
  // Update amount values for splits
  const updateSplitAmount = (friendId: string, newAmount: string) => {
    if (isNaN(parseFloat(newAmount))) return;
    
    const newSplits = splits.map((split) => {
      if (split.friendId === friendId) {
        return {
          ...split,
          amount: parseFloat(newAmount),
        };
      }
      return split;
    });
    
    setSplits(newSplits);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Add Expense
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Dinner, Movie tickets, etc."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Total Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    updateSplits(e.target.value, splitType);
                  }}
                  className="pl-9"
                  required
                  type="number"
                  step="0.01"
                  min="0.01"
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={category}
                onValueChange={setCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paidBy">Paid By</Label>
              <Select
                value={paidBy}
                onValueChange={(value) => {
                  setPaidBy(value);
                  if (splitType === "custom") {
                    const updatedSplits = splits.map((split) => ({
                      ...split,
                      paid: split.friendId === value,
                    }));
                    setSplits(updatedSplits);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Who Paid" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={currentUser.id}>
                    <div className="flex items-center gap-2">
                      <UserAvatar friend={currentUser} size="sm" />
                      <span>You</span>
                    </div>
                  </SelectItem>
                  {friends.map((friend) => (
                    <SelectItem key={friend.id} value={friend.id}>
                      <div className="flex items-center gap-2">
                        <UserAvatar friend={friend} size="sm" />
                        <span>{friend.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add details about this expense..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Split Type</Label>
            <Tabs
              value={splitType}
              onValueChange={(value) => {
                setSplitType(value as "equal" | "custom");
                updateSplits(amount, value as "equal" | "custom");
              }}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="equal">Split Equally</TabsTrigger>
                <TabsTrigger value="custom">Custom Split</TabsTrigger>
              </TabsList>
              
              <TabsContent value="equal" className="pt-4">
                <div className="text-center text-sm text-muted-foreground">
                  <Users2 className="h-5 w-5 mx-auto mb-2" />
                  This expense will be split equally among all participants.
                  {amount && !isNaN(parseFloat(amount)) && (
                    <p className="mt-2 font-medium">
                      Each person pays: {formatCurrency(parseFloat(amount) / allParticipants.length)}
                    </p>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="custom" className="pt-4">
                {splits.length > 0 ? (
                  <div className="space-y-3">
                    {splits.map((split, index) => {
                      const person = allParticipants.find(p => p.id === split.friendId)!;
                      
                      return (
                        <div key={person.id} className="flex items-center gap-3">
                          <UserAvatar friend={person} size="sm" />
                          <span className="w-20 text-sm">
                            {person.id === currentUser.id ? "You" : person.name}
                          </span>
                          <div className="flex-1">
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                value={split.amount}
                                onChange={(e) => updateSplitAmount(person.id, e.target.value)}
                                className="pl-9"
                                type="number"
                                step="0.01"
                                min="0"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    <div className="flex justify-between text-sm pt-2">
                      <span>Total:</span>
                      <span className={`font-semibold ${
                        amount && 
                        !isNaN(parseFloat(amount)) && 
                        splits.reduce((sum, split) => sum + split.amount, 0).toFixed(2) !== parseFloat(amount).toFixed(2)
                          ? "text-destructive"
                          : ""
                      }`}>
                        {formatCurrency(splits.reduce((sum, split) => sum + split.amount, 0))} 
                        {amount && 
                         !isNaN(parseFloat(amount)) && 
                         splits.reduce((sum, split) => sum + split.amount, 0).toFixed(2) !== parseFloat(amount).toFixed(2)
                          ? ` (should be ${formatCurrency(parseFloat(amount))})`
                          : ""}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-sm text-muted-foreground">
                    Enter a total amount first to configure custom splits.
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
          
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Expense</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddExpenseForm;
