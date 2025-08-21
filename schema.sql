CREATE TABLE IF NOT EXISTS recipes (
id SERIAL PRIMARY KEY,
cuisine VARCHAR(255),
title VARCHAR(512) NOT NULL,
rating REAL,
prep_time INT,
cook_time INT,
total_time INT,
description TEXT,
nutrients JSONB,
serves VARCHAR(128)
);


-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_recipes_rating_desc ON recipes (rating DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_recipes_cuisine ON recipes (cuisine);
CREATE INDEX IF NOT EXISTS idx_recipes_title ON recipes USING GIN (to_tsvector('simple', title));
CREATE INDEX IF NOT EXISTS idx_recipes_nutrients ON recipes USING GIN (nutrients);