import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { Settings } from '@/types';

export async function GET() {
  try {
    const supabase = createServerClient();
    
    const { data: notificationsData } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'notifications')
      .single();

    const { data: emailSmsData } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'email_sms')
      .single();

    if (!notificationsData || !emailSmsData) {
      // Return default settings if not found
      return NextResponse.json({
        notifications: {
          statusChangeEnabled: true,
          reminderEnabled: true,
          reminderMinutes: 15,
          reminderMethod: 'simple',
        },
        email_sms: {
          adminEmails: [],
          adminPhones: [],
          customerPreferenceTiming: 'pre-order',
        },
      });
    }

    const settings: Settings = {
      notifications: notificationsData.value as any,
      email_sms: emailSmsData.value as any,
    };

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { notifications, email_sms } = body;

    const supabase = createServerClient();

    // Update notifications settings
    if (notifications) {
      const { error } = await supabase
        .from('settings')
        .update({ value: notifications })
        .eq('key', 'notifications');

      if (error) {
        console.error('Error updating notifications settings:', error);
        return NextResponse.json(
          { error: 'Failed to update notifications settings' },
          { status: 500 }
        );
      }
    }

    // Update email/sms settings
    if (email_sms) {
      const { error } = await supabase
        .from('settings')
        .update({ value: email_sms })
        .eq('key', 'email_sms');

      if (error) {
        console.error('Error updating email/sms settings:', error);
        return NextResponse.json(
          { error: 'Failed to update email/sms settings' },
          { status: 500 }
        );
      }
    }

    // Fetch and return updated settings
    const { data: notificationsData } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'notifications')
      .single();

    const { data: emailSmsData } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'email_sms')
      .single();

    const updatedSettings: Settings = {
      notifications: notificationsData?.value as any,
      email_sms: emailSmsData?.value as any,
    };

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

