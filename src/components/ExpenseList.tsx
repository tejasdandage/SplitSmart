
import { useState } from "react";
import { useExpenseStore } from "@/store/expenseStore";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import ExpenseCard from "./ExpenseCard";
import { Expense } from "@/types";

const EXPENSE_CATEGORIES = [
  "All Categories",
  "Food & Drink",
  "Transportation",
  "Housing",
  "Entertainment",
  "Utilities",
  "Travel",
  "Shopping",
  "Other",
  "Settlement",
];

const ExpenseList = () => {
  const { expenses } = useExpenseStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  
  // Filter expenses based on search query and category
  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (expense.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    
    const matchesCategory = categoryFilter === "All Categories" || 
                           expense.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="search" className="sr-only">
            Search Expenses
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        
        <div className="w-full md:w-48">
          <Label htmlFor="category-filter" className="sr-only">
            Filter by Category
          </Label>
          <Select
            value={categoryFilter}
            onValueChange={setCategoryFilter}
          >
            <SelectTrigger id="category-filter">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              {EXPENSE_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {filteredExpenses.length === 0 ? (
        <div className="text-center p-10">
          <p className="text-muted-foreground">
            {expenses.length === 0
              ? "No expenses added yet. Add your first expense to get started!"
              : "No expenses match your search criteria."}
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-350px)] pr-4">
          {filteredExpenses.map((expense) => (
            <ExpenseCard key={expense.id} expense={expense} />
          ))}
        </ScrollArea>
      )}
    </div>
  );
};

export default ExpenseList;
