"use client"

import { Badge } from "@/components/ui/badge"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { RiderLayout } from "@/components/layouts/rider-layout"
import { AlertCircle, CreditCard, Download, Plus, Wallet } from "lucide-react"
import { useAppContext } from "@/contexts/app-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

// Mock transaction data
const transactions = [
  {
    id: "tx-001",
    date: "Apr 5, 2025",
    description: "Ride to Downtown",
    amount: -12.5,
    status: "completed",
  },
  {
    id: "tx-002",
    date: "Apr 3, 2025",
    description: "Wallet Top-up",
    amount: 50.0,
    status: "completed",
  },
  {
    id: "tx-003",
    date: "Apr 1, 2025",
    description: "Ride to Airport",
    amount: -18.75,
    status: "completed",
  },
  {
    id: "tx-004",
    date: "Mar 28, 2025",
    description: "Ride to Shopping Mall",
    amount: -9.75,
    status: "completed",
  },
  {
    id: "tx-005",
    date: "Mar 25, 2025",
    description: "Wallet Top-up",
    amount: 25.0,
    status: "completed",
  },
]

// Mock payment methods
const paymentMethods = [
  {
    id: "pm-001",
    type: "card",
    name: "Visa ending in 4242",
    details: "Expires 04/28",
    isDefault: true,
  },
  {
    id: "pm-002",
    type: "card",
    name: "Mastercard ending in 5555",
    details: "Expires 07/26",
    isDefault: false,
  },
]

export default function RiderPaymentsPage() {
  const { user, setUser } = useAppContext()
  const { toast } = useToast()
  const [topupAmount, setTopupAmount] = useState("25")
  const [addingCard, setAddingCard] = useState(false)
  const [newCardData, setNewCardData] = useState({
    number: "",
    name: "",
    expiry: "",
    cvc: "",
  })

  const router = useRouter()

  useEffect(() => {
    if (!user) {
      // Redirect to login if no user is found
      router.push("/auth/login")
    }
  }, [user, router])

  const handleTopup = () => {
    if (user) {
      const amount = Number.parseFloat(topupAmount)
      if (!isNaN(amount) && amount > 0) {
        setUser({
          ...user,
          walletBalance: user.walletBalance + amount,
        })

        toast({
          title: "Wallet topped up",
          description: `$${amount.toFixed(2)} has been added to your wallet.`,
        })
      }
    }
  }

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault()

    toast({
      title: "Card added",
      description: "Your new payment method has been added successfully.",
    })

    setAddingCard(false)
    setNewCardData({
      number: "",
      name: "",
      expiry: "",
      cvc: "",
    })
  }

  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewCardData((prev) => ({ ...prev, [name]: value }))
  }

  if (!user) {
    return (
      <RiderLayout>
        <div className="flex justify-center items-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </RiderLayout>
    )
  }

  return (
    <RiderLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">Manage your payment methods and view transaction history</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Wallet Balance</CardTitle>
              <CardDescription>Your current RideChain wallet balance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${user.walletBalance.toFixed(2)}</div>
              <p className="text-sm text-muted-foreground mt-1">Available for rides and other services</p>

              <Separator className="my-4" />

              <div className="space-y-3">
                <Label htmlFor="topup-amount">Top Up Amount</Label>
                <Select defaultValue={topupAmount} onValueChange={setTopupAmount}>
                  <SelectTrigger id="topup-amount">
                    <SelectValue placeholder="Select amount" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">$10.00</SelectItem>
                    <SelectItem value="25">$25.00</SelectItem>
                    <SelectItem value="50">$50.00</SelectItem>
                    <SelectItem value="100">$100.00</SelectItem>
                  </SelectContent>
                </Select>

                <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={handleTopup}>
                  <Wallet className="mr-2 h-4 w-4" /> Top Up Wallet
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Recent payments and wallet activities</CardDescription>
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
            <TabsTrigger value="invoices">Invoices & Receipts</TabsTrigger>
          </TabsList>

          <TabsContent value="methods">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Your Payment Methods</CardTitle>
                    <CardDescription>Manage your saved payment methods</CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => setAddingCard(!addingCard)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Payment Method
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {addingCard ? (
                  <form onSubmit={handleAddCard} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="card-number">Card Number</Label>
                      <Input
                        id="card-number"
                        name="number"
                        placeholder="1234 5678 9012 3456"
                        value={newCardData.number}
                        onChange={handleCardInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="card-name">Cardholder Name</Label>
                      <Input
                        id="card-name"
                        name="name"
                        placeholder="John Doe"
                        value={newCardData.name}
                        onChange={handleCardInputChange}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="card-expiry">Expiry Date</Label>
                        <Input
                          id="card-expiry"
                          name="expiry"
                          placeholder="MM/YY"
                          value={newCardData.expiry}
                          onChange={handleCardInputChange}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="card-cvc">CVC</Label>
                        <Input
                          id="card-cvc"
                          name="cvc"
                          placeholder="123"
                          value={newCardData.cvc}
                          onChange={handleCardInputChange}
                          required
                        />
                      </div>
                    </div>

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Secure Payment</AlertTitle>
                      <AlertDescription>Your card information is encrypted and secure.</AlertDescription>
                    </Alert>

                    <div className="flex gap-2">
                      <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                        Save Card
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setAddingCard(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    {paymentMethods.map((method) => (
                      <div key={method.id} className="flex justify-between items-center p-4 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-8 w-8 text-indigo-600" />
                          <div>
                            <p className="font-medium">{method.name}</p>
                            <p className="text-sm text-muted-foreground">{method.details}</p>
                          </div>
                          {method.isDefault && <Badge className="ml-2">Default</Badge>}
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
                          You don't have any payment methods yet. Add one to get started.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices">
            <Card>
              <CardHeader>
                <CardTitle>Invoices & Receipts</CardTitle>
                <CardDescription>Download invoices and receipts for your rides</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions
                    .filter((t) => t.amount < 0)
                    .map((transaction) => (
                      <div key={transaction.id} className="flex justify-between items-center p-3 rounded-lg border">
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">{transaction.date}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">${Math.abs(transaction.amount).toFixed(2)}</span>
                          <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" /> Receipt
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RiderLayout>
  )
}

