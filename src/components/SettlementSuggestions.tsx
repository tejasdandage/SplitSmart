
import { useExpenseStore } from "@/store/expenseStore";
import { formatCurrency } from "@/utils/expenseUtils";
import UserAvatar from "./UserAvatar";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  CheckCircle2,
  DollarSign
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const SettlementSuggestions = () => {
  const { 
    settlementSuggestions, 
    friends, 
    currentUser,
    settleDebt
  } = useExpenseStore();
  
  const [settlingIndex, setSettlingIndex] = useState<number | null>(null);
  
  if (settlementSuggestions.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">No settlements needed at this time.</p>
      </div>
    );
  }
  
  const findName = (id: string) => {
    if (id === currentUser.id) return "You";
    const friend = friends.find(f => f.id === id);
    return friend ? friend.name : "Unknown";
  };
  
  const handleSettle = (index: number) => {
    setSettlingIndex(index);
    
    const suggestion = settlementSuggestions[index];
    const { fromFriendId, toFriendId, amount } = suggestion;
    
    // Record the settlement
    settleDebt(fromFriendId, toFriendId, amount);
    
    // Show toast notification
    toast.success("Settlement recorded", {
      description: `${findName(fromFriendId)} paid ${formatCurrency(amount)} to ${findName(toFriendId)}`,
    });
    
    // Reset settling state
    setTimeout(() => {
      setSettlingIndex(null);
    }, 1000);
  };
  
  return (
    <div className="space-y-3">
      {settlementSuggestions.map((suggestion, index) => {
        const { fromFriendId, toFriendId, amount } = suggestion;
        const isSettling = settlingIndex === index;
        
        const fromPerson = fromFriendId === currentUser.id 
          ? currentUser 
          : friends.find(f => f.id === fromFriendId) || { id: "", name: "Unknown" };
          
        const toPerson = toFriendId === currentUser.id 
          ? currentUser 
          : friends.find(f => f.id === toFriendId) || { id: "", name: "Unknown" };
          
        const isYouFrom = fromPerson.id === currentUser.id;
        const isYouTo = toPerson.id === currentUser.id;
        
        return (
          <div 
            key={`${fromFriendId}-${toFriendId}-${index}`}
            className="bg-card rounded-lg p-4 border shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserAvatar friend={fromPerson} />
                <div className="flex flex-col">
                  <span className="font-medium">
                    {isYouFrom ? "You" : fromPerson.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    should pay
                  </span>
                </div>
              </div>
              
              <div className="flex items-center">
                <ArrowRight className="h-5 w-5 text-muted-foreground mx-2" />
                <div className="px-3 py-1 bg-primary/10 rounded-full text-primary font-medium">
                  {formatCurrency(amount)}
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground mx-2" />
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="font-medium">
                    {isYouTo ? "You" : toPerson.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    to settle up
                  </span>
                </div>
                <UserAvatar friend={toPerson} />
              </div>
            </div>
            
            <div className="mt-3 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSettle(index)}
                disabled={isSettling}
                className={isSettling ? "bg-green-500 text-white" : ""}
              >
                {isSettling ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Recorded
                  </>
                ) : (
                  <>
                    <DollarSign className="h-4 w-4 mr-1" />
                    Record Payment
                  </>
                )}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SettlementSuggestions;
