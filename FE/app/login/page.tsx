"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Shield,
  BookOpen,
  User as UserIcon,
  FlaskConical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useAuth } from "@/lib/auth/auth-context";
import type { Role } from "@/lib/auth/types";
import { ROLE_LABELS, ROLE_HOMES } from "@/lib/auth/types";
import { toast } from "sonner";
import axios from "axios";
// import { cn } from "@/lib/utils";
import AuthService from "@/services/auth.services/auth.services";

// const ROLE_CARDS: {
//   role: Role;
//   icon: typeof Shield;
//   desc: string;
// }[] = [
//   { role: "ADMIN", icon: Shield, desc: "Quản trị hệ thống và cấu hình" },
//   { role: "TEACHER", icon: BookOpen, desc: "Đánh giá bài nộp và người học" },
//   { role: "LEARNER", icon: UserIcon, desc: "Luyện thi và xem phản hồi AI" },
// ];

export default function LoginPage() {
  const { user, signIn } = useAuth();
  const router = useRouter();
  // const [selected, setSelected] = React.useState<Role>("LEARNER");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  React.useEffect(() => {
    if (user) {
      router.replace(ROLE_HOMES[user.role]);
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Vui lòng nhập đầy đủ thông tin đăng nhập.");
      return;
    }

    try {
      const res = await AuthService.login({ email, password });

      signIn(
        {
          id: String(res.user.id),
          name: res.user.full_name,
          email: res.user.email,
          role: res.user.role,
          avatarUrl: res.user.avatar_url,
        },
        {
          accessToken: res.access_token,
          refreshToken: res.refresh_token,
        },
      );

      toast.success(
        `Đăng nhập thành công với vai trò ${ROLE_LABELS[res.user.role]}`,
      );
      router.push(ROLE_HOMES[res.user.role]);
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.detail || error.message
        : "Đăng nhập thất bại. Vui lòng thử lại.";
      toast.error(message);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-accent/40 via-background to-background p-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
          <GraduationCap className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          APTIS AI
        </h1>
        <p className="text-sm text-muted-foreground">
          Hệ thống luyện thi APTIS Speaking &amp; Writing
        </p>
      </div>

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>Đăng nhập hệ thống</CardTitle>
          <CardDescription>Chọn vai trò của bạn để tiếp tục.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* <div className="space-y-2">
              <Label>Vai trò</Label>
              <div className="grid grid-cols-3 gap-2">
                {ROLE_CARDS.map(({ role, icon: Icon, desc }) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelected(role)}
                    title={desc}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-lg border p-3 text-center transition-all",
                      selected === role
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border hover:border-primary/40 hover:bg-accent",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5",
                        selected === role
                          ? "text-primary"
                          : "text-muted-foreground",
                      )}
                    />
                    <span
                      className={cn(
                        "text-xs font-medium",
                        selected === role ? "text-primary" : "text-foreground",
                      )}
                    >
                      {ROLE_LABELS[role]}
                    </span>
                  </button>
                ))}
              </div>
            </div> */}

            <div className="space-y-2">
              <Label htmlFor="name">Họ và tên (tùy chọn)</Label>
              <Input
                id="name"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                placeholder="Nhập mật khẩu của bạn"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full" size="lg">
              Đăng nhập
            </Button>
          </form>

          <div className="mt-5 flex items-start gap-2 rounded-lg border border-dashed border-warning/40 bg-warning/5 p-3">
            <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground">
                  Chế độ Demo
                </span>
                <Badge
                  variant="outline"
                  className="border-warning/30 bg-warning/10 px-1.5 py-0 text-[10px] text-warning"
                >
                  Phát triển
                </Badge>
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Đây là hệ thống demo để kiểm tra giao diện và điều hướng theo
                vai trò. Chưa kết nối xác thực hay cơ sở dữ liệu thật.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Nền tảng APTIS AI - Xây dựng cho tương lai
      </p>
    </div>
  );
}
