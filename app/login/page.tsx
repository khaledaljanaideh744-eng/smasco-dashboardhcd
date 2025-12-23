"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  Eye,
  EyeOff,
  LogIn,
  User,
  Loader2,
  Mail,
  Lock
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { auth } from "@/lib/firestore";

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<LoginFormData>({ email: "", password: "" });
  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>({ email: false, password: false });
  const router = useRouter();

  const emailInvalid = touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const passwordInvalid = touched.password && formData.password.length < 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setTouched({ email: true, password: true });

    if (emailInvalid || passwordInvalid) return;

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      router.push("/notifications");
    } catch (err) {
      setError("فشل تسجيل الدخول. يرجى التحقق من بيانات الاعتماد الخاصة بك.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div dir="rtl" className="relative h-[100vh] overflow-hidden bg-gray-950">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0">
        {/* gradient wash */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-900/60 to-gray-950" />
        {/* radial glows */}
        <div className="absolute -top-28 -left-24 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute bottom-[-6rem] right-[-4rem] h-80 w-80 rounded-full bg-green-400/10 blur-3xl" />
        {/* subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.04] [background-image:radial-gradient(circle_at_1px_1px,#fff_1px,transparent_1px)] [background-size:24px_24px]"
          aria-hidden
        />
      </div>

      <main className="relative z-10 mx-auto flex min-h-svh max-w-7xl items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Brand / avatar */}
          <div className="mb-6 flex justify-center">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur">
              <User className="h-10 w-10 text-emerald-400" />
            </div>
          </div>

          <Card className="relative overflow-hidden border-white/10 bg-gray-900/60 text-white shadow-2xl backdrop-blur-xl">
            {/* top accent bar */}
            <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600" />

            <CardHeader className="pt-8 text-center">
              <CardTitle className="text-3xl font-bold tracking-tight">تسجيل الدخول</CardTitle>
              <p className="mt-2 text-sm text-gray-400">أدخل بيانات الاعتماد الخاصة بك للوصول إلى حسابك</p>
            </CardHeader>

            <CardContent className="pt-2">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">البريد الإلكتروني</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                      <Mail className="h-4 w-4 text-gray-400" />
                    </span>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      required
                      placeholder="ادخل البريد الإلكتروني"
                      className={`pr-4 pl-10 bg-gray-800/70 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-emerald-500 ${
                        emailInvalid ? "border-red-500 focus-visible:ring-red-500" : ""
                      }`}
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                      disabled={isLoading}
                      aria-invalid={emailInvalid || undefined}
                      aria-describedby="email-help"
                    />
                  </div>
                  {emailInvalid && (
                    <p id="email-help" className="text-xs text-red-400">صيغة البريد الإلكتروني غير صحيحة</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-gray-300">كلمة المرور</Label>
                  </div>

                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </span>

                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      placeholder="ادخل كلمة المرور"
                      className={`pr-12 pl-10 bg-gray-800/70 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-emerald-500 ${
                        passwordInvalid ? "border-red-500 focus-visible:ring-red-500" : ""
                      }`}
                      value={formData.password}
                      onChange={handleInputChange}
                      onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                      disabled={isLoading}
                      aria-invalid={passwordInvalid || undefined}
                      aria-describedby="password-help"
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-1 top-1 h-8 w-8 rounded-md hover:bg-white/5"
                      aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                    </Button>
                  </div>
                  {passwordInvalid && (
                    <p id="password-help" className="text-xs text-red-400">يجب أن تكون كلمة المرور 6 أحرف على الأقل</p>
                  )}
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-md border border-red-500/30 bg-red-500/10 p-2 text-center text-sm text-red-400"
                    role="alert"
                  >
                    {error}
                  </motion.div>
                )}

                <Button
                  type="submit"
                  className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-emerald-600 py-2.5 font-medium text-white transition hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  <span className="absolute inset-0 -translate-y-full bg-gradient-to-b from-white/10 to-transparent opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100" />
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>جاري تسجيل الدخول...</span>
                    </>
                  ) : (
                    <>
                      <span>تسجيل الدخول</span>
                      <LogIn className="h-4 w-4" />
                    </>
                  )}
                </Button>

               
              </form>
            </CardContent>

            <CardFooter className="justify-center pb-6 pt-2">
              <p className="text-xs text-gray-500">© {new Date().getFullYear()} جميع الحقوق محفوظة</p>
            </CardFooter>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
