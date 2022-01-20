create or replace function auth.twitterid() returns text as $$
SELECT current_setting('request.jwt.claims', true)::json#>>'{user_metadata,sub}';
$$ language sql;

-- Create a table for "tips"
create table tips (
  id uuid not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  deleted_at timestamp with time zone,
  tweet_id text not null,
  nonce text not null,
  amount text not null,
  tweet_owner_id text not null,
  claimed boolean not null default false,
  signature text not null
  add constraint pk_tips primary key (id)
);

create policy "Anyone can post a tip."
  on tips for insert
  with check ( true );

create policy "Only the owner can update a tip."
  on tips for update 
  with check ( auth.twitterid() = tweet_owner_id);

create policy "Only tweet owners can get their tips"
  on tips
  for select
  using ( auth.twitterid() = tweet_owner_id );