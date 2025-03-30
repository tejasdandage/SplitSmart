
import { useState } from "react";
import { useExpenseStore } from "@/store/expenseStore";
import AddExpenseForm from "@/components/AddExpenseForm";
import BalanceSummary from "@/components/BalanceSummary";
import ExpenseList from "@/components/ExpenseList";
import FriendsManagement from "@/components/FriendsManagement";
import SettlementSuggestions from "@/components/SettlementSuggestions";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Calculator,
  CreditCard,
  DollarSign,
  LayoutDashboard,
  Receipt,
  Users,
} from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card py-4">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">SplitSmart</h1>
          </div>
          <div className="flex items-center gap-3">
            <AddExpenseForm />
          </div>
        </div>
      </header>
      
      <main className="container py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3 md:grid-cols-5 gap-2">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden md:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="expenses" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              <span className="hidden md:inline">Expenses</span>
            </TabsTrigger>
            <TabsTrigger value="settle" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden md:inline">Settle Up</span>
            </TabsTrigger>
            <TabsTrigger value="friends" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden md:inline">Friends</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            <div className="animate-fade-in">
              <BalanceSummary />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle>Recent Expenses</CardTitle>
                          <CardDescription>Your latest transactions</CardDescription>
                        </div>
                        <Button 
                          variant="ghost" 
                          onClick={() => setActiveTab("expenses")}
                          className="text-primary hover:text-primary"
                        >
                          View All
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ExpenseList />
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <Card className="mb-6">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle>Settlement</CardTitle>
                          <CardDescription>Suggested payments</CardDescription>
                        </div>
                        <Button 
                          variant="ghost" 
                          onClick={() => setActiveTab("settle")}
                          className="text-primary hover:text-primary"
                        >
                          View All
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <SettlementSuggestions />
                    </CardContent>
                  </Card>
                  
                  <FriendsManagement />
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="expenses">
            <div className="animate-fade-in">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-2xl">Expenses</CardTitle>
                      <CardDescription>
                        View and manage all your shared expenses
                      </CardDescription>
                    </div>
                    <AddExpenseForm />
                  </div>
                </CardHeader>
                <CardContent>
                  <ExpenseList />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="settle">
            <div className="animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Settle Up</CardTitle>
                  <CardDescription>
                    Suggested payments to settle debts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BalanceSummary />
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-4">Payment Suggestions</h3>
                    <SettlementSuggestions />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="friends">
            <div className="animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Friends</CardTitle>
                  <CardDescription>
                    Manage friends and view individual balances
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FriendsManagement />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
