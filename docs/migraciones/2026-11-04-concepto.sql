-- Concepto de cada gasto (04/11/2026, propuesta del profesor en la exposición).
-- Ejecutar UNA vez en Supabase > SQL Editor ANTES de unir el PR que lo usa:
-- sin esta columna, Mis gastos, Revisar y Exportar dan error.
-- docs/modelo-datos.sql ya la incluye para una instalación nueva.

alter table public.facturas
  add column if not exists concepto text check (char_length(concepto) <= 200);

comment on column public.facturas.concepto is 'Qué se compró o qué servicio es, en pocas palabras. Lo propone la IA y lo corrige la persona.';

-- La persona puede corregirlo, igual que el resto de datos de la factura.
grant update (concepto) on public.facturas to authenticated;
