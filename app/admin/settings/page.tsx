'use client';

import { useEffect, useState } from 'react';
import { Settings } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'notifications' | 'email_sms' | 'future'>('notifications');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        alert('Settings saved successfully!');
      } else {
        alert('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateNotificationSetting = (key: keyof Settings['notifications'], value: any) => {
    if (!settings) return;
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: value,
      },
    });
  };

  const updateEmailSMSSetting = (key: keyof Settings['email_sms'], value: any) => {
    if (!settings) return;
    setSettings({
      ...settings,
      email_sms: {
        ...settings.email_sms,
        [key]: value,
      },
    });
  };

  const addAdminEmail = () => {
    if (!settings) return;
    const newEmail = prompt('Enter admin email:');
    if (newEmail && newEmail.trim()) {
      updateEmailSMSSetting('adminEmails', [...settings.email_sms.adminEmails, newEmail.trim()]);
    }
  };

  const removeAdminEmail = (index: number) => {
    if (!settings) return;
    const newEmails = settings.email_sms.adminEmails.filter((_, i) => i !== index);
    updateEmailSMSSetting('adminEmails', newEmails);
  };

  const addAdminPhone = () => {
    if (!settings) return;
    const newPhone = prompt('Enter admin phone number:');
    if (newPhone && newPhone.trim()) {
      updateEmailSMSSetting('adminPhones', [...settings.email_sms.adminPhones, newPhone.trim()]);
    }
  };

  const removeAdminPhone = (index: number) => {
    if (!settings) return;
    const newPhones = settings.email_sms.adminPhones.filter((_, i) => i !== index);
    updateEmailSMSSetting('adminPhones', newPhones);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">Loading settings...</div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">Failed to load settings</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Settings</h1>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'notifications'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('email_sms')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'email_sms'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Email/SMS
          </button>
          <button
            onClick={() => setActiveTab('future')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'future'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Future Features
          </button>
        </nav>
      </div>

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <h2 className="text-2xl font-semibold mb-4">Notification Settings</h2>

          {/* Status Change Notifications */}
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="font-medium text-gray-900">Status Change Notifications</h3>
              <p className="text-sm text-gray-500">
                Send notifications to customers when order status changes
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.statusChangeEnabled}
                onChange={(e) =>
                  updateNotificationSetting('statusChangeEnabled', e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          {/* Reminder Notifications */}
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="font-medium text-gray-900">Reminder Notifications</h3>
              <p className="text-sm text-gray-500">
                Send reminder notifications before pickup time
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.reminderEnabled}
                onChange={(e) =>
                  updateNotificationSetting('reminderEnabled', e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          {/* Reminder Timing */}
          {settings.notifications.reminderEnabled && (
            <div className="border-b pb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reminder Timing
              </label>
              <select
                value={settings.notifications.reminderMinutes}
                onChange={(e) =>
                  updateNotificationSetting('reminderMinutes', parseInt(e.target.value))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="5">5 minutes before pickup</option>
                <option value="10">10 minutes before pickup</option>
                <option value="15">15 minutes before pickup</option>
                <option value="20">20 minutes before pickup</option>
                <option value="25">25 minutes before pickup</option>
                <option value="30">30 minutes before pickup</option>
              </select>
            </div>
          )}

          {/* Reminder Method */}
          {settings.notifications.reminderEnabled && (
            <div className="border-b pb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reminder Method
              </label>
              <select
                value={settings.notifications.reminderMethod}
                onChange={(e) =>
                  updateNotificationSetting('reminderMethod', e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="simple">Simple (check when orders are viewed)</option>
                <option value="polling">Polling (automatic check every few minutes)</option>
                <option value="manual">Manual (admin triggers reminders)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {settings.notifications.reminderMethod === 'simple' &&
                  'Reminders checked when admin views orders'}
                {settings.notifications.reminderMethod === 'polling' &&
                  'Reminders automatically checked every few minutes'}
                {settings.notifications.reminderMethod === 'manual' &&
                  'Reminders sent manually from order detail page'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Email/SMS Tab */}
      {activeTab === 'email_sms' && (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <h2 className="text-2xl font-semibold mb-4">Email/SMS Settings</h2>

          {/* Admin Notification Emails */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Notification Emails
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Email addresses that will receive notifications when orders are placed
            </p>
            <div className="space-y-2">
              {settings.email_sms.adminEmails.map((email, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      const newEmails = [...settings.email_sms.adminEmails];
                      newEmails[index] = e.target.value;
                      updateEmailSMSSetting('adminEmails', newEmails);
                    }}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeAdminEmail(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addAdminEmail}>
                + Add Email
              </Button>
            </div>
          </div>

          {/* Admin Notification Phones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Notification Phone Numbers
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Phone numbers that will receive SMS notifications when orders are placed
            </p>
            <div className="space-y-2">
              {settings.email_sms.adminPhones.map((phone, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      const newPhones = [...settings.email_sms.adminPhones];
                      newPhones[index] = e.target.value;
                      updateEmailSMSSetting('adminPhones', newPhones);
                    }}
                    className="flex-1"
                    placeholder="(555) 123-4567"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeAdminPhone(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addAdminPhone}>
                + Add Phone
              </Button>
            </div>
          </div>

          {/* Customer Preference Timing */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Notification Preference
            </label>
            <p className="text-xs text-gray-500 mb-3">
              When should customers select their notification preference?
            </p>
            <select
              value={settings.email_sms.customerPreferenceTiming}
              onChange={(e) =>
                updateEmailSMSSetting('customerPreferenceTiming', e.target.value)
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="pre-order">Pre-order (during checkout)</option>
              <option value="post-order">Post-order (after order confirmation)</option>
            </select>
          </div>
        </div>
      )}

      {/* Future Features Tab */}
      {activeTab === 'future' && (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <h2 className="text-2xl font-semibold mb-4">Future Features</h2>
          <p className="text-gray-600">
            This section is reserved for future features including:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Website Customization (colors, fonts, layouts)</li>
            <li>Payment Options (payment gateways, methods)</li>
            <li>Marketing Emails (promotions, discounts, campaigns)</li>
          </ul>
          <p className="text-sm text-gray-500 mt-4">
            Coming soon...
          </p>
        </div>
      )}
    </div>
  );
}

