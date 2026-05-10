ALTER TABLE public.site_settings 
  ADD COLUMN IF NOT EXISTS about_content text NOT NULL DEFAULT 'About Shree JI Home Decor

Established in 2024, Shree JI Home Decor has quickly built a reputation for providing quality home furnishing and lifestyle products at wholesale rates across India. Located in the heart of Khatipura, Jaipur, the business is dedicated to offering stylish, comfortable, and affordable products for every home.

With a strong focus on customer satisfaction and reliable service, Shree JI Home Decor delivers a wide range of premium home décor and textile essentials. The brand proudly serves customers, retailers, and resellers with Pan India delivery, making quality products accessible to households and businesses nationwide.

Our collection includes bedsheets, towels, galicha and doormats, runners, cushions, pillow covers, topsheets, dohars, comforters, yoga mats, kids'' bedsheets and comforters, mattresses, sofa covers, AC blankets, Jaipuri razai, fitted bedsheets, kitchen essentials, aprons, freeze mats, gifting sets, and many more home utility products. We also offer seasonal and specialty items such as umbrellas, raincoats, Garba dresses, and decorative furnishings.

At Shree JI Home Decor, we believe in combining comfort, quality, and affordability while maintaining long-term relationships with our customers and reseller partners. Our mission is to bring elegant and practical home décor solutions to every corner of India with trust, transparency, and excellent service.',
  ADD COLUMN IF NOT EXISTS instagram_url text NOT NULL DEFAULT 'https://www.instagram.com/shreeji_home_decors',
  ADD COLUMN IF NOT EXISTS home_carousel text[] NOT NULL DEFAULT '{}'::text[];

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS pincode text;