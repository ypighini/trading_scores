-- Table: public.assets_scores

-- DROP TABLE IF EXISTS public.assets_scores;

CREATE TABLE IF NOT EXISTS public.assets_scores
(
    id integer NOT NULL DEFAULT nextval('assets_scores_id_seq'::regclass),
    asset_type character varying(10) COLLATE pg_catalog."default" NOT NULL,
    code character varying(20) COLLATE pg_catalog."default" NOT NULL,
    name character varying(100) COLLATE pg_catalog."default",
    invest_score integer,
    swing_score integer,
    intraday_score integer,
    last_updated timestamp without time zone DEFAULT now(),
    statut text COLLATE pg_catalog."default",
    created_at timestamp without time zone DEFAULT now(),
    site_name text COLLATE pg_catalog."default",
    site_url text COLLATE pg_catalog."default",
    CONSTRAINT assets_scores_pkey PRIMARY KEY (id),
    CONSTRAINT assets_code_name_site_name_unique UNIQUE (code, name, site_name)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.assets_scores
    OWNER to postgres;
-- Index: idx_assets_site_name

-- DROP INDEX IF EXISTS public.idx_assets_site_name;

CREATE INDEX IF NOT EXISTS idx_assets_site_name
    ON public.assets_scores USING btree
    (site_name COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;