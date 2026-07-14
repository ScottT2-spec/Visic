-- Add Handmade Bags template pages to existing sites
-- This script adds About Us, Our Story, Contact Us, and Reviews pages

DO $$
DECLARE
    site_record RECORD;
    about_page_id TEXT;
    our_story_page_id TEXT;
    contact_page_id TEXT;
    reviews_page_id TEXT;
BEGIN
    -- Loop through all active sites
    FOR site_record IN SELECT id, slug FROM sites WHERE status = 'ACTIVE' LOOP
        -- Check if pages already exist for this site
        SELECT id INTO about_page_id FROM pages WHERE siteId = site_record.id AND slug = 'about' LIMIT 1;
        SELECT id INTO our_story_page_id FROM pages WHERE siteId = site_record.id AND slug = 'our-story' LIMIT 1;
        SELECT id INTO contact_page_id FROM pages WHERE siteId = site_record.id AND slug = 'contact' LIMIT 1;
        SELECT id INTO reviews_page_id FROM pages WHERE siteId = site_record.id AND slug = 'reviews' LIMIT 1;
        
        -- Create About Us page if it doesn't exist
        IF about_page_id IS NULL THEN
            INSERT INTO pages (id, siteId, title, slug, type, content, isPublished, position, "createdAt", "updatedAt")
            VALUES (
                gen_random_uuid()::text,
                site_record.id,
                'About Us',
                'about',
                'CUSTOM',
                '[]'::jsonb,
                true,
                10,
                NOW(),
                NOW()
            );
            RAISE NOTICE 'Created About Us page for site: %', site_record.slug;
        END IF;
        
        -- Create Our Story page if it doesn't exist
        IF our_story_page_id IS NULL THEN
            INSERT INTO pages (id, siteId, title, slug, type, content, isPublished, position, "createdAt", "updatedAt")
            VALUES (
                gen_random_uuid()::text,
                site_record.id,
                'Our Story',
                'our-story',
                'CUSTOM',
                '[]'::jsonb,
                true,
                11,
                NOW(),
                NOW()
            );
            RAISE NOTICE 'Created Our Story page for site: %', site_record.slug;
        END IF;
        
        -- Create Contact Us page if it doesn't exist
        IF contact_page_id IS NULL THEN
            INSERT INTO pages (id, siteId, title, slug, type, content, isPublished, position, "createdAt", "updatedAt")
            VALUES (
                gen_random_uuid()::text,
                site_record.id,
                'Contact Us',
                'contact',
                'CUSTOM',
                '[]'::jsonb,
                true,
                12,
                NOW(),
                NOW()
            );
            RAISE NOTICE 'Created Contact Us page for site: %', site_record.slug;
        END IF;
        
        -- Create Reviews page if it doesn't exist
        IF reviews_page_id IS NULL THEN
            INSERT INTO pages (id, siteId, title, slug, type, content, isPublished, position, "createdAt", "updatedAt")
            VALUES (
                gen_random_uuid()::text,
                site_record.id,
                'Reviews',
                'reviews',
                'CUSTOM',
                '[]'::jsonb,
                true,
                13,
                NOW(),
                NOW()
            );
            RAISE NOTICE 'Created Reviews page for site: %', site_record.slug;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Handmade Bags pages added successfully';
END $$;
