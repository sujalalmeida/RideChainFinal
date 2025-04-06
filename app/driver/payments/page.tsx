"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { DriverLayout } from "@/components/layouts/driver-layout"
import { AlertCircle, BanknoteIcon as BankIcon, Download, Plus } from "lucide-react"
import { useAppContext } from "@/contexts/app-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

// Add router import
import { useRouter } from "next/navigation"

// Add this right after the existing imports and before the component definition
// const router = useRouter() // Removing this line

// Mock transaction data
const transactions = [
  {
    id: "tx-001",
    date: "Apr 5, 2025",
    description: "Ride to Downtown",
    amount: 10.0,
    status: "completed",
  },
  {
    id: "tx-002",
    date: "Apr 3, 2025",
    description: "Ride to Airport",
    amount: 15.0,
    status: "completed",
  },
  {
    id: "tx-003",
    date: "Apr 1, 2025",
    description: "Payout to Bank Account",
    amount: -50.0,
    status: "completed",
  },
  {
    id: "tx-004",
    date: "Mar 28, 2025",
    description: "Ride to Shopping Mall",
    amount: 7.8,
    status: "completed",
  },
  {
    id: "tx-005",
    date: "Mar 25, 2025",
    description: "Ride to University",
    amount: 12.5,
    status: "completed",
  },
]

// Mock payment methods
const paymentMethods = [
  {
    id: "pm-001",
    type: "bank",
    name: "Chase Bank",
    details: "Checking Account ****6789",
    isDefault: true,
  },
]

export default function DriverPaymentsPage() {
  const { user, setUser } = useAppContext()
  const { toast } = useToast()
  const [withdrawAmount, setWithdrawAmount] = useState("50")
  const [addingBank, setAddingBank] = useState(false)
  const [newBankData, setNewBankData] = useState({
    bankName: "",
    accountNumber: "",
    routingNumber: "",
    accountType: "checking",
  })

  // Add this useEffect hook inside the component, right after the useState declarations
  const router = useRouter() // Moving useRouter here to avoid conditional hook call

  useEffect(() => {
    if (!user) {
      // Redirect to login if no user is found
      router.push("/auth/login")
    }
  }, [user, router])

  const handleWithdraw = () => {
    if (user) {
      const amount = Number.parseFloat(withdrawAmount)
      if (!isNaN(amount) && amount > 0 && amount <= user.walletBalance) {
        setUser({
          ...user,
          walletBalance: user.walletBalance - amount,
        })

        toast({
          title: "Withdrawal initiated",
          description: `$${amount.toFixed(2)} will be transferred to your bank account.`,
        })
      }
    }
  }

  const handleAddBank = (e: React.FormEvent) => {
    e.preventDefault()

    toast({
      title: "Bank account added",
      description: "Your new bank account has been added successfully.",
    })

    setAddingBank(false)
    setNewBankData({
      bankName: "",
      accountNumber: "",
      routingNumber: "",
      accountType: "checking",
    })
  }

  const handleBankInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewBankData((prev) => ({ ...prev, [name]: value }))
  }

  if (!user) {
    return (
      <DriverLayout>
        <div className="flex justify-center items-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </DriverLayout>
    )
  }

  return (
    <DriverLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">Manage your earnings and payment methods</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Available Balance</CardTitle>
              <CardDescription>Your current RideChain earnings balance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${user.walletBalance.toFixed(2)}</div>
              <p className="text-sm text-muted-foreground mt-1">Available for withdrawal</p>

              <Separator className="my-4" />

              <div className="space-y-3">
                <Label htmlFor="withdraw-amount">Withdraw Amount</Label>
                <Select defaultValue={withdrawAmount} onValueChange={setWithdrawAmount}>
                  <SelectTrigger id="withdraw-amount">
                    <SelectValue placeholder="Select amount" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">$25.00</SelectItem>
                    <SelectItem value="50">$50.00</SelectItem>
                    <SelectItem value="100">$100.00</SelectItem>
                    <SelectItem value="all">All Available</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  onClick={handleWithdraw}
                  disabled={user.walletBalance <= 0}
                >
                  <BankIcon className="mr-2 h-4 w-4" /> Withdraw to Bank
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Recent earnings and withdrawals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex justify-between items-center p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">{transaction.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${transaction.amount > 0 ? "text-green-600" : ""}`}>
                        {transaction.amount > 0 ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
                      </span>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button variant="outline">View All Transactions</Button>
            </CardFooter>
          </Card>
        </div>

        <Tabs defaultValue="methods" className="w-full">
          <TabsList>
            <TabsTrigger value="methods">Payment Methods</TabsTrigger>
            <TabsTrigger value="tax">Tax Information</TabsTrigger>
          </TabsList>

          <TabsContent value="methods">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Your Bank Accounts</CardTitle>
                    <CardDescription>Manage your bank accounts for withdrawals</CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => setAddingBank(!addingBank)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Bank Account
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {addingBank ? (
                  <form onSubmit={handleAddBank} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bank-name">Bank Name</Label>
                      <Input
                        id="bank-name"
                        name="bankName"
                        placeholder="Chase, Bank of America, etc."
                        value={newBankData.bankName}
                        onChange={handleBankInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="account-number">Account Number</Label>
                      <Input
                        id="account-number"
                        name="accountNumber"
                        placeholder="Your account number"
                        value={newBankData.accountNumber}
                        onChange={handleBankInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="routing-number">Routing Number</Label>
                      <Input
                        id="routing-number"
                        name="routingNumber"
                        placeholder="Your routing number"
                        value={newBankData.routingNumber}
                        onChange={handleBankInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="account-type">Account Type</Label>
                      <Select
                        defaultValue={newBankData.accountType}
                        onValueChange={(value) => setNewBankData((prev) => ({ ...prev, accountType: value }))}
                      >
                        <SelectTrigger id="account-type">
                          <SelectValue placeholder="Select account type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="checking">Checking</SelectItem>
                          <SelectItem value="savings">Savings</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Secure Banking</AlertTitle>
                      <AlertDescription>Your banking information is encrypted and secure.</AlertDescription>
                    </Alert>

                    <div className="flex gap-2">
                      <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                        Save Bank Account
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setAddingBank(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    {paymentMethods.map((method) => (
                      <div key={method.id} className="flex justify-between items-center p-4 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <BankIcon className="h-8 w-8 text-indigo-600" />
                          <div>
                            <p className="font-medium">{method.name}</p>
                            <p className="text-sm text-muted-foreground">{method.details}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}

                    {paymentMethods.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          You don't have any bank accounts yet. Add one to withdraw your earnings.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tax">
            <Card>
              <CardHeader>
                <CardTitle>Tax Information</CardTitle>
                <CardDescription>Manage your tax documents and information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Tax Documents</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">2024 1099-K Form</p>
                        <p className="text-sm text-muted-foreground">Available January 31, 2025</p>
                      </div>
                      <Button variant="outline" size="sm" disabled>
                        <Download className="mr-2 h-4 w-4" /> Download
                      </Button>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">2024 Annual Tax Summary</p>
                        <p className="text-sm text-muted-foreground">Available January 31, 2025</p>
                      </div>
                      <Button variant="outline" size="sm" disabled>
                        <Download className="mr-2 h-4 w-4" /> Download
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Tax Information</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Tax Identification Number</p>
                        <p className="text-sm text-muted-foreground">Your SSN or EIN</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Update
                      </Button>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">W-9 Form</p>
                        <p className="text-sm text-muted-foreground">Required for tax reporting</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Submit
                      </Button>
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Tax Information</AlertTitle>
                  <AlertDescription>
                    RideChain is required to report your earnings to tax authorities if you earn more than $600 in a
                    calendar year.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DriverLayout>
  )
}

