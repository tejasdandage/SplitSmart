
import { Expense, Friend } from "@/types";
import { formatCurrency } from "@/utils/expenseUtils";
import { useExpenseStore } from "@/store/expenseStore";
import UserAvatar from "./UserAvatar";
import { 
  Calendar, 
  DollarSign,
  Receipt,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent,
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ExpenseCardProps {
  expense: Expense;
}

const ExpenseCard = ({ expense }: ExpenseCardProps) => {
  const { friends, currentUser, removeExpense } = useExpenseStore();
  
  const findFriend = (id: string): Friend => {
    if (id === currentUser.id) return currentUser;
    return friends.find((f) => f.id === id) || { id: "", name: "Unknown" };
  };
  
  const payer = findFriend(expense.paidBy);
  const isCurrentUserPayer = payer.id === currentUser.id;
  const formattedDate = new Date(expense.date).toLocaleDateString();
  
  // Find your split
  const yourSplit = expense.splits.find(
    (split) => split.friendId === currentUser.id
  );
  const youOwe = yourSplit ? yourSplit.amount : 0;
  
  return (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-medium">{expense.title}</CardTitle>
            <CardDescription className="text-muted-foreground">
              {expense.category}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-lg font-semibold">
              {formatCurrency(expense.totalAmount)}
            </span>
            <span className="text-xs text-muted-foreground">
              {formattedDate}
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Receipt className="h-4 w-4" />
            <span>Paid by</span>
          </div>
          <div className="flex items-center gap-1">
            <UserAvatar friend={payer} size="sm" />
            <span className="font-medium">
              {isCurrentUserPayer ? "You" : payer.name}
            </span>
          </div>
        </div>
        
        {expense.description && (
          <p className="text-sm text-muted-foreground mb-3">
            {expense.description}
          </p>
        )}
        
        <div className="grid grid-cols-2 gap-3">
          {expense.splits.map((split) => {
            const friend = findFriend(split.friendId);
            const isYou = friend.id === currentUser.id;
            
            return (
              <div 
                key={friend.id} 
                className="flex items-center justify-between p-2 rounded-md bg-secondary"
              >
                <div className="flex items-center gap-2">
                  <UserAvatar friend={friend} size="sm" />
                  <span className="text-sm font-medium">
                    {isYou ? "You" : friend.name}
                  </span>
                </div>
                <span className="text-sm font-semibold">
                  {formatCurrency(split.amount)}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 flex justify-end">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => removeExpense(expense.id)}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ExpenseCard;
