"use server";

import { redirect } from "next/navigation";
import { clienteServidor } from "@/lib/supabase/servidor";

function destinoSeguro(valor: FormDataEntryValue | null, porDefecto = "/gastos"): string {
  const ruta = typeof valor === "string" ? valor : "";
  return ruta.startsWith("/") && !ruta.startsWith("//") && !ruta.startsWith("/\\") ? ruta : porDefecto;
}

function errorEn(ruta: string, mensaje: string): never {
  redirect(`${ruta}?error=${encodeURIComponent(mensaje)}`);
}

function campo(formData: FormData, nombre: string): string {
  const valor = formData.get(nombre);
  return typeof valor === "string" ? valor.trim() : "";
}

function validarEmail(email: string): boolean {
  return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
}

function validarPassword(password: string): boolean {
  return password.length >= 8 && password.length <= 72;
}

export async function entrar(formData: FormData): Promise<void> {
  const email = campo(formData, "email").toLowerCase();
  const password = passwordCampo(formData, "password");
  const next = destinoSeguro(formData.get("next"));
  if (!validarEmail(email) || !password) errorEn("/entrar", "Introduce un correo y una contraseña válidos.");

  const supabase = await clienteServidor();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.message.toLowerCase().includes("email not confirmed")) {
      errorEn("/entrar", "Todavía tienes que confirmar tu correo. Revisa tu bandeja de entrada.");
    }
    errorEn("/entrar", "No hemos podido iniciar sesión. Comprueba el correo y la contraseña.");
  }
  redirect(next);
}

export async function registrar(formData: FormData): Promise<void> {
  const email = campo(formData, "email").toLowerCase();
  const password = campo(formData, "password");
  const repetir = passwordCampo(formData, "passwordConfirm");
  if (!validarEmail(email)) errorEn("/registro", "Introduce un correo electrónico válido.");
  if (!validarPassword(password)) errorEn("/registro", "La contraseña debe tener al menos 8 caracteres.");
  if (password !== repetir) errorEn("/registro", "Las contraseñas no coinciden.");

  const supabase = await clienteServidor();
  const origen = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\\/$/, "") || "http://localhost:3000";
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origen}/auth/callback?next=/gastos` },
  });
  if (error) {
    console.error("[auth/registro]", error.message);
    errorEn("/registro", "No hemos podido crear la cuenta. Comprueba los datos o intenta entrar si ya tienes una cuenta.");
  }
  if (data.session) redirect("/gastos");
  redirect("/registro?mensaje=Revisa%20tu%20correo%20para%20confirmar%20la%20cuenta.");
}

export async function solicitarRecuperacion(formData: FormData): Promise<void> {
  const email = campo(formData, "email").toLowerCase();
  if (!validarEmail(email)) errorEn("/recuperar", "Introduce un correo electrónico válido.");

  const supabase = await clienteServidor();
  const origen = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\\/$/, "") || "http://localhost:3000";
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origen}/auth/callback?next=/nueva-contrasena`,
  });
  if (error) {
    console.error("[auth/recuperar]", error.message);
    errorEn("/recuperar", "No hemos podido enviar el correo. Inténtalo de nuevo más tarde.");
  }
  // Respuesta idéntica exista o no la cuenta, para no revelar usuarios registrados.
  redirect("/recuperar?mensaje=Si%20el%20correo%20está%20registrado%2C%20recibirás%20un%20enlace%20para%20cambiar%20la%20contraseña.");
}

export async function actualizarContrasena(formData: FormData): Promise<void> {
  const password = campo(formData, "password");
  const repetir = campo(formData, "passwordConfirm");
  if (!validarPassword(password)) errorEn("/nueva-contrasena", "La contraseña debe tener al menos 8 caracteres.");
  if (password !== repetir) errorEn("/nueva-contrasena", "Las contraseñas no coinciden.");

  const supabase = await clienteServidor();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) errorEn("/entrar", "El enlace ha caducado o no es válido. Solicita uno nuevo.");
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    console.error("[auth/nueva-contrasena]", error.message);
    errorEn("/nueva-contrasena", "No hemos podido cambiar la contraseña. Solicita un enlace nuevo.");
  }
  await supabase.auth.signOut();
  redirect("/entrar?mensaje=Contraseña%20actualizada.%20Ya%20puedes%20entrar.");
}

export async function salir(): Promise<void> {
  const supabase = await clienteServidor();
  await supabase.auth.signOut();
  redirect("/entrar?mensaje=Has%20cerrado%20sesión.");
}
