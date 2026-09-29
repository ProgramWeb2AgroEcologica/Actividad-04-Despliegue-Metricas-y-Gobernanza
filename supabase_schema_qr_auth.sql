-- ==============================================================================
-- UNIVERSIDAD PRIVADA DOMINGO SAVIO (UPDS) - FACULTAD DE CIENCIAS DE LA COMPUTACIÓN
-- ASIGNATURA: PROGRAMACIÓN WEB II - DOCENTE: ING. JIMMY REQUENA
-- DESAFÍO ESPECIAL DE CÁTEDRA: AUTENTICACIÓN PASSWORDLESS DE DISPOSITIVOS POR CÓDIGO QR
-- ==============================================================================
-- Este script DDL/DCL implementa en PostgreSQL/Supabase la infraestructura de
-- emparejamiento criptográfico de dispositivos móviles y biometría (WebAuthn)
-- sin requerir contraseña, análogo al protocolo de acceso de la universidad.

-- 1. CREACIÓN DE LA TABLA DE SESIONES QR DE DISPOSITIVOS
CREATE TABLE IF NOT EXISTS public.auth_qr_sesiones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_token TEXT UNIQUE NOT NULL,
    estado TEXT NOT NULL DEFAULT 'pendiente' 
        CHECK (estado IN ('pendiente', 'autorizado', 'expirado', 'rechazado')),
    dispositivo_origen TEXT DEFAULT 'Web Browser Desktop',
    dispositivo_autorizador TEXT,
    ip_origen INET,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rol_autorizado TEXT DEFAULT 'productor',
    payload_biometria JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (timezone('utc'::text, now()) + INTERVAL '2 minutes')
);

-- Índices de alto rendimiento para polling y sincronización Realtime
CREATE INDEX IF NOT EXISTS idx_auth_qr_session_token ON public.auth_qr_sesiones(session_token);
CREATE INDEX IF NOT EXISTS idx_auth_qr_estado ON public.auth_qr_sesiones(estado);

-- 2. HABILITACIÓN DE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.auth_qr_sesiones ENABLE ROW LEVEL SECURITY;

-- Política 1: Cualquier cliente anónimo puede generar una sesión QR pendiente (Desktop Web)
CREATE POLICY "Permitir_Creacion_Sesion_QR_Anon" 
ON public.auth_qr_sesiones 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (estado = 'pendiente');

-- Política 2: Consulta pública de estado solo si la sesión no ha expirado
CREATE POLICY "Permitir_Lectura_Estado_Sesion_QR" 
ON public.auth_qr_sesiones 
FOR SELECT 
TO anon, authenticated 
USING (expires_at > timezone('utc'::text, now()));

-- Política 3: Solo dispositivos móviles autenticados pueden autorizar la sesión
CREATE POLICY "Permitir_Autorizacion_Móvil_Sesion_QR" 
ON public.auth_qr_sesiones 
FOR UPDATE 
TO anon, authenticated 
USING (estado = 'pendiente' AND expires_at > timezone('utc'::text, now()))
WITH CHECK (estado IN ('autorizado', 'rechazado'));

-- 3. HABILITACIÓN DE SUPABASE REALTIME (WebSockets para el Desktop)
-- Permite que el navegador de escritorio reciba la autorización al instante
ALTER PUBLICATION supabase_realtime ADD TABLE public.auth_qr_sesiones;

-- 4. FUNCIÓN Y TRIGGER DE PURGA AUTOMÁTICA DE SESIONES EXPIRADAS
CREATE OR REPLACE FUNCTION public.fn_purgar_sesiones_qr_expiradas()
RETURNS trigger AS $$
BEGIN
    DELETE FROM public.auth_qr_sesiones 
    WHERE expires_at < (timezone('utc'::text, now()) - INTERVAL '10 minutes');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_limpiar_sesiones_qr
AFTER INSERT ON public.auth_qr_sesiones
FOR EACH STATEMENT
EXECUTE FUNCTION public.fn_purgar_sesiones_qr_expiradas();

COMMENT ON TABLE public.auth_qr_sesiones IS 'Sesiones efímeras de emparejamiento QR passwordless para el Desafío Especial de Cátedra UPDS.';
