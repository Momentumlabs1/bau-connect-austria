-- Enable realtime for offers table so customers get instant notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.offers;

-- Enable realtime for matches table so contractors get instant lead notifications  
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;