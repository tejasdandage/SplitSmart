
export type Friend = {
  id: string;
  name: string;
  avatar?: string;
};

export type ExpenseSplit = {
  friendId: string;
  amount: number;
  paid: boolean;
};

export type Expense = {
  id: string;
  title: string;
  description?: string;
  totalAmount: number;
  date: Date;
  paidBy: string; // friendId of the person who paid
  category: string;
  splits: ExpenseSplit[];
};

export type Balance = {
  friendId: string;
  netAmount: number; // positive means they owe you, negative means you owe them
};

export type SettlementSuggestion = {
  fromFriendId: string;
  toFriendId: string;
  amount: number;
};
