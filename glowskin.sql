CREATE TABLE produse (
    id SERIAL PRIMARY KEY,
    nume VARCHAR(100) NOT NULL,
    brand VARCHAR(100),
    categorie VARCHAR(50),
    tip_ten VARCHAR(50),
    pret NUMERIC(10,2) NOT NULL,
    cantitate_ml INT,
    descriere TEXT,
    ingrediente TEXT,
    imagine VARCHAR(200),
    stoc INT DEFAULT 0,
    data_adaugare DATE DEFAULT CURRENT_DATE
);

INSERT INTO produse
(nume, brand, categorie, tip_ten, pret, cantitate_ml, descriere, ingrediente, imagine, stoc)
VALUES
('Ser cu Acid Hialuronic', 'GlowSkin', 'Ser', 'toate tipurile', 79.99, 30,
 'Ser hidratant pentru un ten luminos si catifelat.',
 'acid hialuronic, apa, glicerina', 'ser-acid-hialuronic.jpg', 25),

('Crema hidratanta cu Ceramide', 'GlowSkin', 'Crema', 'uscat', 89.99, 50,
 'Crema hranitoare pentru refacerea barierei pielii.',
 'ceramide, niacinamide, unt de shea', 'crema-ceramide.jpg', 18),

('Gel de curatare delicat', 'GlowSkin', 'Curatare', 'sensibil', 54.99, 150,
 'Gel bland pentru curatarea zilnica a tenului.',
 'aloe vera, pantenol, glicerina', 'gel-curatare.jpg', 30);
