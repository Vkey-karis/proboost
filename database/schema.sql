-- Create a table for public profiles linked to auth.users
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  credits int default 50,
  tier text default 'free',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Function to handle new user signup
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, credits)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 50);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call handle_new_user on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to safely decrease credits
create or replace function decrease_credits(amount int)
returns boolean
language plpgsql
security definer
as $$
declare
  current_credits int;
begin
  -- Get current credits
  select credits into current_credits from profiles where id = auth.uid();
  
  -- Check if user has enough credits
  if current_credits >= amount then
    -- Deduct credits
    update profiles set credits = credits - amount where id = auth.uid();
    return true;
  else
    return false;
  end if;
end;
$$;
