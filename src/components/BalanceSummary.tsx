
import { useExpenseStore } from "@/store/expenseStore";
import { formatCurrency } from "@/utils/expenseUtils";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

const BalanceSummary = () => {
  const { totalYouOwe, totalOwedToYou } = useExpenseStore();
  const netBalance = totalOwedToYou - totalYouOwe;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-accent text-accent-foreground rounded-lg p-5 flex flex-col items-center justify-center">
        <div className="flex items-center mb-1">
          <ArrowUpIcon className="h-5 w-5 mr-1 text-expense" />
          <h3 className="text-lg font-medium">You owe</h3>
        </div>
        <p className="text-2xl font-bold text-expense-dark">
          {formatCurrency(totalYouOwe)}
        </p>
      </div>
      
      <div className="bg-primary/10 rounded-lg p-5 flex flex-col items-center justify-center">
        <h3 className="text-lg font-medium mb-1">Net Balance</h3>
        <p className={`text-2xl font-bold ${
          netBalance > 0 
            ? "text-income-dark" 
            : netBalance < 0 
              ? "text-expense-dark" 
              : "text-primary"
        }`}>
          {formatCurrency(netBalance)}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {netBalance > 0 
            ? "You are owed money" 
            : netBalance < 0 
              ? "You owe money" 
              : "All settled up!"}
        </p>
      </div>
      
      <div className="bg-accent text-accent-foreground rounded-lg p-5 flex flex-col items-center justify-center">
        <div className="flex items-center mb-1">
          <ArrowDownIcon className="h-5 w-5 mr-1 text-income" />
          <h3 className="text-lg font-medium">You are owed</h3>
        </div>
        <p className="text-2xl font-bold text-income-dark">
          {formatCurrency(totalOwedToYou)}
        </p>
      </div>
    </div>
  );
};

export default BalanceSummary;
