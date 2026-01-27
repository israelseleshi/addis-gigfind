"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FileText, Users, TrendingUp, Shield, Activity, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

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

function StatCard({ title, value, icon: Icon, color, delay, trend }: { title: string; value: string; icon: React.ElementType; color: string; delay: number; trend: string }) {
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
          <span className="text-xs font-medium text-muted-foreground bg-zinc-100 px-2 py-1 rounded-full">{trend}</span>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold tracking-tight">{value}</div>
          <p className="text-sm text-muted-foreground mt-1">{title}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function RecentActivityItem({ icon: Icon, color, title, description, time }: { icon: React.ElementType; color: string; title: string; description: string; time: string }) {
  return (
    <motion.div
      whileHover={{ x: 4 }}
      className="flex items-start gap-4 p-4 bg-zinc-50 rounded-xl border border-zinc-100 hover:border-orange-200 hover:bg-orange-50/30 transition-all cursor-pointer"
    >
      <div className={`p-2 rounded-lg bg-gradient-to-br ${color} shadow-md`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-zinc-900">{title}</p>
        <p className="text-sm text-muted-foreground truncate">{description}</p>
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">{time}</span>
    </motion.div>
  )
}

export default function AdminAuditLogsPage() {
  const stats = [
    { title: 'Total Users', value: '1,247', icon: Users, color: 'from-blue-500 to-blue-600', trend: '+12%' },
    { title: 'Active Gigs', value: '89', icon: TrendingUp, color: 'from-green-500 to-green-600', trend: '+8%' },
    { title: 'Pending Reports', value: '3', icon: Shield, color: 'from-amber-500 to-orange-500', trend: '-5%' },
    { title: 'System Health', value: '99.9%', icon: Activity, color: 'from-purple-500 to-purple-600', trend: 'Stable' },
  ]

  const recentActivities = [
    { icon: Users, color: 'from-blue-500 to-cyan-500', title: 'New user registered', description: 'Abebe Kebede joined as Freelancer', time: '2 min ago' },
    { icon: TrendingUp, color: 'from-green-500 to-emerald-500', title: 'Gig completed', description: 'Logo Design project marked complete', time: '15 min ago' },
    { icon: Shield, color: 'from-amber-500 to-orange-500', title: 'Report resolved', description: 'Dispute #452 resolved by admin', time: '1 hour ago' },
    { icon: FileText, color: 'from-purple-500 to-pink-500', title: 'Gig posted', description: 'Web Developer needed for E-commerce', time: '2 hours ago' },
    { icon: Users, color: 'from-blue-500 to-cyan-500', title: 'Verification approved', description: 'Fatuma Mohammed verified freelancer', time: '3 hours ago' },
  ]

  const quickActions = [
    { label: 'Manage Users', icon: Users, color: 'from-blue-500 to-cyan-500' },
    { label: 'View Reports', icon: Shield, color: 'from-amber-500 to-orange-500' },
    { label: 'System Logs', icon: Activity, color: 'from-purple-500 to-pink-500' },
    { label: 'Analytics', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
  ]

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-zinc-50/50 p-6 space-y-6"
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants}>
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Monitor platform activity and manage users.</p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCard key={stat.title} {...stat} delay={index * 0.1} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Audit Logs - Takes 2 columns */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="h-5 w-5 text-orange-500" />
                  Audit Logs
                </CardTitle>
                <CardDescription>Track all admin actions and system events</CardDescription>
              </div>
              <button className="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1">
                Export <ArrowRight className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <RecentActivityItem key={index} {...activity} />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar - Quick Actions & Summary */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
                <CardDescription>Common admin tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action) => (
                    <motion.div
                      key={action.label}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="group relative overflow-hidden rounded-xl bg-zinc-50 p-4 border border-zinc-100 hover:border-orange-200 hover:bg-orange-50/30 transition-all cursor-pointer"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                      <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${action.color} mb-2 shadow-md`}>
                        <action.icon className="h-4 w-4 text-white" />
                      </div>
                      <p className="text-sm font-medium text-zinc-900">{action.label}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Platform Summary */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Platform Summary</CardTitle>
                <CardDescription>Today&apos;s overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
                    <span className="text-sm text-muted-foreground">New Users Today</span>
                    <span className="font-semibold text-zinc-900">12</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Active Gigs</span>
                    <span className="font-semibold text-zinc-900">89</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Completed Today</span>
                    <span className="font-semibold text-zinc-900">7</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Pending Reviews</span>
                    <span className="font-semibold text-amber-500">3</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
