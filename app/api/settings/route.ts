import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { Settings } from '@/types';

export async function GET() {
  try {
    const supabase = createServerClient();
    
    // Default settings to return if table doesn't exist or settings not found
    const defaultSettings: Settings = {
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
    };

    try {
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'notifications')
        .single();

      const { data: emailSmsData, error: emailSmsError } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'email_sms')
        .single();

      // If table doesn't exist or settings not found, return defaults
      if (notificationsError || emailSmsError || !notificationsData || !emailSmsData) {
        console.warn('Settings table not found or settings not configured, using defaults');
        return NextResponse.json(defaultSettings);
      }

      const settings: Settings = {
        notifications: notificationsData.value as any,
        email_sms: emailSmsData.value as any,
      };

      return NextResponse.json(settings);
    } catch (dbError: any) {
      // Handle case where settings table doesn't exist
      if (dbError?.code === '42P01' || dbError?.message?.includes('does not exist')) {
        console.warn('Settings table does not exist yet, returning defaults');
        return NextResponse.json(defaultSettings);
      }
      throw dbError;
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
    // Return default settings instead of error to prevent frontend crashes
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
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { notifications, email_sms } = body;

    const supabase = createServerClient();

    // Use upsert (insert or update) for notifications settings
    if (notifications) {
      const { error } = await supabase
        .from('settings')
        .upsert(
          { key: 'notifications', value: notifications },
          { onConflict: 'key' }
        );

      if (error) {
        console.error('Error updating notifications settings:', error);
        // If table doesn't exist, return error with helpful message
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          return NextResponse.json(
            { 
              error: 'Settings table does not exist',
              details: 'Please run the schema-updates.sql file in your Supabase SQL Editor to create the settings table.'
            },
            { status: 500 }
          );
        }
        return NextResponse.json(
          { error: 'Failed to update notifications settings', details: error.message },
          { status: 500 }
        );
      }
    }

    // Use upsert (insert or update) for email/sms settings
    if (email_sms) {
      const { error } = await supabase
        .from('settings')
        .upsert(
          { key: 'email_sms', value: email_sms },
          { onConflict: 'key' }
        );

      if (error) {
        console.error('Error updating email/sms settings:', error);
        // If table doesn't exist, return error with helpful message
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          return NextResponse.json(
            { 
              error: 'Settings table does not exist',
              details: 'Please run the schema-updates.sql file in your Supabase SQL Editor to create the settings table.'
            },
            { status: 500 }
          );
        }
        return NextResponse.json(
          { error: 'Failed to update email/sms settings', details: error.message },
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
      notifications: notificationsData?.value as any || notifications,
      email_sms: emailSmsData?.value as any || email_sms,
    };

    return NextResponse.json(updatedSettings);
  } catch (error: any) {
    console.error('Unexpected error:', error);
    // If table doesn't exist, return helpful error
    if (error?.code === '42P01' || error?.message?.includes('does not exist')) {
      return NextResponse.json(
        { 
          error: 'Settings table does not exist',
          details: 'Please run the schema-updates.sql file in your Supabase SQL Editor to create the settings table.'
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update settings', details: error?.message },
      { status: 500 }
    );
  }
}

