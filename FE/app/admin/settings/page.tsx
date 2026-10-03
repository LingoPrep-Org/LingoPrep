'use client';

import * as React from 'react';
import {
  Settings as SettingsIcon,
  Save,
  RotateCcw,
  AlertTriangle,
  Bot,
  Bell,
  Shield,
  KeyRound,
  Lock,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  DEFAULT_SYSTEM_SETTINGS,
  type SystemSettings,
  type RegistrationStatus,
} from '@/lib/data/mock-system-settings';

function validateSettings(s: SystemSettings): Partial<Record<keyof SystemSettings, string>> {
  const errors: Partial<Record<keyof SystemSettings, string>> = {};
  if (!s.systemName.trim()) errors.systemName = 'Tên hệ thống không được để trống.';
  if (s.maxPracticeSessions <= 0) errors.maxPracticeSessions = 'Số phiên luyện tập phải lớn hơn 0.';
  if (s.maxLoginAttempts <= 0) errors.maxLoginAttempts = 'Số lần đăng nhập phải lớn hơn 0.';
  if (s.lockoutDuration <= 0) errors.lockoutDuration = 'Thời gian khóa phải lớn hơn 0.';
  if (s.sessionTimeout <= 0) errors.sessionTimeout = 'Thời gian hết phiên phải lớn hơn 0.';
  if (s.minPasswordLength < 4) errors.minPasswordLength = 'Độ dài tối thiểu phải từ 4 ký tự trở lên.';
  return errors;
}

function SettingToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="space-y-0.5">
        <Label className="text-sm font-medium">{label}</Label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = React.useState<SystemSettings>(DEFAULT_SYSTEM_SETTINGS);
  const [savedSettings, setSavedSettings] = React.useState<SystemSettings>(DEFAULT_SYSTEM_SETTINGS);
  const [errors, setErrors] = React.useState<Partial<Record<keyof SystemSettings, string>>>({});
  const [showResetDialog, setShowResetDialog] = React.useState(false);

  const hasUnsavedChanges = React.useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(savedSettings),
    [settings, savedSettings]
  );

  const update = <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSave = () => {
    const errs = validateSettings(settings);
    setErrors(errs);
    if (Object.values(errs).some((v) => v !== undefined)) {
      toast.error('Vui lòng kiểm tra lại các trường cấu hình.');
      return;
    }
    setSavedSettings(settings);
    toast.success('Đã lưu cài đặt hệ thống.');
  };

  const handleReset = () => {
    setSettings(DEFAULT_SYSTEM_SETTINGS);
    setSavedSettings(DEFAULT_SYSTEM_SETTINGS);
    setErrors({});
    setShowResetDialog(false);
    toast.success('Đã khôi phục cài đặt mặc định.');
  };

  return (
    <>
      <PageHeader
        title="Cài đặt hệ thống"
        description="Quản lý các cấu hình chung, giới hạn hoạt động và chính sách bảo mật của hệ thống."
      />

      {/* Maintenance Warning */}
      {settings.maintenanceMode && (
        <Alert className="mb-6 border-warning/40">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <AlertTitle className="text-warning">Chế độ bảo trì</AlertTitle>
          <AlertDescription>
            Hệ thống đang ở chế độ bảo trì. Người dùng có thể gặp hạn chế khi truy cập.
          </AlertDescription>
        </Alert>
      )}

      {/* Unsaved Changes */}
      {hasUnsavedChanges && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/5 px-4 py-2.5">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <span className="text-sm text-foreground">Có thay đổi chưa được lưu</span>
        </div>
      )}

      {/* General Settings */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <SettingsIcon className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-lg">Cài đặt chung</CardTitle>
              <CardDescription>Cấu hình cơ bản của hệ thống</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="system-name">Tên hệ thống</Label>
            <Input
              id="system-name"
              value={settings.systemName}
              onChange={(e) => update('systemName', e.target.value)}
              placeholder="APTIS AI"
            />
            {errors.systemName && <p className="text-xs text-destructive">{errors.systemName}</p>}
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Đăng ký tài khoản</Label>
              <Select
                value={settings.registrationStatus}
                onValueChange={(v) => update('registrationStatus', v as RegistrationStatus)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">Cho phép đăng ký</SelectItem>
                  <SelectItem value="PAUSED">Tạm dừng đăng ký</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-sessions">Số phiên luyện tập tối đa</Label>
              <div className="relative">
                <Input
                  id="max-sessions"
                  type="number"
                  value={settings.maxPracticeSessions}
                  onChange={(e) => update('maxPracticeSessions', Number(e.target.value))}
                  placeholder="10"
                  className="pr-16"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  phiên/ngày
                </span>
              </div>
              {errors.maxPracticeSessions && (
                <p className="text-xs text-destructive">{errors.maxPracticeSessions}</p>
              )}
            </div>
          </div>
          <Separator />
          <SettingToggle
            label="Chế độ bảo trì"
            description="Bật chế độ bảo trì hệ thống"
            checked={settings.maintenanceMode}
            onChange={(v) => update('maintenanceMode', v)}
          />
        </CardContent>
      </Card>

      {/* AI Service Settings */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-lg">Cài đặt dịch vụ AI</CardTitle>
              <CardDescription>Quản lý tổng quan dịch vụ AI</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          <SettingToggle
            label="Dịch vụ AI"
            description="Bật/tắt toàn bộ dịch vụ AI"
            checked={settings.aiService}
            onChange={(v) => update('aiService', v)}
          />
          <Separator />
          <SettingToggle
            label="Cho phép đánh giá Speaking"
            checked={settings.speakingEval}
            onChange={(v) => update('speakingEval', v)}
          />
          <Separator />
          <SettingToggle
            label="Cho phép đánh giá Writing"
            checked={settings.writingEval}
            onChange={(v) => update('writingEval', v)}
          />
          <Separator />
          <SettingToggle
            label="Cho phép đánh giá CEFR"
            checked={settings.cefrEval}
            onChange={(v) => update('cefrEval', v)}
          />
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-lg">Cài đặt thông báo</CardTitle>
              <CardDescription>Quản lý thông báo hệ thống</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          <SettingToggle
            label="Thông báo hệ thống"
            checked={settings.systemNotifications}
            onChange={(v) => update('systemNotifications', v)}
          />
          <Separator />
          <SettingToggle
            label="Thông báo bảo trì"
            checked={settings.maintenanceNotifications}
            onChange={(v) => update('maintenanceNotifications', v)}
          />
          <Separator />
          <SettingToggle
            label="Cảnh báo hệ thống"
            checked={settings.systemWarnings}
            onChange={(v) => update('systemWarnings', v)}
          />
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-lg">Cài đặt bảo mật</CardTitle>
              <CardDescription>Cấu hình chính sách bảo mật hệ thống</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="max-login">Giới hạn số lần đăng nhập thất bại</Label>
              <div className="relative">
                <Input
                  id="max-login"
                  type="number"
                  value={settings.maxLoginAttempts}
                  onChange={(e) => update('maxLoginAttempts', Number(e.target.value))}
                  placeholder="5"
                  className="pr-10"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  lần
                </span>
              </div>
              {errors.maxLoginAttempts && <p className="text-xs text-destructive">{errors.maxLoginAttempts}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lockout">Thời gian khóa tạm thời</Label>
              <div className="relative">
                <Input
                  id="lockout"
                  type="number"
                  value={settings.lockoutDuration}
                  onChange={(e) => update('lockoutDuration', Number(e.target.value))}
                  placeholder="15"
                  className="pr-12"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  phút
                </span>
              </div>
              {errors.lockoutDuration && <p className="text-xs text-destructive">{errors.lockoutDuration}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="session-timeout">Thời gian hết phiên đăng nhập</Label>
              <div className="relative">
                <Input
                  id="session-timeout"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => update('sessionTimeout', Number(e.target.value))}
                  placeholder="30"
                  className="pr-12"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  phút
                </span>
              </div>
              {errors.sessionTimeout && <p className="text-xs text-destructive">{errors.sessionTimeout}</p>}
            </div>
          </div>
          <Separator />
          <SettingToggle
            label="Yêu cầu mật khẩu mạnh"
            checked={settings.requireStrongPassword}
            onChange={(v) => update('requireStrongPassword', v)}
          />
        </CardContent>
      </Card>

      {/* Password Policy */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10 text-warning">
              <KeyRound className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-lg">Chính sách mật khẩu</CardTitle>
              <CardDescription>Quy định độ mạnh của mật khẩu</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="min-length">Độ dài tối thiểu</Label>
            <div className="relative">
              <Input
                id="min-length"
                type="number"
                value={settings.minPasswordLength}
                onChange={(e) => update('minPasswordLength', Number(e.target.value))}
                placeholder="8"
                className="pr-12"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                ký tự
              </span>
            </div>
            {errors.minPasswordLength && <p className="text-xs text-destructive">{errors.minPasswordLength}</p>}
          </div>
          <Separator />
          <SettingToggle label="Yêu cầu chữ hoa" checked={settings.requireUppercase} onChange={(v) => update('requireUppercase', v)} />
          <Separator />
          <SettingToggle label="Yêu cầu chữ thường" checked={settings.requireLowercase} onChange={(v) => update('requireLowercase', v)} />
          <Separator />
          <SettingToggle label="Yêu cầu chữ số" checked={settings.requireDigit} onChange={(v) => update('requireDigit', v)} />
          <Separator />
          <SettingToggle label="Yêu cầu ký tự đặc biệt" checked={settings.requireSpecialChar} onChange={(v) => update('requireSpecialChar', v)} />
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-lg">Xác thực hai yếu tố</CardTitle>
              <CardDescription>Tăng cường bảo mật cho tài khoản</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          <SettingToggle
            label="Cho phép xác thực hai yếu tố"
            description="Bảo vệ tài khoản bằng xác thực hai yếu tố"
            checked={settings.twoFactorEnabled}
            onChange={(v) => update('twoFactorEnabled', v)}
          />
          <Separator />
          <SettingToggle
            label="Yêu cầu 2FA đối với Admin"
            description="Bắt buộc xác thực hai yếu tố cho tài khoản quản trị"
            checked={settings.require2FAForAdmin}
            onChange={(v) => update('require2FAForAdmin', v)}
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => setShowResetDialog(true)}
        >
          <RotateCcw className="h-4 w-4" />
          Khôi phục mặc định
        </Button>
        <Button className="gap-2 sm:ml-auto" onClick={handleSave}>
          <Save className="h-4 w-4" />
          Lưu thay đổi
        </Button>
      </div>

      {/* Reset Confirmation */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Khôi phục cài đặt mặc định</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn khôi phục toàn bộ cài đặt hệ thống về giá trị mặc định không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset}>Khôi phục</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
