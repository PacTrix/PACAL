---
story_id: 2-ux4-form-edit-align-et-kcal-rule
status: review
---

# Story 2.ux4 — Alignement formulaire édition + règle kcal + header

## Description
Aligner EntryEditForm sur le nouveau layout EntryForm (UX2), corriger deux bugs fonctionnels et ajuster le header.

## Acceptance Criteria
- AC1 : EntryEditForm a le même layout compact que EntryForm (date+↺+contexte, barcode inline scores, note 1→3 lignes, 4 boutons photos)
- AC2 : Header — fond blanc, PACAL en orange (suppression du bandeau orange)
- AC3 : Scan barcode → description toujours mise à jour avec le nom OFF (même si déjà remplie)
- AC4 : Règle kcal — changement barcode : recalcul depuis OFF (ou vidé si produit inconnu) ; changement quantité/unité avec OFF dispo : recalcul ; sans OFF : valeur conservée

## Tasks
- [x] T1 : Nav.tsx — fond blanc, texte PACAL en orange
- [x] T2 : EntryEditForm.tsx — refacto layout identique à EntryForm
- [x] T3 : EntryForm.tsx + EntryEditForm.tsx — triggerLookup reset kcalManual=false
- [x] T4 : EntryForm.tsx + EntryEditForm.tsx — lookup effect : setDescription(d.name) sans condition !description
- [x] T5 : EntryForm.tsx + EntryEditForm.tsx — qty/unit onChange : if (offData) setKcalManual(false)

## Dev Agent Record
Règle kcal challengée : "mettre à zéro si pas OFF" refusée pour qty/unit (trop destructif). Règle retenue : barcode change → reset kcalManual (vide si produit inconnu) ; qty/unit change → reset seulement si offData présent.
