# Database Setup for Demo Requests

## Creating the demo_requests Table

To enable the "Book a Demo" functionality, you need to create a `demo_requests` table in your Supabase database.

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** (in the left sidebar)
3. Click **New Query**
4. Copy and paste the contents of `supabase/migrations/create_demo_requests_table.sql`
5. Click **Run** or press `Cmd/Ctrl + Enter`

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
supabase migration new create_demo_requests_table
# Copy the SQL from supabase/migrations/create_demo_requests_table.sql
supabase db push
```

## Table Schema

### demo_requests

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `company_name` | TEXT | Company name from form |
| `contact_name` | TEXT | Contact person's name |
| `email` | TEXT | Contact email address |
| `phone` | TEXT | Contact phone number |
| `industry` | TEXT | Selected industry |
| `status` | TEXT | Request status: 'pending', 'contacted', 'scheduled', 'completed', 'cancelled' |
| `notes` | TEXT | Optional admin notes |
| `created_at` | TIMESTAMPTZ | Timestamp when request was created |
| `updated_at` | TIMESTAMPTZ | Timestamp when request was last updated |

## Security (Row Level Security)

The table has RLS enabled with the following policies:

1. **Anyone can submit demo requests** - Allows anonymous and authenticated users to INSERT
2. **Authenticated users can view demo requests** - Allows authenticated users to SELECT
3. **Authenticated users can update demo requests** - Allows authenticated users to UPDATE

This means:
- ✅ Anyone can fill out the form on your website
- ✅ Only logged-in users can view and manage requests
- ✅ The form works without requiring authentication

## Accessing Demo Requests

You can view and manage demo requests in several ways:

### 1. Supabase Dashboard
Navigate to **Table Editor** > **demo_requests** to view all submissions

### 2. Build an Admin Dashboard (Future)
Create a page in your app to view and manage requests:

```tsx
const { data: requests } = await supabase
  .from('demo_requests')
  .select('*')
  .order('created_at', { ascending: false });
```

### 3. Set up Email Notifications (Optional)
You can use Supabase Edge Functions or webhooks to send email notifications when new demo requests are submitted.

## Testing

After running the migration, test the form:

1. Go to your landing page
2. Click "Book a Demo"
3. Fill out the form
4. Submit
5. Check your Supabase dashboard to verify the entry was created

## Troubleshooting

If you get an error when submitting the form:

1. **Check table exists**: Go to Supabase Dashboard > Table Editor
2. **Verify RLS policies**: Go to Authentication > Policies
3. **Check browser console**: Look for specific error messages
4. **Verify environment variables**: Make sure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set correctly

## Next Steps

After the table is created, you can:
- [ ] Add email notifications when requests are submitted
- [ ] Create an admin dashboard to manage requests
- [ ] Integrate with your calendar for scheduling
- [ ] Add analytics tracking

