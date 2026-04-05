"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, AlertTriangle } from "lucide-react";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  gigTitle: string;
  freelancerName: string;
  amount: number;
  platformFee?: number;
  loading?: boolean;
}

export function PaymentModal({
  open,
  onOpenChange,
  onConfirm,
  gigTitle,
  freelancerName,
  amount,
  platformFee = 0,
  loading = false,
}: PaymentModalProps) {
  const total = amount + platformFee;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-600" />
            Confirm Payment
          </DialogTitle>
          <DialogDescription>
            You are about to pay for hiring a freelancer
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Gig:</span>
              <span className="font-medium">{gigTitle}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Freelancer:</span>
              <span className="font-medium">{freelancerName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Gig Amount:</span>
              <span className="font-medium">{amount.toLocaleString()} ETB</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Platform Fee (10%):</span>
              <span className="font-medium">{platformFee.toLocaleString()} ETB</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span className="text-amber-600">{total.toLocaleString()} ETB</span>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-blue-50 p-3 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5" />
            <p className="text-xs text-blue-700">
              Payment will be processed securely via Chapa. You will be redirected to complete the payment.
            </p>
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? "Processing..." : `Pay ${total.toLocaleString()} ETB`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
