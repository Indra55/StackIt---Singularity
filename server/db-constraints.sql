-- Add constraint to prevent tags longer than 50 characters
-- This will be enforced at the database level as a backup to application validation

-- First, let's clean up any existing invalid tags
UPDATE posts 
SET tags = array_remove(tags, tag)
FROM unnest(tags) AS tag
WHERE array_length(tags, 1) > 0 
  AND (tag = '' OR length(tag) > 50);

-- Add a check constraint to prevent future invalid tags
ALTER TABLE posts 
ADD CONSTRAINT posts_tags_check 
CHECK (
  tags IS NULL OR 
  (array_length(tags, 1) IS NULL) OR 
  (array_length(tags, 1) <= 10 AND 
   NOT EXISTS (
     SELECT 1 FROM unnest(tags) AS tag 
     WHERE tag = '' OR length(tag) > 50
   ))
);

-- Add an index for better tag query performance
CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING GIN (tags);

-- Add a function to validate tags
CREATE OR REPLACE FUNCTION validate_tags(tag_array TEXT[])
RETURNS TEXT[] AS $$
DECLARE
  valid_tags TEXT[];
  tag TEXT;
BEGIN
  IF tag_array IS NULL OR array_length(tag_array, 1) IS NULL THEN
    RETURN '{}';
  END IF;
  
  valid_tags := '{}';
  
  FOREACH tag IN ARRAY tag_array
  LOOP
    -- Only add tags that are not empty and not too long
    IF tag != '' AND length(tag) <= 50 THEN
      valid_tags := array_append(valid_tags, lower(trim(tag)));
    END IF;
  END LOOP;
  
  -- Remove duplicates and limit to 10 tags
  SELECT array_agg(DISTINCT t) INTO valid_tags
  FROM unnest(valid_tags) AS t
  LIMIT 10;
  
  RETURN COALESCE(valid_tags, '{}');
END;
$$ LANGUAGE plpgsql; 