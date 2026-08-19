-- "Couch-Potato-Level" war respektlos formuliert — an den Ton der übrigen
-- Pläne angeglichen (identisch zu F1, dem direkten weiblichen Pendant).

UPDATE public.trainingsplaene
SET zielgruppe = 'Kein oder kaum sportlicher Hintergrund – betritt das Studio zum ersten oder zweiten Mal'
WHERE plan_key = 'M1';
