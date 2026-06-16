import React, { useState } from 'react'
import { Bell, Lock, Eye, Globe, Zap, HelpCircle, LogOut, ChevronRight } from 'lucide-react'
import './Student.css'

export default function Settings() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    quizReminders: true,
    assignmentReminders: true,
    peerMessages: true,
    darkMode: true,
    twoFactor: false,
    sessionTimeout: '30',
    dataCollection: true,
    language: 'en',
    timeZone: 'UTC+5:30'
  })

  const [savedMessage, setSavedMessage] = useState('')

  const handleToggle = (key) => {
    setSettings({
      ...settings,
      [key]: !settings[key]
    })
  }

  const handleSelectChange = (key, value) => {
    setSettings({
      ...settings,
      [key]: value
    })
  }

  const handleSave = () => {
  setSavedMessage('Settings saved successfully!')

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })

  setTimeout(() => setSavedMessage(''), 3000)
}

  const SettingRow = ({ icon: Icon, label, description, children }) => (
    <div className="flex items-center justify-between py-4 px-4 rounded-2xl hover:bg-slate-800/50 transition-colors">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-cyan-400">
          <Icon size={18} />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-slate-100">{label}</p>
          <p className="text-xs text-slate-400">{description}</p>
        </div>
      </div>
      {children}
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-sm text-slate-400 max-w-2xl">Manage your account preferences, notifications, privacy, and security settings.</p>
      </div>

      {savedMessage && (
        <div className="rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-4 py-3 text-sm flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          {savedMessage}
        </div>
      )}

      <div className="grid gap-6">
        {/* Notifications Section */}
        <div className="rounded-3xl bg-slate-950/70 border border-slate-900 p-6 shadow-xl shadow-slate-950/15">
          <div className="flex items-center gap-2 mb-6">
            <Bell size={20} className="text-cyan-400" />
            <h3 className="text-lg font-bold text-white">Notifications</h3>
          </div>

          <div className="space-y-2">
            <SettingRow
              icon={Bell}
              label="Email Notifications"
              description="Receive updates via email"
            >
              <button
                onClick={() => handleToggle('emailNotifications')}
                className={`w-12 h-7 rounded-full transition-colors ${
                  settings.emailNotifications ? 'bg-cyan-500' : 'bg-slate-700'
                } flex items-center px-1`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.emailNotifications ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </SettingRow>

            <SettingRow
              icon={Bell}
              label="Push Notifications"
              description="Browser notifications for urgent alerts"
            >
              <button
                onClick={() => handleToggle('pushNotifications')}
                className={`w-12 h-7 rounded-full transition-colors ${
                  settings.pushNotifications ? 'bg-cyan-500' : 'bg-slate-700'
                } flex items-center px-1`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.pushNotifications ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </SettingRow>

            <SettingRow
              icon={Zap}
              label="Quiz Reminders"
              description="Remind me about upcoming quizzes"
            >
              <button
                onClick={() => handleToggle('quizReminders')}
                className={`w-12 h-7 rounded-full transition-colors ${
                  settings.quizReminders ? 'bg-cyan-500' : 'bg-slate-700'
                } flex items-center px-1`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.quizReminders ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </SettingRow>

            <SettingRow
              icon={Zap}
              label="Assignment Reminders"
              description="Notify me about assignment deadlines"
            >
              <button
                onClick={() => handleToggle('assignmentReminders')}
                className={`w-12 h-7 rounded-full transition-colors ${
                  settings.assignmentReminders ? 'bg-cyan-500' : 'bg-slate-700'
                } flex items-center px-1`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.assignmentReminders ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </SettingRow>

            <SettingRow
              icon={Bell}
              label="Peer Messages"
              description="Notify me of new peer learning messages"
            >
              <button
                onClick={() => handleToggle('peerMessages')}
                className={`w-12 h-7 rounded-full transition-colors ${
                  settings.peerMessages ? 'bg-cyan-500' : 'bg-slate-700'
                } flex items-center px-1`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.peerMessages ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </SettingRow>
          </div>
        </div>

        {/* Privacy & Security Section */}
        <div className="rounded-3xl bg-slate-950/70 border border-slate-900 p-6 shadow-xl shadow-slate-950/15">
          <div className="flex items-center gap-2 mb-6">
            <Lock size={20} className="text-cyan-400" />
            <h3 className="text-lg font-bold text-white">Privacy & Security</h3>
          </div>

          <div className="space-y-2">
            <SettingRow
              icon={Lock}
              label="Two-Factor Authentication"
              description="Add an extra layer of security to your account"
            >
              <button
                onClick={() => handleToggle('twoFactor')}
                className={`w-12 h-7 rounded-full transition-colors ${
                  settings.twoFactor ? 'bg-cyan-500' : 'bg-slate-700'
                } flex items-center px-1`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.twoFactor ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </SettingRow>

            <SettingRow
              icon={Eye}
              label="Session Timeout"
              description="Automatically log out after inactivity"
            >
              <select
                value={settings.sessionTimeout}
                onChange={(e) => handleSelectChange('sessionTimeout', e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
                <option value="never">Never</option>
              </select>
            </SettingRow>

            <SettingRow
              icon={Globe}
              label="Data Collection"
              description="Allow us to use your learning data for analytics"
            >
              <button
                onClick={() => handleToggle('dataCollection')}
                className={`w-12 h-7 rounded-full transition-colors ${
                  settings.dataCollection ? 'bg-cyan-500' : 'bg-slate-700'
                } flex items-center px-1`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.dataCollection ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </SettingRow>

            <button className="w-full text-left">
              <SettingRow
                icon={Lock}
                label="Change Password"
                description="Update your account password"
              >
                <ChevronRight size={18} className="text-slate-500" />
              </SettingRow>
            </button>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="rounded-3xl bg-slate-950/70 border border-slate-900 p-6 shadow-xl shadow-slate-950/15">
          <div className="flex items-center gap-2 mb-6">
            <Globe size={20} className="text-cyan-400" />
            <h3 className="text-lg font-bold text-white">Preferences</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-4 px-4 rounded-2xl hover:bg-slate-800/50 transition-colors">
              <div className="flex-1">
                <p className="font-semibold text-slate-100">Language</p>
                <p className="text-xs text-slate-400">Choose your preferred language</p>
              </div>
              <select
                value={settings.language}
                onChange={(e) => handleSelectChange('language', e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="si">Sinhala</option>
              </select>
            </div>

            <div className="flex items-center justify-between py-4 px-4 rounded-2xl hover:bg-slate-800/50 transition-colors">
              <div className="flex-1">
                <p className="font-semibold text-slate-100">Time Zone</p>
                <p className="text-xs text-slate-400">Set your local time zone</p>
              </div>
              <select
                value={settings.timeZone}
                onChange={(e) => handleSelectChange('timeZone', e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500"
              >
                <option value="UTC+5:30">UTC+5:30 (Asia/Colombo)</option>
                <option value="UTC+0">UTC (GMT)</option>
                <option value="UTC+1">UTC+1 (Europe)</option>
                <option value="UTC-5">UTC-5 (EST)</option>
                <option value="UTC+8">UTC+8 (Asia/Singapore)</option>
              </select>
            </div>

            <button className="w-full text-left">
              <SettingRow
                icon={Eye}
                label="Dark Mode"
                description={settings.darkMode ? 'Currently enabled' : 'Currently disabled'}
              >
                <button
                  onClick={() => handleToggle('darkMode')}
                  className={`w-12 h-7 rounded-full transition-colors ${
                    settings.darkMode ? 'bg-cyan-500' : 'bg-slate-700'
                  } flex items-center px-1`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      settings.darkMode ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </SettingRow>
            </button>
          </div>
        </div>

        {/* Support Section */}
        <div className="rounded-3xl bg-slate-950/70 border border-slate-900 p-6 shadow-xl shadow-slate-950/15">
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle size={20} className="text-cyan-400" />
            <h3 className="text-lg font-bold text-white">Support & Help</h3>
          </div>

          <div className="space-y-2">
            <button className="w-full text-left">
              <SettingRow
                icon={HelpCircle}
                label="Help Center"
                description="Browse FAQ and guides"
              >
                <ChevronRight size={18} className="text-slate-500" />
              </SettingRow>
            </button>

            <button className="w-full text-left">
              <SettingRow
                icon={HelpCircle}
                label="Contact Support"
                description="Get help from our support team"
              >
                <ChevronRight size={18} className="text-slate-500" />
              </SettingRow>
            </button>

            <button className="w-full text-left">
              <SettingRow
                icon={Globe}
                label="Privacy Policy"
                description="Review our privacy practices"
              >
                <ChevronRight size={18} className="text-slate-500" />
              </SettingRow>
            </button>

            <button className="w-full text-left">
              <SettingRow
                icon={Globe}
                label="Terms of Service"
                description="Review our terms and conditions"
              >
                <ChevronRight size={18} className="text-slate-500" />
              </SettingRow>
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-3xl bg-rose-950/30 border border-rose-900/50 p-6 shadow-xl shadow-rose-950/10">
          <h3 className="text-lg font-bold text-rose-300 mb-6">Danger Zone</h3>

          <div className="space-y-2">
            <button className="w-full text-left">
              <SettingRow
                icon={LogOut}
                label="Logout All Devices"
                description="Sign out from all active sessions"
              >
                <ChevronRight size={18} className="text-rose-500" />
              </SettingRow>
            </button>

            <button className="w-full text-left">
              <SettingRow
                icon={LogOut}
                label="Delete Account"
                description="Permanently delete your account and data"
              >
                <ChevronRight size={18} className="text-rose-500" />
              </SettingRow>
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={handleSave}
            className="flex-1 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-bold text-white hover:opacity-95 transition-opacity"
          >
            Save Settings
          </button>
          <button className="flex-1 rounded-2xl border border-slate-700 bg-slate-900/50 px-6 py-3 text-sm font-bold text-slate-200 hover:bg-slate-800/50 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
