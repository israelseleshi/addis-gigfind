'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'

import { forgotPasswordSchema } from '@/lib/validations/auth'
import { recoverPassword } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export function ForgotPasswordForm() {
  const [isPending, startTransition] = React.useTransition()

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
    startTransition(async () => {
      try {
        const result = await recoverPassword(values)
        if (result?.error) {
          toast.error(result.error)
        } else {
          toast.success('Password reset link sent. Please check your email.')
          form.reset()
        }
      } catch {
        toast.error('Something went wrong. Please try again.')
      }
    })
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Forgot Password</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send you a link to reset your password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your email address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
