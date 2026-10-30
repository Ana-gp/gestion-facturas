-- =====================================================================
-- Ticketon · Modelo de datos · SQL para Supabase
-- Issue #29 (orden 07) e #18 · Bloque 2 · Responsable: Mireia
--
-- Cómo usarlo: copiar el archivo entero en Supabase > SQL Editor y
-- pulsar Run UNA sola vez, en un proyecto vacío (no se puede repetir:
-- crea tablas y políticas que ya existirían). Guía: docs/supabase.md.
-- Explicación de cada tabla y decisión en docs/modelo-datos.md.
--
-- Probado en un PostgreSQL 16 local de pruebas, con imitaciones de
-- auth.users, auth.uid(), storage.buckets y storage.objects (apartado 7
-- de docs/modelo-datos.md). [Pendiente] Comprobarlo en Supabase (#18).
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. Catálogos (los escribe el equipo; el usuario solo los lee)
-- ---------------------------------------------------------------------

create table public.planes (
  id                     text primary key,                 -- 'gratis', 'autonomo', 'autonomo_plus'
  nombre                 text not null,
  precio_mes_eur         numeric(6,2) not null check (precio_mes_eur >= 0),
  limite_documentos_mes  integer not null check (limite_documentos_mes > 0)
);

-- Hipótesis de docs/modelo-negocio.md (#3), pendientes de validar.
insert into public.planes (id, nombre, precio_mes_eur, limite_documentos_mes) values
  ('gratis',        'Gratis',        0.00,  10),
  ('autonomo',      'Autónomo',      4.99, 100),
  ('autonomo_plus', 'Autónomo Plus', 8.99, 300);

create table public.categorias (
  id      smallint generated always as identity primary key,
  nombre  text not null unique,
  orden   smallint not null
);

-- Categorías provisionales de docs/prueba-ia.md (#6).
insert into public.categorias (nombre, orden) values
  ('Combustible y transporte', 1), ('Alimentación', 2), ('Restauración y dietas', 3),
  ('Software y suscripciones', 4), ('Telefonía e internet', 5), ('Material de oficina', 6),
  ('Suministros', 7), ('Alojamiento y viajes', 8), ('Formación', 9), ('Otros', 10);


-- ---------------------------------------------------------------------
-- 2. Cuenta del usuario
-- ---------------------------------------------------------------------

-- Datos de la cuenta que no guarda Supabase Auth. Uno a uno con auth.users.
-- "on delete restrict": no se borra en cascada hasta decidir la política
-- de baja y conservación (docs/legal.md, apartado 4). [Pendiente]
create table public.perfiles (
  id             uuid primary key references auth.users (id) on delete restrict,
  nombre         text,
  nif            text,                                       -- NIF del autónomo, opcional
  codigo_correo  text not null unique
                 default substr(replace(gen_random_uuid()::text, '-', ''), 1, 12),
  creado_en      timestamptz not null default now()
);

-- Plan de cada usuario. Tabla aparte para que el usuario NO pueda cambiarse
-- el plan él mismo (solo la lee). Una sola suscripción activa (hasta = null).
create table public.suscripciones (
  id       uuid primary key default gen_random_uuid(),
  user_id  uuid not null references auth.users (id) on delete restrict,
  plan_id  text not null references public.planes (id),
  desde    date not null default current_date,
  hasta    date,
  check (hasta is null or hasta >= desde)
);
create unique index suscripciones_una_activa on public.suscripciones (user_id) where hasta is null;

-- Contador del límite del plan (#31). Solo sube. Mes natural, hora de Madrid.
create table public.uso_mensual (
  user_id                uuid not null references auth.users (id) on delete restrict,
  mes                    date not null check (extract(day from mes) = 1),   -- 2026-10-01 = octubre
  documentos_procesados  integer not null default 0 check (documentos_procesados >= 0),
  primary key (user_id, mes)
);

-- Correos desde los que el usuario puede reenviar facturas (#16).
create table public.remitentes_autorizados (
  id       uuid primary key default gen_random_uuid(),
  user_id  uuid not null references auth.users (id) on delete cascade,
  email    text not null check (email = lower(email) and position('@' in email) > 1),
  unique (user_id, email)
);


-- ---------------------------------------------------------------------
-- 3. Documentos, facturas y líneas de IVA
-- ---------------------------------------------------------------------

-- El archivo original (#18). Se crea al subir, antes de leerlo con la IA,
-- para que el original quede guardado aunque la lectura falle.
create table public.documentos (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users (id) on delete restrict,
  ruta_storage       text not null unique,   -- dentro del bucket 'originales': '<user_id>/<id>.jpg'
  nombre_archivo     text,
  tipo_mime          text not null,
  tamano_bytes       bigint not null check (tamano_bytes > 0),
  huella_sha256      text not null check (huella_sha256 ~ '^[0-9a-f]{64}$'),
  origen             text not null check (origen in ('foto', 'arrastrar', 'correo', 'compartir')),
  correo_message_id  text,                   -- solo si llegó por correo (#16)
  estado_lectura     text not null default 'pendiente'
                     check (estado_lectura in ('pendiente', 'leido', 'error')),
  contado_en         timestamptz,            -- cuándo sumó al contador del plan (null = aún no)
  subido_en          timestamptz not null default now(),
  -- La primera carpeta de la ruta tiene que ser el propio usuario.
  check (split_part(ruta_storage, '/', 1) = user_id::text),
  unique (id, user_id)
);
create index documentos_huella on public.documentos (user_id, huella_sha256);

-- Los datos leídos por la IA y corregidos por el usuario. Uno a uno con documentos.
-- Importes en la moneda original; *_eur en euros.
create table public.facturas (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users (id) on delete restrict,
  documento_id          uuid not null unique,
  tipo_documento        text not null default 'ticket' check (tipo_documento in ('factura', 'ticket')),
  fecha                 date,
  emisor_nombre         text,
  emisor_nif            text,                -- admite NIF español o VAT extranjero
  receptor_nif          text,                -- opcional: los tickets no lo llevan
  numero                text,                -- texto: '1 / 388087', '9BF0758D-8771996'
  base_total            numeric(12,2),
  cuota_total           numeric(12,2),
  retencion_tipo        numeric(5,2) check (retencion_tipo between 0 and 100),
  retencion_importe     numeric(12,2) check (retencion_importe >= 0),
  total                 numeric(12,2),
  moneda                text not null default 'EUR' check (moneda ~ '^[A-Z]{3}$'),
  -- Unidades de moneda extranjera por 1 euro. La fuente aplicable al IVA debe confirmarse conforme a la norma.
  -- total_eur = round(total / tipo_cambio, 2). Lo comprueba un CHECK.
  tipo_cambio           numeric(14,6) check (tipo_cambio > 0),
  tipo_cambio_fecha     date,
  tipo_cambio_fuente    text check (tipo_cambio_fuente in ('BDE', 'manual')),
  total_eur             numeric(12,2),
  categoria_id          smallint references public.categorias (id),
  estado_revision       text not null default 'pendiente' check (estado_revision in ('pendiente', 'revisada')),
  -- {"fecha": {"confianza": "alta", "corregido": false}, "numero": {...}}
  campos_revision       jsonb not null default '{}'::jsonb check (jsonb_typeof(campos_revision) = 'object'),
  datos_ia              jsonb,               -- respuesta original de la IA, sin tocar
  posible_duplicado_de  uuid,                -- otra factura DEL MISMO usuario (FK compuesta abajo)
  duplicado_descartado  boolean not null default false,
  creado_en             timestamptz not null default now(),
  actualizado_en        timestamptz not null default now(),

  -- Versiones "limpias" para comparar duplicados (sin espacios, guiones ni barras).
  emisor_nif_norm       text generated always as
                        (nullif(upper(regexp_replace(emisor_nif, '[^0-9A-Za-z]', '', 'g')), '')) stored,
  numero_norm           text generated always as
                        (nullif(upper(regexp_replace(numero, '[^0-9A-Za-z]', '', 'g')), '')) stored,

  -- El documento tiene que ser del mismo usuario.
  foreign key (documento_id, user_id) references public.documentos (id, user_id) on delete cascade,
  unique (id, user_id),
  -- El posible duplicado tiene que ser del mismo usuario (no basta con la API).
  -- Si se borra la otra factura, solo se vacía este campo, no user_id.
  -- "set null (columna)" requiere PostgreSQL 15 o superior.
  foreign key (posible_duplicado_de, user_id) references public.facturas (id, user_id)
    on delete set null (posible_duplicado_de),
  check (posible_duplicado_de is null or posible_duplicado_de <> id),
  -- Si es EUR no hay tipo de cambio y el total en euros es el mismo.
  check (moneda <> 'EUR' or (tipo_cambio is null and total_eur is not distinct from total)),
  -- Si es otra moneda, total_eur solo puede ser exactamente total / tipo_cambio
  -- redondeado a 2 decimales. Sin tipo de cambio (conversión pendiente),
  -- total_eur tiene que quedar vacío.
  check (moneda = 'EUR' or total_eur is not distinct from round(total / tipo_cambio, 2)),
  -- Si es otra moneda y hay tipo, se guardan su fecha y su fuente.
  check (tipo_cambio is null or (tipo_cambio_fecha is not null and tipo_cambio_fuente is not null)),
  -- Para marcarla como revisada tiene que tener lo mínimo. En otra moneda,
  -- total_eur no vacío implica que hay tipo de cambio (por el CHECK anterior).
  check (estado_revision = 'pendiente' or (
         fecha is not null and emisor_nombre is not null and total is not null
         and total_eur is not null and categoria_id is not null))
);
create index facturas_periodo on public.facturas (user_id, fecha);
create index facturas_dup_nif on public.facturas (user_id, emisor_nif_norm, numero_norm, total);

-- Una fila por cada tipo de IVA de la factura.
create table public.lineas_iva (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null,
  factura_id  uuid not null,
  orden       smallint not null default 1,
  tipo_iva    numeric(5,2) not null check (tipo_iva between 0 and 100),
  base        numeric(12,2),             -- en la moneda de la factura
  cuota       numeric(12,2),             -- en la moneda de la factura
  -- Sin columnas en euros: se calculan en la vista con el tipo de la factura,
  -- así nunca pueden descuadrar con él.
  origen      text not null default 'impreso' check (origen in ('impreso', 'calculado')),
  -- La factura tiene que ser del mismo usuario; si se borra, se borran sus líneas.
  foreign key (factura_id, user_id) references public.facturas (id, user_id) on delete cascade,
  -- Dos líneas de la misma factura no pueden tener el mismo orden.
  unique (factura_id, orden)
);
create index lineas_iva_factura on public.lineas_iva (factura_id);


-- ---------------------------------------------------------------------
-- 4. Seguridad por filas (RLS) y permisos
-- ---------------------------------------------------------------------
-- Supabase da por defecto todos los permisos de las tablas nuevas de
-- "public" a los roles anon y authenticated. Se quitan y se dan solo los
-- necesarios. Luego RLS decide QUÉ FILAS ve cada usuario.
-- El servidor (rutas de API con la clave secreta) se salta RLS.

revoke all on public.planes, public.categorias, public.perfiles, public.suscripciones,
              public.uso_mensual, public.remitentes_autorizados, public.documentos,
              public.facturas, public.lineas_iva
  from anon, authenticated;

alter table public.planes                 enable row level security;
alter table public.categorias             enable row level security;
alter table public.perfiles               enable row level security;
alter table public.suscripciones          enable row level security;
alter table public.uso_mensual            enable row level security;
alter table public.remitentes_autorizados enable row level security;
alter table public.documentos             enable row level security;
alter table public.facturas               enable row level security;
alter table public.lineas_iva             enable row level security;

-- Catálogos: lectura para todos (la página de precios no exige login).
grant select on public.planes to anon, authenticated;
grant select on public.categorias to authenticated;
create policy "planes: todos leen"     on public.planes     for select to anon, authenticated using (true);
create policy "categorias: todos leen" on public.categorias for select to authenticated using (true);

-- Perfil: leer el propio y cambiar solo nombre y NIF.
grant select on public.perfiles to authenticated;
grant update (nombre, nif) on public.perfiles to authenticated;
create policy "perfiles: leer el mío"   on public.perfiles for select to authenticated
  using ((select auth.uid()) = id);
create policy "perfiles: cambiar el mío" on public.perfiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Plan y contador: solo lectura del propio. Los escribe el servidor.
grant select on public.suscripciones, public.uso_mensual to authenticated;
create policy "suscripciones: leer la mía" on public.suscripciones for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "uso: leer el mío" on public.uso_mensual for select to authenticated
  using ((select auth.uid()) = user_id);

-- Remitentes autorizados: el usuario gestiona los suyos.
grant select, insert, delete on public.remitentes_autorizados to authenticated;
create policy "remitentes: leer"   on public.remitentes_autorizados for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "remitentes: añadir" on public.remitentes_autorizados for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "remitentes: borrar" on public.remitentes_autorizados for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Documentos: el usuario registra la subida, los ve y los borra.
-- No puede cambiar estado_lectura ni contado_en (solo el servidor).
grant select, delete on public.documentos to authenticated;
grant insert (user_id, ruta_storage, nombre_archivo, tipo_mime, tamano_bytes, huella_sha256, origen)
  on public.documentos to authenticated;
create policy "documentos: leer"   on public.documentos for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "documentos: subir"  on public.documentos for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "documentos: borrar" on public.documentos for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Facturas: las crea el servidor tras la lectura. El usuario las ve, corrige
-- los datos (no datos_ia, que guarda lo que dijo la IA) y las borra.
grant select, delete on public.facturas to authenticated;
grant update (tipo_documento, fecha, emisor_nombre, emisor_nif, receptor_nif, numero,
              base_total, cuota_total, retencion_tipo, retencion_importe, total, moneda,
              tipo_cambio, tipo_cambio_fecha, tipo_cambio_fuente, total_eur, categoria_id,
              estado_revision, campos_revision, duplicado_descartado, actualizado_en)
  on public.facturas to authenticated;
create policy "facturas: leer"     on public.facturas for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "facturas: corregir" on public.facturas for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "facturas: borrar"   on public.facturas for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Líneas de IVA: al corregir se pueden añadir, cambiar o quitar líneas.
grant select, insert, update, delete on public.lineas_iva to authenticated;
create policy "lineas: leer"     on public.lineas_iva for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "lineas: añadir"   on public.lineas_iva for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "lineas: corregir" on public.lineas_iva for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "lineas: borrar"   on public.lineas_iva for delete to authenticated
  using ((select auth.uid()) = user_id);


-- ---------------------------------------------------------------------
-- 5. Archivos originales en Storage (bucket privado 'originales')
-- ---------------------------------------------------------------------
-- Cada usuario solo sube, ve y borra dentro de su carpeta '<user_id>/'.
-- No hay política de UPDATE: un original no se sobrescribe (integridad).

-- Límites del bucket (#18, acordados en el PR #65): 10 MB por archivo y
-- solo PDF, JPG, PNG y HEIC. Así lo controla también el servidor, no
-- solo la pantalla. Al subir hay que indicar el tipo (contentType):
-- si no, Supabase lo trata como texto y lo rechaza.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('originales', 'originales', false, 10485760,
        array['application/pdf', 'image/jpeg', 'image/png', 'image/heic', 'image/heif']);

create policy "originales: subir a mi carpeta" on storage.objects for insert to authenticated
  with check (bucket_id = 'originales' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "originales: ver los míos" on storage.objects for select to authenticated
  using (bucket_id = 'originales' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "originales: borrar los míos" on storage.objects for delete to authenticated
  using (bucket_id = 'originales' and (storage.foldername(name))[1] = (select auth.uid())::text);


-- ---------------------------------------------------------------------
-- 6. Funciones
-- ---------------------------------------------------------------------

-- Al registrarse: crear su perfil y darle el plan Gratis.
create function public.al_crear_usuario() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.perfiles (id) values (new.id);
  insert into public.suscripciones (user_id, plan_id) values (new.id, 'gratis');
  return new;
end $$;

create trigger crear_perfil_y_plan after insert on auth.users
  for each row execute function public.al_crear_usuario();
-- Nadie la puede llamar directamente (aviso del Security Advisor de Supabase):
-- solo la ejecuta el trigger al crear un usuario, igual que reservar_lectura.
revoke execute on function public.al_crear_usuario() from public, anon, authenticated;

-- Antes de leer un documento con la IA (#31): ¿le queda cupo este mes?
-- Si sí, suma 1 y lo marca como contado. Volver a leer el mismo no suma.
-- Devuelve false si ha llegado al límite. Solo la llama el servidor.
create function public.reservar_lectura(p_documento_id uuid) returns boolean
language plpgsql security definer set search_path = '' as $$
declare
  v_user    uuid;
  v_contado timestamptz;
  v_limite  integer;
  v_usados  integer;
  v_mes     date := date_trunc('month', now() at time zone 'Europe/Madrid')::date;
begin
  select user_id, contado_en into v_user, v_contado
    from public.documentos where id = p_documento_id for update;
  if v_user is null then
    raise exception 'El documento % no existe', p_documento_id;
  end if;
  if v_contado is not null then
    return true;                       -- ya contado: releer no suma
  end if;

  select p.limite_documentos_mes into v_limite
    from public.suscripciones s join public.planes p on p.id = s.plan_id
   where s.user_id = v_user and s.hasta is null;
  if v_limite is null then
    return false;                      -- sin plan activo
  end if;

  insert into public.uso_mensual (user_id, mes) values (v_user, v_mes) on conflict do nothing;
  select documentos_procesados into v_usados
    from public.uso_mensual where user_id = v_user and mes = v_mes for update;
  if v_usados >= v_limite then
    return false;
  end if;

  update public.uso_mensual set documentos_procesados = documentos_procesados + 1
   where user_id = v_user and mes = v_mes;
  update public.documentos set contado_en = now() where id = p_documento_id;
  return true;
end $$;

revoke execute on function public.reservar_lectura(uuid) from public, anon, authenticated;
grant execute on function public.reservar_lectura(uuid) to service_role;

-- Posibles duplicados de una factura (#22). Respeta RLS: solo busca
-- entre las facturas del propio usuario. Es un aviso, nunca bloquea.
create function public.buscar_duplicados(p_factura_id uuid)
returns table (factura_id uuid, motivo text)
language sql stable security invoker set search_path = '' as $$
  with f as (
    select fa.*, d.huella_sha256
      from public.facturas fa join public.documentos d on d.id = fa.documento_id
     where fa.id = p_factura_id
  )
  -- 1) Mismo archivo
  select o.id, 'mismo archivo'
    from public.facturas o join public.documentos d on d.id = o.documento_id, f
   where o.user_id = f.user_id and o.id <> f.id and d.huella_sha256 = f.huella_sha256
  union
  -- 2) Mismo NIF del emisor, número y total
  select o.id, 'mismo NIF del emisor, número y total'
    from public.facturas o, f
   where o.user_id = f.user_id and o.id <> f.id
     and f.emisor_nif_norm is not null and f.numero_norm is not null
     and o.emisor_nif_norm = f.emisor_nif_norm and o.numero_norm = f.numero_norm
     and o.total = f.total
  union
  -- 3) Sin NIF o sin número: mismo emisor, fecha y total
  select o.id, 'mismo emisor, fecha y total'
    from public.facturas o, f
   where o.user_id = f.user_id and o.id <> f.id
     and (f.emisor_nif_norm is null or f.numero_norm is null)
     and lower(trim(o.emisor_nombre)) = lower(trim(f.emisor_nombre))
     and o.fecha = f.fecha and o.total = f.total
$$;


-- ---------------------------------------------------------------------
-- 7. Vista para la exportación a Excel (#23)
-- ---------------------------------------------------------------------
-- Una fila por línea de IVA. "security_invoker" hace que se apliquen las
-- reglas RLS de quien la consulta (requiere PostgreSQL 15 o superior).
-- El total y la retención solo aparecen en la primera línea de cada factura
-- (row_number = 1), para no sumarlos dos veces.
-- Los importes en euros se calculan con el tipo de cambio de la factura.
-- AVISO: es un PUNTO DE PARTIDA, no la exportación final. ruta_storage NO es
-- un enlace que pueda abrir la gestoría. [Pendiente] bloqueante para cerrar
-- #23: cómo se entrega el original y las columnas definitivas.

create view public.exportacion_gestoria with (security_invoker = true) as
select
  f.id                                   as factura_id,
  f.fecha,
  f.tipo_documento,
  f.emisor_nombre,
  f.emisor_nif,
  f.receptor_nif,
  (f.receptor_nif is null)               as aviso_sin_nif_receptor,
  f.numero,
  c.nombre                               as categoria,
  f.moneda,
  f.tipo_cambio,
  f.tipo_cambio_fecha,
  row_number() over (partition by f.id order by l.orden, l.id) as linea,
  count(l.id) over (partition by f.id)   as lineas_de_la_factura,
  l.tipo_iva,
  l.base,
  l.cuota,
  case when f.moneda = 'EUR' then l.base  else round(l.base  / f.tipo_cambio, 2) end as base_eur,
  case when f.moneda = 'EUR' then l.cuota else round(l.cuota / f.tipo_cambio, 2) end as cuota_eur,
  l.origen                               as origen_linea,
  case when row_number() over (partition by f.id order by l.orden, l.id) = 1
       then case when f.moneda = 'EUR' then f.retencion_importe
                 else round(f.retencion_importe / f.tipo_cambio, 2) end
  end                                    as retencion_eur,
  case when row_number() over (partition by f.id order by l.orden, l.id) = 1
       then f.total_eur end              as total_eur,
  f.estado_revision,
  d.ruta_storage
from public.facturas f
join public.documentos d   on d.id = f.documento_id
left join public.categorias c on c.id = f.categoria_id
left join public.lineas_iva l on l.factura_id = f.id;

grant select on public.exportacion_gestoria to authenticated;
