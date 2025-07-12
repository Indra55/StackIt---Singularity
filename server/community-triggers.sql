-- Create trigger function to update community post count
CREATE OR REPLACE FUNCTION update_community_post_count()
RETURNS TRIGGER AS $$
BEGIN
  -- If a post is being inserted
  IF TG_OP = 'INSERT' THEN
    -- Update post count for the community
    UPDATE communities 
    SET post_count = post_count + 1, updated_at = NOW()
    WHERE id = NEW.community_id;
    RETURN NEW;
  END IF;
  
  -- If a post is being deleted
  IF TG_OP = 'DELETE' THEN
    -- Update post count for the community
    UPDATE communities 
    SET post_count = post_count - 1, updated_at = NOW()
    WHERE id = OLD.community_id;
    RETURN OLD;
  END IF;
  
  -- If a post is being updated
  IF TG_OP = 'UPDATE' THEN
    -- If community_id changed
    IF OLD.community_id IS DISTINCT FROM NEW.community_id THEN
      -- Decrease count for old community
      IF OLD.community_id IS NOT NULL THEN
        UPDATE communities 
        SET post_count = post_count - 1, updated_at = NOW()
        WHERE id = OLD.community_id;
      END IF;
      
      -- Increase count for new community
      IF NEW.community_id IS NOT NULL THEN
        UPDATE communities 
        SET post_count = post_count + 1, updated_at = NOW()
        WHERE id = NEW.community_id;
      END IF;
    END IF;
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for posts table
DROP TRIGGER IF EXISTS trigger_update_community_post_count ON posts;
CREATE TRIGGER trigger_update_community_post_count
  AFTER INSERT OR UPDATE OR DELETE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_community_post_count();

-- Update existing post counts (fix current data)
UPDATE communities 
SET post_count = (
  SELECT COUNT(*) 
  FROM posts 
  WHERE posts.community_id = communities.id
), updated_at = NOW(); 