# Worker Step 2 Onboarding Update

## Summary
Updated Worker Step 2 onboarding form to match the new design with improved UI/UX and better skill selection.

## Changes Made

### 1. UI Components Updated (`/src/app/setup-profile/SetupProfileClient.tsx`)

#### New Fields:
- **Years of Experience** - Dropdown with ranges (Less than 1 year, 1-3 years, 3-5 years, 5-10 years, 10+ years)
- **Select Your Skills** - Multi-select chip interface with 15 pre-defined skills (minimum 3 required)
  - Electrical wiring, OSHA-10 Certified, Forklift Operation, Welding, HVAC
  - Plumbing, Carpentry, Inventory Management, CDL License, Heavy Machinery
  - Construction Labor, Painting, Roofing, Concrete Work, Equipment Maintenance
- **Desired Hourly Pay** - Number input with `$` prefix and `/hour` suffix
- **Preferred Job Type** - Dropdown (Full-time, Part-time, Contract, Temporary, Flexible)
- **Pro Tip** - Info box about adding detailed work history later

#### Removed Fields:
- Specialties (text input) - Replaced with Skills multi-select
- Service area - Removed
- Credentials - Removed

#### Visual Updates:
- Icon changed from user icon to briefcase icon (matching employer portal)
- Icon background changed to `bg-blue-100` (light blue)
- Title updated to "Your skills and experience"
- Description updated to "Tell us about your skills to get matched with the right jobs."

### 2. Form Validation
- Added client-side validation requiring minimum 3 skills to be selected
- All fields marked as required with red asterisks
- Alert shows if user tries to submit with fewer than 3 skills

### 3. Database Schema Updates

#### New Migration File: `/supabase/migrations/add_worker_step2_fields.sql`

Adds two new columns to `worker_profiles` table:
- `years_experience_range` (text) - Stores experience ranges like "1-3", "5-10", "10+"
- `job_type_preference` (text) - Stores job type preferences (full-time, part-time, etc.)

#### Database Setup Instructions:

1. **Run the migration in Supabase:**
   ```bash
   # Option 1: Using Supabase CLI (if installed)
   supabase migration up

   # Option 2: Manually in Supabase Dashboard
   # Go to: Database → SQL Editor → New query
   # Copy and paste the contents of:
   # supabase/migrations/add_worker_step2_fields.sql
   # Click "Run"
   ```

2. **Verify the columns were added:**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'worker_profiles' 
   AND column_name IN ('years_experience_range', 'job_type_preference');
   ```

### 4. Data Structure

#### Form Submission Data:
```javascript
{
  years_experience: "1-3",           // Selected range
  skills: ["Plumbing", "HVAC", "Electrical wiring"], // Array of skills (min 3)
  hourly_rate: 25,                   // Number (converted to cents for DB)
  job_type: "full-time"              // Selected job type
}
```

#### Database Storage:
```javascript
{
  user_id: "uuid",
  trades: ["Plumbing", "HVAC", "Electrical wiring"],  // Array
  years_experience_range: "1-3",                       // Text
  rate_cents: 2500,                                    // Integer (25.00 * 100)
  job_type_preference: "full-time",                    // Text
  updated_at: "2025-11-14T..."                        // Timestamp
}
```

## Testing Checklist

- [ ] Run the database migration
- [ ] Complete worker onboarding Step 1
- [ ] Navigate to worker Step 2
- [ ] Verify all fields are visible and styled correctly
- [ ] Try submitting with fewer than 3 skills (should show alert)
- [ ] Select at least 3 skills
- [ ] Fill in all required fields
- [ ] Submit the form
- [ ] Verify data is saved in `worker_profiles` table
- [ ] Verify `user_roles.stage` is set to `profile_done`
- [ ] Verify redirect to worker portal
- [ ] Log out and log back in
- [ ] Verify you go directly to worker portal (not back to onboarding)

## Notes

- The old `years_experience` (integer) field still exists in the database but is no longer used by the form
- Skills are stored in the existing `trades` array field
- The form uses a hidden input to submit the skills array as JSON
- Validation happens both client-side (minimum 3 skills) and server-side (required fields)

