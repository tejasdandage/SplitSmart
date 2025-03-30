
import { Balance, Expense, Friend, SettlementSuggestion } from "@/types";

// Calculate balances for each friend based on expenses
export const calculateBalances = (
  expenses: Expense[],
  currentUserId: string
): Balance[] => {
  const balances: { [friendId: string]: number } = {};

  expenses.forEach((expense) => {
    const paidBy = expense.paidBy;
    const totalAmount = expense.totalAmount;

    // Initialize balance for the person who paid
    if (!balances[paidBy]) {
      balances[paidBy] = 0;
    }

    // Add the full amount to the person who paid (they're owed this money)
    balances[paidBy] += totalAmount;

    // Subtract each person's share from their balance
    expense.splits.forEach((split) => {
      if (!balances[split.friendId]) {
        balances[split.friendId] = 0;
      }
      balances[split.friendId] -= split.amount;
    });
  });

  // Convert to array format
  return Object.entries(balances).map(([friendId, netAmount]) => ({
    friendId,
    netAmount: friendId === currentUserId ? -netAmount : netAmount,
  }));
};

// Generate settlement suggestions to simplify payments
export const generateSettlementSuggestions = (
  balances: Balance[],
  currentUserId: string
): SettlementSuggestion[] => {
  const suggestions: SettlementSuggestion[] = [];
  const debtors: Balance[] = [];
  const creditors: Balance[] = [];

  // Separate into those who owe money and those who are owed
  balances.forEach((balance) => {
    if (balance.netAmount < 0) {
      debtors.push({ ...balance, netAmount: Math.abs(balance.netAmount) });
    } else if (balance.netAmount > 0) {
      creditors.push({ ...balance });
    }
  });

  // Sort by amount (largest first)
  debtors.sort((a, b) => b.netAmount - a.netAmount);
  creditors.sort((a, b) => b.netAmount - a.netAmount);

  // Create settlement suggestions
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    
    const amount = Math.min(debtor.netAmount, creditor.netAmount);
    
    if (amount > 0) {
      suggestions.push({
        fromFriendId: debtor.friendId,
        toFriendId: creditor.friendId,
        amount: Math.round(amount * 100) / 100, // Round to 2 decimal places
      });
    }

    // Update remaining balances
    debtor.netAmount -= amount;
    creditor.netAmount -= amount;

    // Move to next person if their balance is settled
    if (debtor.netAmount < 0.01) debtorIndex++;
    if (creditor.netAmount < 0.01) creditorIndex++;
  }

  return suggestions;
};

// Calculate the total you owe others
export const calculateTotalYouOwe = (balances: Balance[], currentUserId: string): number => {
  return balances
    .filter((balance) => balance.friendId !== currentUserId && balance.netAmount < 0)
    .reduce((total, balance) => total + Math.abs(balance.netAmount), 0);
};

// Calculate the total others owe you
export const calculateTotalOwedToYou = (balances: Balance[], currentUserId: string): number => {
  return balances
    .filter((balance) => balance.friendId !== currentUserId && balance.netAmount > 0)
    .reduce((total, balance) => total + balance.netAmount, 0);
};

// Split an expense evenly
export const splitEvenly = (friends: Friend[], amount: number): { [friendId: string]: number } => {
  const evenSplit = amount / friends.length;
  return friends.reduce((result, friend) => {
    result[friend.id] = evenSplit;
    return result;
  }, {} as { [friendId: string]: number });
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Generate a unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};
