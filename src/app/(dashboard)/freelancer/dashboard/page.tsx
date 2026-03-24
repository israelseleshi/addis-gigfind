"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Briefcase, FileText, CheckCircle, Clock, ArrowRight, Search, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getFreelancerDashboardStats, getRecentApplications, getRecommendedGigs } from '@/lib/actions/dashboard'
import { Skeleton } from '@/components/ui/skeleton'

interface DashboardStats {
  activeApplications: number
  pendingJobs: number
  completedJobs: number
  availableGigs: number
}

interface Application {
  id: string
  gig: string
  status: string
  applied: string
  budget: string
}

interface Gig {
  id: string
  title: string
  budget: string
  posted: string
  skills: string[]
}

interface StatItem {
  title: string
  value: string
  icon: React.ElementType
  color: string
}

interface QuickAction {
  icon: React.ElementType
  label: string
  href: string
  color: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

function StatCard({ title, value, icon: Icon, color, delay }: { title: string; value: string; icon: React.ElementType; color: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2`} />
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${color} shadow-md`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold tracking-tight">{value}</div>
          <p className="text-sm text-muted-foreground mt-1">{title}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function QuickAction({ icon: Icon, label, href, color }: { icon: React.ElementType; label: string; href: string; color: string }) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="group relative overflow-hidden rounded-xl bg-white p-4 shadow-sm border border-zinc-100 hover:shadow-md transition-all"
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity`} />
        <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${color} mb-3 shadow-md`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <p className="font-semibold text-zinc-900">{label}</p>
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 group-hover:text-orange-500 transition-colors">
          Open <ArrowRight className="h-3 w-3" />
        </p>
      </motion.div>
    </Link>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'In Review': 'bg-blue-100 text-blue-700 border-blue-200',
    Accepted: 'bg-green-100 text-green-700 border-green-200',
    Pending: 'bg-amber-100 text-amber-700 border-amber-200',
    Rejected: 'bg-red-100 text-red-700 border-red-200',
  }
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[status] || 'bg-zinc-100 text-zinc-700 border-zinc-200'}`}>
      {status}
    </span>
  )
}

export default function FreelancerDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentApplications, setRecentApplications] = useState<Application[]>([])
  const [recommendedGigs, setRecommendedGigs] = useState<Gig[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          console.error('No user found')
          setLoading(false)
          return
        }
        
        
        const [statsData, applicationsData, gigsData] = await Promise.all([
          getFreelancerDashboardStats(user.id),
          getRecentApplications(user.id),
          getRecommendedGigs()
        ])
        
        setStats(statsData || {
          activeApplications: 0,
          pendingJobs: 0,
          completedJobs: 0,
          availableGigs: 0,
        })
        setRecentApplications(applicationsData)
        setRecommendedGigs(gigsData)
      } catch (error) {
        console.error('Dashboard fetch error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const statsData: StatItem[] = [
    { title: 'Active Applications', value: stats?.activeApplications.toString() || '0', icon: FileText, color: 'from-blue-500 to-blue-600' },
    { title: 'Pending Jobs', value: stats?.pendingJobs.toString() || '0', icon: Clock, color: 'from-amber-500 to-orange-500' },
    { title: 'Completed Jobs', value: stats?.completedJobs.toString() || '0', icon: CheckCircle, color: 'from-green-500 to-green-600' },
    { title: 'Available Gigs', value: stats?.availableGigs.toString() || '0', icon: Briefcase, color: 'from-purple-500 to-purple-600' },
  ]

  const quickActions: QuickAction[] = [
    { icon: Search, label: 'Find Work', href: '/freelancer/find-work', color: 'from-orange-500 to-amber-500' },
    { icon: FileText, label: 'My Applications', href: '/freelancer/my-applications', color: 'from-blue-500 to-cyan-500' },
    { icon: CheckCircle, label: 'Active Jobs', href: '/freelancer/active-jobs', color: 'from-green-500 to-emerald-500' },
    { icon: Zap, label: 'Profile Boost', href: '/freelancer/profile/edit', color: 'from-purple-500 to-pink-500' },
  ]


  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants}>
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-zinc-900">
            Freelancer Dashboard
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Find work and manage your applications.</p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat: StatItem, index: number) => (
          <StatCard key={stat.title} {...stat} delay={index * 0.1} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications - Takes 2 columns */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg sm:text-xl">Your Recent Applications</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Track the status of your job applications</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/freelancer/my-applications">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentApplications.map((app) => (
                  <motion.div
                    key={app.id}
                    whileHover={{ x: 4 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-zinc-50 rounded-xl border border-zinc-100 hover:border-orange-200 hover:bg-orange-50/30 transition-all cursor-pointer gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-zinc-900 text-sm sm:text-base">{app.gig}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">{app.budget}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <div className="flex flex-col items-end gap-1">
                        <StatusBadge status={app.status} />
                        <span className="text-xs text-muted-foreground hidden sm:block">Applied {app.applied}</span>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/freelancer/my-applications/${app.id}`}>View</Link>
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar - Quick Actions & Recommended Gigs */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action) => (
                    <QuickAction key={action.label} {...action} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recommended Gigs */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Recommended Gigs</CardTitle>
                <CardDescription>New opportunities for you</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recommendedGigs.map((gig) => (
                    <motion.div
                      key={gig.id}
                      whileHover={{ x: 4 }}
                      className="p-3 sm:p-4 bg-zinc-50 rounded-xl border border-zinc-100 hover:border-orange-200 hover:bg-orange-50/30 transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-zinc-900 text-sm sm:text-base">{gig.title}</h3>
                        <StatusBadge status="New" />
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2">{gig.budget}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {gig.skills.map((skill: string) => (
                          <span key={skill} className="text-xs bg-zinc-200 text-zinc-600 px-2 py-0.5 rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Posted {gig.posted}</span>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/freelancer/find-work/${gig.id}/apply`}>Apply</Link>
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
