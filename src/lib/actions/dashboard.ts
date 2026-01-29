'use server'

import { createClient } from '@/lib/supabase/server'

export async function getFreelancerDashboardStats(userId: string) {
  const supabase = await createClient()

  try {
    // Get active applications count
    const { count: activeApplications, error: activeError } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('freelancer_id', userId)
      .in('status', ['pending', 'accepted'])

    // Get pending jobs count (accepted applications)
    const { count: pendingJobs, error: pendingError } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('freelancer_id', userId)
      .eq('status', 'accepted')

    // Get completed jobs count
    const { count: completedJobs, error: completedError } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('freelancer_id', userId)
      .eq('status', 'completed')

    // Get available gigs count
    const { count: availableGigs, error: gigsError } = await supabase
      .from('gigs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open')

    if (activeError || pendingError || completedError || gigsError) {
      console.error('Dashboard stats error:', { activeError, pendingError, completedError, gigsError })
      return null
    }

    return {
      activeApplications: activeApplications || 0,
      pendingJobs: pendingJobs || 0,
      completedJobs: completedJobs || 0,
      availableGigs: availableGigs || 0,
    }
  } catch (error) {
    console.error('Dashboard stats fetch error:', error)
    return null
  }
}

export async function getRecentApplications(userId: string, limit: number = 4) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        id,
        status,
        created_at,
        bid_amount,
        gigs!inner (
          title,
          budget,
          location
        )
      `)
      .eq('freelancer_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Recent applications error:', error)
      return []
    }

    type Gig = { title: string; budget: number };

    return data.map(app => {
      const gig = Array.isArray(app.gigs) ? app.gigs[0] as Gig : app.gigs as Gig;
      return {
        id: app.id,
        gig: gig?.title || 'Unknown Gig',
        status: app.status === 'pending' ? 'In Review' : 
                app.status === 'accepted' ? 'Accepted' : 
                app.status === 'rejected' ? 'Rejected' : 'Pending',
        applied: formatTimeAgo(app.created_at),
        budget: gig?.budget ? `ETB ${gig.budget.toLocaleString()}` : 'ETB 0',
      }
    })
  } catch (error) {
    console.error('Recent applications fetch error:', error)
    return []
  }
}

export async function getRecommendedGigs(limit: number = 4) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('gigs')
      .select(`
        id,
        title,
        budget,
        location,
        category,
        created_at,
        profiles!gigs_client_id_fkey (
          full_name
        )
      `)
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Recommended gigs error:', error)
      return []
    }

    return data.map(gig => ({
      id: gig.id,
      title: gig.title,
      budget: `ETB ${gig.budget.toLocaleString()}`,
      posted: formatTimeAgo(gig.created_at),
      skills: [gig.category], // Using category as skills for now
    }))
  } catch (error) {
    console.error('Recommended gigs fetch error:', error)
    return []
  }
}

export async function getClientDashboardStats(userId: string) {
  const supabase = await createClient()

  try {
    // Get active gigs count
    const { count: activeGigs, error: activeError } = await supabase
      .from('gigs')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', userId)
      .in('status', ['open', 'assigned', 'in_progress'])

    // Get total hires count (accepted applications)
    const { data: gigsData } = await supabase
      .from('gigs')
      .select('id')
      .eq('client_id', userId)
    
    const gigIds = gigsData?.map(g => g.id) || []
    
    const { count: totalHires, error: hiresError } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .in('gig_id', gigIds)
      .eq('status', 'accepted')

    // Get pending applications count
    const { count: pendingApplications, error: pendingError } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .in('gig_id', gigIds)
      .eq('status', 'pending')

    // Get completed jobs count
    const { count: completedJobs, error: completedError } = await supabase
      .from('gigs')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', userId)
      .eq('status', 'completed')

    if (activeError || hiresError || pendingError || completedError) {
      console.error('Client dashboard stats error:', { activeError, hiresError, pendingError, completedError })
      return null
    }

    return {
      activeGigs: activeGigs || 0,
      totalHires: totalHires || 0,
      pendingApplications: pendingApplications || 0,
      completedJobs: completedJobs || 0,
    }
  } catch (error) {
    console.error('Client dashboard stats fetch error:', error)
    return null
  }
}

export async function getRecentGigs(userId: string, limit: number = 4) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('gigs')
      .select(`
        id,
        title,
        status,
        budget,
        created_at,
        applications (
          id
        )
      `)
      .eq('client_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Recent gigs error:', error)
      return []
    }

    return data.map(gig => ({
      id: gig.id,
      title: gig.title,
      status: gig.status === 'open' ? 'Active' : 
              gig.status === 'assigned' ? 'Active' : 
              gig.status === 'in_progress' ? 'Active' : 
              gig.status === 'completed' ? 'Completed' : 'Draft',
      budget: `ETB ${gig.budget.toLocaleString()}`,
      applicants: gig.applications?.length || 0,
      created_at: gig.created_at,
    }))
  } catch (error) {
    console.error('Recent gigs fetch error:', error)
    return []
  }
}

export async function getRecentActivity(userId: string, limit: number = 5) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        id,
        content,
        created_at,
        type
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Recent activity error:', error)
      return []
    }

    return data.map(activity => ({
      id: activity.id,
      text: activity.content,
      time: formatTimeAgo(activity.created_at),
      type: activity.type,
    }))
  } catch (error) {
    console.error('Recent activity fetch error:', error)
    return []
  }
}

function formatTimeAgo(dateString: string | null): string {
  if (!dateString) return 'Unknown'
  
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) {
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`
  } else if (diffHours > 0) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`
  } else {
    return 'Just now'
  }
}
