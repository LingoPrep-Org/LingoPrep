"use client";

import * as React from "react";
import {
  Camera,
  Save,
  Lock,
  Shield,
  CheckCircle2,
  XCircle,
  Monitor,
  Smartphone,
  Award,
  Calendar,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth/auth-context";
import {
  MOCK_LEARNER,
  MOCK_LEARNER_LOGIN_HISTORY,
} from "@/lib/data/mock-learner-dashboard";

interface PasswordForm {
  current: string;
  next: string;
  confirm: string;
}

export default function LearnerProfilePage() {
  const { user } = useAuth();
  const [name, setName] = React.useState(MOCK_LEARNER.name);
  const [email, setEmail] = React.useState(MOCK_LEARNER.email);
  const [savedName, setSavedName] = React.useState(MOCK_LEARNER.name);
  const [savedEmail, setSavedEmail] = React.useState(MOCK_LEARNER.email);
  const [pwForm, setPwForm] = React.useState<PasswordForm>({
    current: "",
    next: "",
    confirm: "",
  });
  const [pwErrors, setPwErrors] = React.useState<
    Partial<Record<keyof PasswordForm, string>>
  >({});
  const [twoFA, setTwoFA] = React.useState(false);

  React.useEffect(() => {
    if (!user) return;
    setName(user.name);
    setSavedName(user.name);
    setEmail(user.email);
    setSavedEmail(user.email);
  }, [user]);

  const profileChanged = name !== savedName || email !== savedEmail;

  const handleSaveProfile = () => {
    if (!name.trim()) {
      toast.error("Tên không được để trống.");
      return;
    }
    if (!email.trim()) {
      toast.error("Email không được để trống.");
      return;
    }
    setSavedName(name);
    setSavedEmail(email);
    toast.success("Đã cập nhật thông tin cá nhân.");
  };

  const handleSavePassword = () => {
    const errs: Partial<Record<keyof PasswordForm, string>> = {};
    if (!pwForm.current.trim())
      errs.current = "Vui lòng nhập mật khẩu hiện tại.";
    if (!pwForm.next.trim()) errs.next = "Vui lòng nhập mật khẩu mới.";
    if (!pwForm.confirm.trim())
      errs.confirm = "Vui lòng xác nhận mật khẩu mới.";
    if (pwForm.next && pwForm.next.length < 8)
      errs.next = "Mật khẩu mới phải có ít nhất 8 ký tự.";
    if (pwForm.next && pwForm.confirm && pwForm.next !== pwForm.confirm)
      errs.confirm = "Mật khẩu xác nhận không khớp.";
    setPwErrors(errs);
    if (Object.values(errs).some((v) => v !== undefined)) {
      toast.error("Vui lòng kiểm tra lại các trường mật khẩu.");
      return;
    }
    setPwForm({ current: "", next: "", confirm: "" });
    toast.success("Đã cập nhật mật khẩu.");
  };

  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(-2)
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          Hồ sơ cá nhân
        </h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Quản lý thông tin và bảo mật tài khoản của bạn.
        </p>
      </div>

      {/* Profile Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="bg-warning/10 text-2xl font-bold text-warning">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                onClick={() =>
                  toast.info("Tính năng đổi ảnh đại diện là demo.")
                }
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 space-y-3 text-center sm:text-left">
              <div>
                <h2 className="text-xl font-bold text-foreground">{name}</h2>
                <p className="text-sm text-muted-foreground">{email}</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                <Badge
                  variant="outline"
                  className="gap-1.5 border-warning/20 bg-warning/10 text-warning"
                >
                  <Shield className="h-3 w-3" />
                  {MOCK_LEARNER.role}
                </Badge>
                <Badge
                  variant="outline"
                  className="gap-1.5 border-primary/20 bg-primary/10 text-primary"
                >
                  <Award className="h-3 w-3" />
                  CEFR: {MOCK_LEARNER.currentCEFR}
                </Badge>
                <Badge variant="outline" className="gap-1.5">
                  <Calendar className="h-3 w-3" />
                  Tham gia: {MOCK_LEARNER.joinDate}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    "gap-1.5",
                    twoFA
                      ? "border-success/20 bg-success/10 text-success"
                      : "border-muted-foreground/20 bg-muted text-muted-foreground",
                  )}
                >
                  <Shield className="h-3 w-3" />
                  2FA {twoFA ? "Đang bật" : "Đang tắt"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Thông tin cá nhân</CardTitle>
            <CardDescription>
              Cập nhật thông tin cá nhân của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Họ và tên</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button
              className="gap-2"
              onClick={handleSaveProfile}
              disabled={!profileChanged}
            >
              <Save className="h-4 w-4" />
              Lưu thông tin
            </Button>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Đổi mật khẩu</CardTitle>
            <CardDescription>
              Cập nhật mật khẩu tài khoản của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-pw">Mật khẩu hiện tại</Label>
              <Input
                id="current-pw"
                type="password"
                value={pwForm.current}
                onChange={(e) =>
                  setPwForm((p) => ({ ...p, current: e.target.value }))
                }
                placeholder="••••••••"
              />
              {pwErrors.current && (
                <p className="text-xs text-destructive">{pwErrors.current}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-pw">Mật khẩu mới</Label>
              <Input
                id="new-pw"
                type="password"
                value={pwForm.next}
                onChange={(e) =>
                  setPwForm((p) => ({ ...p, next: e.target.value }))
                }
                placeholder="••••••••"
              />
              {pwErrors.next && (
                <p className="text-xs text-destructive">{pwErrors.next}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-pw">Xác nhận mật khẩu mới</Label>
              <Input
                id="confirm-pw"
                type="password"
                value={pwForm.confirm}
                onChange={(e) =>
                  setPwForm((p) => ({ ...p, confirm: e.target.value }))
                }
                placeholder="••••••••"
              />
              {pwErrors.confirm && (
                <p className="text-xs text-destructive">{pwErrors.confirm}</p>
              )}
            </div>
            <Button className="gap-2" onClick={handleSavePassword}>
              <Lock className="h-4 w-4" />
              Cập nhật mật khẩu
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 2FA */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Xác thực hai yếu tố</CardTitle>
          <CardDescription>Tăng cường bảo mật cho tài khoản</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  Trạng thái 2FA
                </span>
                <Badge
                  variant="outline"
                  className={cn(
                    "gap-1.5",
                    twoFA
                      ? "border-success/20 bg-success/10 text-success"
                      : "border-muted-foreground/20 bg-muted text-muted-foreground",
                  )}
                >
                  {twoFA ? "Đang bật" : "Đang tắt"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Bật xác thực hai yếu tố để tăng cường bảo mật cho tài khoản.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor="2fa-toggle" className="text-sm font-medium">
                Bật xác thực hai yếu tố
              </Label>
              <Switch
                id="2fa-toggle"
                checked={twoFA}
                onCheckedChange={(v) => {
                  setTwoFA(v);
                  toast.success(
                    v
                      ? "Đã bật xác thực hai yếu tố."
                      : "Đã tắt xác thực hai yếu tố.",
                  );
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Login History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lịch sử đăng nhập</CardTitle>
          <CardDescription>Lịch sử đăng nhập gần đây</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Thiết bị</TableHead>
                  <TableHead>Địa chỉ IP</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_LEARNER_LOGIN_HISTORY.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.time}</TableCell>
                    <TableCell className="text-muted-foreground">
                      <span className="flex items-center gap-2">
                        {entry.device.includes("Android") ||
                        entry.device.includes("iPhone") ? (
                          <Smartphone className="h-3.5 w-3.5" />
                        ) : (
                          <Monitor className="h-3.5 w-3.5" />
                        )}
                        {entry.device}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {entry.ip}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "gap-1.5 px-2 py-0.5 text-xs",
                          entry.status === "success"
                            ? "border-success/20 bg-success/10 text-success"
                            : "border-destructive/20 bg-destructive/10 text-destructive",
                        )}
                      >
                        {entry.status === "success" ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {entry.status === "success" ? "Thành công" : "Thất bại"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
