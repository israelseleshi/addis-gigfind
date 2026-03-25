'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Briefcase, DollarSign, Languages, Link as LinkIcon, BookOpen, Save, Loader2 } from 'lucide-react'

interface FreelancerProfile {
  id: string
  skills: string[] | null
  hourly_rate: number | null
  experience_level: string | null
  languages: string[] | null
  portfolio_url: string | null
  bio: string | null
}

const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Beginner', description: '0-1 years' },
  { value: 'intermediate', label: 'Intermediate', description: '2-3 years' },
  { value: 'advanced', label: 'Advanced', description: '4-5 years' },
  { value: 'expert', label: 'Expert', description: '5+ years' },
]

const COMMON_SKILLS = [
  'Web Development', 'Mobile Development', 'UI/UX Design', 'Graphic Design',
  'Content Writing', 'Data Entry', 'Video Editing', 'Photography',
  'Social Media', 'SEO', 'Accounting', 'Translation', 'Virtual Assistant',
  'Customer Service', 'Sales', 'Marketing', 'Photography', 'Carpentry',
  'Plumbing', 'Electrical', 'Cleaning', 'Moving', 'Delivery'
]

export default function EditProfilePage() {
  const [profile, setProfile] = useState<FreelancerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [skillInput, setSkillInput] = useState('')
  const [languageInput, setLanguageInput] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Please log in first')
        return
      }

      const { data, error } = await supabase
        .from('freelancer_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error)
        toast.error('Failed to load profile')
      } else {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!profile) return

    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Please log in first')
        return
      }

      const { error } = await supabase
        .from('freelancer_profiles')
        .upsert({
          id: user.id,
          skills: profile.skills || [],
          hourly_rate: profile.hourly_rate,
          experience_level: profile.experience_level,
          languages: profile.languages || [],
          portfolio_url: profile.portfolio_url,
          bio: profile.bio,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const addSkill = (skill: string) => {
    if (!profile || !skill.trim()) return
    const trimmedSkill = skill.trim()
    if (profile.skills?.includes(trimmedSkill)) return
    setProfile({
      ...profile,
      skills: [...(profile.skills || []), trimmedSkill],
    })
    setSkillInput('')
  }

  const removeSkill = (skill: string) => {
    if (!profile) return
    setProfile({
      ...profile,
      skills: profile.skills?.filter((s) => s !== skill) || [],
    })
  }

  const addLanguage = (lang: string) => {
    if (!profile || !lang.trim()) return
    const trimmedLang = lang.trim()
    if (profile.languages?.includes(trimmedLang)) return
    setProfile({
      ...profile,
      languages: [...(profile.languages || []), trimmedLang],
    })
    setLanguageInput('')
  }

  const removeLanguage = (lang: string) => {
    if (!profile) return
    setProfile({
      ...profile,
      languages: profile.languages?.filter((l) => l !== lang) || [],
    })
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
          <div className="h-32 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Edit Freelancer Profile</h1>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Bio Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Bio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={profile?.bio || ''}
            onChange={(e) => setProfile({ ...profile!, bio: e.target.value })}
            placeholder="Tell clients about yourself, your experience, and what makes you unique..."
            rows={5}
            className="w-full"
          />
          <p className="text-sm text-gray-500 mt-2">
            A good bio helps clients understand who you are and why they should hire you.
          </p>
        </CardContent>
      </Card>

      {/* Skills Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Skills
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {profile?.skills?.map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="px-3 py-1 cursor-pointer hover:bg-red-100"
                onClick={() => removeSkill(skill)}
              >
                {skill} ×
              </Badge>
            ))}
            {(!profile?.skills || profile.skills.length === 0) && (
              <p className="text-gray-500 text-sm">No skills added yet</p>
            )}
          </div>

          <div className="flex gap-2">
            <Input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addSkill(skillInput)
                }
              }}
              placeholder="Type a skill and press Enter"
              className="flex-1"
            />
            <Button onClick={() => addSkill(skillInput)} variant="outline">
              Add
            </Button>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-2">Quick add:</p>
            <div className="flex flex-wrap gap-2">
              {COMMON_SKILLS.filter(
                (skill) => !profile?.skills?.includes(skill)
              )
                .slice(0, 8)
                .map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="cursor-pointer hover:bg-orange-50"
                    onClick={() => addSkill(skill)}
                  >
                    + {skill}
                  </Badge>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rate & Experience Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Rate & Experience</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Hourly Rate (ETB)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="hourlyRate"
                  type="number"
                  min="0"
                  value={profile?.hourly_rate || ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile!,
                      hourly_rate: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  placeholder="0"
                  className="pl-10"
                />
              </div>
              <p className="text-sm text-gray-500">
                Set your desired hourly rate in Ethiopian Birr
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Experience Level</Label>
              <select
                id="experience"
                value={profile?.experience_level || ''}
                onChange={(e) =>
                  setProfile({ ...profile!, experience_level: e.target.value })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select experience level</option>
                {EXPERIENCE_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label} ({level.description})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Languages Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Languages
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {profile?.languages?.map((lang) => (
              <Badge
                key={lang}
                variant="secondary"
                className="px-3 py-1 cursor-pointer hover:bg-red-100"
                onClick={() => removeLanguage(lang)}
              >
                {lang} ×
              </Badge>
            ))}
            {(!profile?.languages || profile.languages.length === 0) && (
              <p className="text-gray-500 text-sm">No languages added yet</p>
            )}
          </div>

          <div className="flex gap-2">
            <Input
              value={languageInput}
              onChange={(e) => setLanguageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addLanguage(languageInput)
                }
              }}
              placeholder="Type a language and press Enter"
              className="flex-1"
            />
            <Button onClick={() => addLanguage(languageInput)} variant="outline">
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Portfolio / Website
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="url"
            value={profile?.portfolio_url || ''}
            onChange={(e) =>
              setProfile({ ...profile!, portfolio_url: e.target.value })
            }
            placeholder="https://your-portfolio.com"
          />
          <p className="text-sm text-gray-500">
            Add a link to your portfolio, LinkedIn, or personal website
          </p>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
