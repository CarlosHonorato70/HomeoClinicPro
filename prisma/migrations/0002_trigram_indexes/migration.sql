-- Enable pg_trgm extension for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Trigram indexes for repertory search (188K rubrics)
CREATE INDEX idx_rubric_symptom_pt_trgm ON "Rubric" USING gin ("symptomPt" gin_trgm_ops);
CREATE INDEX idx_rubric_symptom_en_trgm ON "Rubric" USING gin ("symptomEn" gin_trgm_ops);
