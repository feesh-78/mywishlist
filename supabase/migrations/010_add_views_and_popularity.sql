-- ============================================
-- VIEWS TABLE - Track product views
-- ============================================
CREATE TABLE IF NOT EXISTS views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES wishlist_items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Allow anonymous views (user_id can be null)
  -- But track unique views per day per user/item combo
  CONSTRAINT unique_user_item_view_per_day UNIQUE (user_id, item_id, (created_at::date))
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS views_item_id_idx ON views(item_id);
CREATE INDEX IF NOT EXISTS views_user_id_idx ON views(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS views_created_at_idx ON views(created_at);

-- ============================================
-- MATERIALIZED VIEW - Item Popularity Stats
-- ============================================
-- Cette vue calcule les stats de popularité pour chaque item
CREATE MATERIALIZED VIEW IF NOT EXISTS item_popularity_stats AS
SELECT
  wi.id as item_id,
  wi.wishlist_id,
  wi.created_at as item_created_at,

  -- Compter les likes
  COUNT(DISTINCT l.id) as likes_count,

  -- Compter les bookmarks
  COUNT(DISTINCT b.id) as bookmarks_count,

  -- Compter les vues
  COUNT(DISTINCT v.id) as views_count,

  -- Calculer le score de popularité
  -- Score = (Likes × 3) + (Bookmarks × 5) + (Vues × 0.1) + Bonus Récence
  (
    COALESCE(COUNT(DISTINCT l.id), 0) * 3 +
    COALESCE(COUNT(DISTINCT b.id), 0) * 5 +
    COALESCE(COUNT(DISTINCT v.id), 0) * 0.1 +
    -- Bonus récence: items récents ont un boost (max 10 points, décroît sur 30 jours)
    GREATEST(0, 10 - (EXTRACT(EPOCH FROM (NOW() - wi.created_at)) / 86400 / 30 * 10))
  ) as popularity_score,

  NOW() as last_updated

FROM wishlist_items wi
LEFT JOIN likes l ON l.entity_id = wi.id AND l.entity_type = 'item'
LEFT JOIN bookmarks b ON b.item_id = wi.id
LEFT JOIN views v ON v.item_id = wi.id

GROUP BY wi.id, wi.wishlist_id, wi.created_at;

-- Index sur la vue matérialisée
CREATE UNIQUE INDEX IF NOT EXISTS item_popularity_stats_item_id_idx
  ON item_popularity_stats(item_id);
CREATE INDEX IF NOT EXISTS item_popularity_stats_score_idx
  ON item_popularity_stats(popularity_score DESC);
CREATE INDEX IF NOT EXISTS item_popularity_stats_wishlist_id_idx
  ON item_popularity_stats(wishlist_id);

-- ============================================
-- FUNCTION - Refresh popularity stats
-- ============================================
-- Fonction pour rafraîchir les stats (à appeler périodiquement)
CREATE OR REPLACE FUNCTION refresh_item_popularity_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY item_popularity_stats;
END;
$$;

-- ============================================
-- RLS POLICIES - Views table
-- ============================================
ALTER TABLE views ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut lire les vues (pour afficher les compteurs)
CREATE POLICY "Views are publicly readable"
  ON views FOR SELECT
  USING (true);

-- Les utilisateurs connectés peuvent créer des vues
CREATE POLICY "Authenticated users can create views"
  ON views FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Les utilisateurs peuvent voir et supprimer leurs propres vues
CREATE POLICY "Users can manage their own views"
  ON views FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- TRIGGER - Auto-refresh stats on changes
-- ============================================
-- Trigger pour rafraîchir les stats automatiquement (optionnel, peut être lourd)
-- Commenté par défaut, on rafraîchira manuellement ou via cron job
/*
CREATE OR REPLACE FUNCTION notify_stats_refresh()
RETURNS TRIGGER AS $$
BEGIN
  -- Notifier qu'il faut rafraîchir les stats
  PERFORM pg_notify('refresh_stats', NEW.item_id::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER views_notify_refresh
  AFTER INSERT ON views
  FOR EACH ROW
  EXECUTE FUNCTION notify_stats_refresh();

CREATE TRIGGER likes_notify_refresh
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW
  WHEN (NEW.entity_type = 'item' OR OLD.entity_type = 'item')
  EXECUTE FUNCTION notify_stats_refresh();

CREATE TRIGGER bookmarks_notify_refresh
  AFTER INSERT OR DELETE ON bookmarks
  FOR EACH ROW
  WHEN (NEW.item_id IS NOT NULL OR OLD.item_id IS NOT NULL)
  EXECUTE FUNCTION notify_stats_refresh();
*/

-- ============================================
-- INITIAL DATA POPULATION
-- ============================================
-- Rafraîchir une première fois pour calculer les stats existantes
SELECT refresh_item_popularity_stats();

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE views IS 'Tracks product views by users (max 1 per day per user/item)';
COMMENT ON MATERIALIZED VIEW item_popularity_stats IS 'Precomputed popularity statistics for items';
COMMENT ON FUNCTION refresh_item_popularity_stats() IS 'Refreshes the materialized view of item popularity stats';
