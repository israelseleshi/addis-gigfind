import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="container flex h-16 items-center justify-between">
        <p className="text-sm text-zinc-500">
          &copy; {new Date().getFullYear()} Addis GigFind. All rights reserved.
        </p>
        <div className="flex items-center gap-4 text-sm text-zinc-500">
          <Link href="/terms" className="hover:underline">
            Terms of Service
          </Link>
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  )
}
