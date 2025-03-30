
import { useExpenseStore } from "@/store/expenseStore";
import { formatCurrency } from "@/utils/expenseUtils";
import UserAvatar from "./UserAvatar";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  CheckCircle2,
  DollarSign,
  CreditCard
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
      <div className="p-6 text-center rounded-lg border-2 border-dashed border-muted">
        <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground font-medium">All settled up! No payments needed at this time.</p>
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
    <div className="space-y-4">
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
            className={`rounded-lg p-5 border shadow-sm transition-all ${
              isSettling ? "bg-primary/5 border-primary/20" : "bg-card hover:shadow"
            }`}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative">
                  <UserAvatar friend={fromPerson} className="border-2 border-background" />
                  <div className="absolute -bottom-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    -
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold">
                    {isYouFrom ? "You" : fromPerson.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    needs to pay
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center">
                <ArrowRight className="h-5 w-5 text-muted-foreground hidden sm:block mx-3" />
                <div className="px-4 py-2 bg-primary/10 rounded-full text-primary font-medium text-center">
                  {formatCurrency(amount)}
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground hidden sm:block mx-3" />
              </div>
              
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <div className="flex flex-col items-end">
                  <span className="font-semibold">
                    {isYouTo ? "You" : toPerson.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    will receive
                  </span>
                </div>
                <div className="relative">
                  <UserAvatar friend={toPerson} className="border-2 border-background" />
                  <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    +
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <Button
                variant={isSettling ? "default" : "outline"}
                size="sm"
                onClick={() => handleSettle(index)}
                disabled={isSettling}
                className={`transition-all ${isSettling ? "bg-green-500 hover:bg-green-600 text-white" : ""}`}
              >
                {isSettling ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Recorded
                  </>
                ) : (
                  <>
                    <DollarSign className="h-4 w-4 mr-2" />
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
