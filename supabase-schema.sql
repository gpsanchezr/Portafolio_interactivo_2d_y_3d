-- ══════════════════════════════════════════════════
-- GISEELLA WORLD — Supabase Database Setup
-- Ejecutar en: Dashboard → SQL Editor → Run ▶
-- ══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS contact_messages (
  id         BIGSERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  subject    TEXT,
  message    TEXT NOT NULL,
  is_read    BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_insert" ON contact_messages
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "admin_read" ON contact_messages
  FOR SELECT TO service_role USING (true);

CREATE TABLE IF NOT EXISTS project_views (
  id         BIGSERIAL PRIMARY KEY,
  project_id TEXT NOT NULL,
  viewed_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE project_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_insert_views" ON project_views
  FOR INSERT TO anon WITH CHECK (true);

CREATE TABLE IF NOT EXISTS testimonials (
  id           BIGSERIAL PRIMARY KEY,
  author_name  TEXT NOT NULL,
  author_role  TEXT,
  content      TEXT NOT NULL,
  stars        INT DEFAULT 5 CHECK (stars BETWEEN 1 AND 5),
  is_visible   BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read" ON testimonials
  FOR SELECT TO anon USING (is_visible = true);
CREATE POLICY "admin_all" ON testimonials
  FOR ALL TO service_role USING (true);

-- Seed testimonials
INSERT INTO testimonials (author_name, author_role, content, stars) VALUES
  ('Ana Martínez','PM · TechCorp','Capacidad única para combinar elegancia visual con código limpio. Su portfolio 3D es extraordinario.',5),
  ('Carlos Rodríguez','CTO · StartupCO','Entregó antes del plazo con Barramquilladad que superó todas las expectativas.',5),
  ('María González','CEO · AgroDigital','Diseñó nuestro e-commerce en tiempo récord con resultado profesional y optimizado.',5)
ON CONFLICT DO NOTHING;

-- Útil: analytics
CREATE OR REPLACE VIEW project_stats AS
  SELECT project_id, COUNT(*) views FROM project_views GROUP BY project_id ORDER BY views DESC;
