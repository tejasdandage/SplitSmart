
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

// Sample expense data
const sampleExpenses: Omit<Expense, 'id'>[] = [
  {
    title: 'Dinner at Italian Restaurant',
    description: 'Friday night dinner with everyone',
    totalAmount: 120.50,
    date: new Date(2023, 9, 15), // October 15, 2023
    paidBy: 'current-user',
    category: 'Food & Drink',
    splits: [
      { friendId: 'current-user', amount: 30.10, paid: true },
      { friendId: 'friend-1', amount: 30.15, paid: false },
      { friendId: 'friend-2', amount: 30.15, paid: false },
      { friendId: 'friend-3', amount: 30.10, paid: false },
    ],
  },
  {
    title: 'Uber Ride',
    description: 'Ride to the concert',
    totalAmount: 45.75,
    date: new Date(2023, 9, 20), // October 20, 2023
    paidBy: 'friend-1',
    category: 'Transportation',
    splits: [
      { friendId: 'current-user', amount: 15.25, paid: false },
      { friendId: 'friend-1', amount: 15.25, paid: true },
      { friendId: 'friend-2', amount: 15.25, paid: false },
    ],
  },
  {
    title: 'Movie Tickets',
    description: 'Avengers: Endgame',
    totalAmount: 60.00,
    date: new Date(2023, 10, 5), // November 5, 2023
    paidBy: 'friend-2',
    category: 'Entertainment',
    splits: [
      { friendId: 'current-user', amount: 15.00, paid: false },
      { friendId: 'friend-1', amount: 15.00, paid: false },
      { friendId: 'friend-2', amount: 15.00, paid: true },
      { friendId: 'friend-3', amount: 15.00, paid: false },
    ],
  },
  {
    title: 'Groceries',
    description: 'Weekly groceries for shared apartment',
    totalAmount: 89.32,
    date: new Date(2023, 10, 12), // November 12, 2023
    paidBy: 'current-user',
    category: 'Shopping',
    splits: [
      { friendId: 'current-user', amount: 44.66, paid: true },
      { friendId: 'friend-3', amount: 44.66, paid: false },
    ],
  },
  {
    title: 'Weekend Trip Airbnb',
    description: 'Beach house rental for the weekend',
    totalAmount: 320.00,
    date: new Date(2023, 11, 2), // December 2, 2023
    paidBy: 'friend-3',
    category: 'Travel',
    splits: [
      { friendId: 'current-user', amount: 80.00, paid: false },
      { friendId: 'friend-1', amount: 80.00, paid: false },
      { friendId: 'friend-2', amount: 80.00, paid: false },
      { friendId: 'friend-3', amount: 80.00, paid: true },
    ],
  },
];

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
      expenses: sampleExpenses.map(expense => ({
        ...expense,
        id: `expense-${generateId()}`,
      })),
      
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
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Call recalculateBalances when the store is rehydrated
          state.recalculateBalances();
        }
      },
    }
  )
);
