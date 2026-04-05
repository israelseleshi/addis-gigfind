"use client";

import { useWalletStore, Transaction } from "@/stores/wallet-store";
import { ArrowUpCircle, ArrowDownCircle, Gift, Coins, DollarSign } from "lucide-react";

function getTransactionIcon(type: Transaction["type"]) {
  switch (type) {
    case "bonus":
      return <Gift className="w-4 h-4 text-purple-500" />;
    case "purchase":
      return <Coins className="w-4 h-4 text-green-500" />;
    case "spent":
      return <ArrowDownCircle className="w-4 h-4 text-red-500" />;
    case "earned":
      return <DollarSign className="w-4 h-4 text-blue-500" />;
    case "refund":
      return <ArrowUpCircle className="w-4 h-4 text-orange-500" />;
    default:
      return <Coins className="w-4 h-4 text-gray-500" />;
  }
}

function getTransactionColor(type: Transaction["type"]) {
  switch (type) {
    case "bonus":
      return "text-purple-600";
    case "purchase":
      return "text-green-600";
    case "spent":
      return "text-red-600";
    case "earned":
      return "text-blue-600";
    case "refund":
      return "text-orange-600";
    default:
      return "text-gray-600";
  }
}

function formatAmount(type: Transaction["type"], amount: number) {
  if (type === "spent") {
    return `-${amount}`;
  }
  return `+${amount}`;
}

export function TransactionList() {
  const { transactions } = useWalletStore();

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No transactions yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-full">
              {getTransactionIcon(transaction.type)}
            </div>
            <div>
              <p className="font-medium text-gray-800">{transaction.description}</p>
              <p className="text-xs text-gray-500">{transaction.date}</p>
            </div>
          </div>
          <span className={`font-semibold ${getTransactionColor(transaction.type)}`}>
            {transaction.type === "spent" ? "-" : "+"}{Math.abs(transaction.amount)}
            {transaction.type === "earned" ? " ETB" : " coins"}
          </span>
        </div>
      ))}
    </div>
  );
}
