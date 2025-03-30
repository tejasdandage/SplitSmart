
import { create } from 'zustand';
import { Balance, Expense, Friend, SettlementSuggestion } from '@/types';
import { 
  calculateBalances,
  generateSettlementSuggestions,
  calculateTotalYouOwe,
  calculateTotalOwedToYou,
  generateId
} from '@/utils/expenseUtils';
import { persist } from 'zustand/middleware';

interface ExpenseStore {
  // Data
  currentUser: Friend;
  friends: Friend[];
  expenses: Expense[];
  
  // Derived data
  balances: Balance[];
  settlementSuggestions: SettlementSuggestion[];
  totalYouOwe: number;
  totalOwedToYou: number;
  
  // Actions
  addFriend: (name: string) => void;
  removeFriend: (id: string) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (expense: Expense) => void;
  removeExpense: (id: string) => void;
  settleDebt: (fromFriendId: string, toFriendId: string, amount: number) => void;
  recalculateBalances: () => void;
}

export const useExpenseStore = create<ExpenseStore>()(
  persist(
    (set, get) => ({
      // Default current user
      currentUser: {
        id: 'current-user',
        name: 'You',
      },
      
      // Initial empty state
      friends: [
        { id: 'friend-1', name: 'Alex' },
        { id: 'friend-2', name: 'Taylor' },
        { id: 'friend-3', name: 'Jordan' },
      ],
      expenses: [],
      
      // Computed values (will be calculated in the set functions)
      balances: [],
      settlementSuggestions: [],
      totalYouOwe: 0,
      totalOwedToYou: 0,
      
      // Recalculate derived data
      recalculateBalances: () => {
        const { expenses, currentUser } = get();
        const balances = calculateBalances(expenses, currentUser.id);
        const settlementSuggestions = generateSettlementSuggestions(balances, currentUser.id);
        const totalYouOwe = calculateTotalYouOwe(balances, currentUser.id);
        const totalOwedToYou = calculateTotalOwedToYou(balances, currentUser.id);
        
        set({
          balances,
          settlementSuggestions,
          totalYouOwe,
          totalOwedToYou,
        });
      },
      
      // Actions
      addFriend: (name) => {
        const newFriend: Friend = {
          id: `friend-${generateId()}`,
          name,
        };
        
        set((state) => ({
          friends: [...state.friends, newFriend],
        }));
      },
      
      removeFriend: (id) => {
        set((state) => {
          // Remove friend
          const updatedFriends = state.friends.filter(friend => friend.id !== id);
          
          // Remove expenses involving this friend
          const updatedExpenses = state.expenses.filter(expense => {
            if (expense.paidBy === id) return false;
            if (expense.splits.some(split => split.friendId === id)) return false;
            return true;
          });
          
          return {
            friends: updatedFriends,
            expenses: updatedExpenses,
          };
        });
        
        // Recalculate balances
        get().recalculateBalances();
      },
      
      addExpense: (newExpense) => {
        const expense: Expense = {
          ...newExpense,
          id: `expense-${generateId()}`,
        };
        
        set((state) => ({
          expenses: [expense, ...state.expenses],
        }));
        
        // Recalculate balances
        get().recalculateBalances();
      },
      
      updateExpense: (updatedExpense) => {
        set((state) => ({
          expenses: state.expenses.map(expense => 
            expense.id === updatedExpense.id ? updatedExpense : expense
          ),
        }));
        
        // Recalculate balances
        get().recalculateBalances();
      },
      
      removeExpense: (id) => {
        set((state) => ({
          expenses: state.expenses.filter(expense => expense.id !== id),
        }));
        
        // Recalculate balances
        get().recalculateBalances();
      },
      
      settleDebt: (fromFriendId, toFriendId, amount) => {
        const newExpense: Omit<Expense, 'id'> = {
          title: 'Settlement Payment',
          description: 'Debt settlement',
          totalAmount: amount,
          date: new Date(),
          paidBy: fromFriendId,
          category: 'Settlement',
          splits: [
            { friendId: toFriendId, amount, paid: true }
          ],
        };
        
        get().addExpense(newExpense);
      },
    }),
    {
      name: 'expense-store',
    }
  )
);
