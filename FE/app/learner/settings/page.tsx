'use client';

import * as React from 'react';
import {
  Settings as SettingsIcon,
  Save,
  RotateCcw,
  Bell,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
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
import { toast } from 'sonner';
import {
  DEFAULT_LEARNER_SETTINGS,
  type LearnerSettings,
  type ThemeMode,
} from '@/lib/data/mock-learner-dashboard';

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
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export default function LearnerSettingsPage() {
  const [settings, setSettings] = React.useState<LearnerSettings>(DEFAULT_LEARNER_SETTINGS);
  const [savedSettings, setSavedSettings] = React.useState<LearnerSettings>(DEFAULT_LEARNER_SETTINGS);
  const [showResetDialog, setShowResetDialog] = React.useState(false);

  const hasUnsavedChanges = React.useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(savedSettings),
    [settings, savedSettings]
  );

  const update = <K extends keyof LearnerSettings>(key: K, value: LearnerSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setSavedSettings(settings);
    toast.success('Đã lưu cài đặt.');
  };

  const handleReset = () => {
    setSettings(DEFAULT_LEARNER_SETTINGS);
    setSavedSettings(DEFAULT_LEARNER_SETTINGS);
    setShowResetDialog(false);
    toast.success('Đã đặt lại cài đặt mặc định.');
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Cài đặt</h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Quản lý cài đặt cá nhân của bạn.
        </p>
      </div>

      {hasUnsavedChanges && (
        <div className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/5 px-4 py-2.5">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <span className="text-sm text-foreground">Có thay đổi chưa được lưu</span>
        </div>
      )}

      {/* General Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <SettingsIcon className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-lg">Cài đặt chung</CardTitle>
              <CardDescription>Tùy chỉnh giao diện và ngôn ngữ</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Giao diện</Label>
              <Select value={settings.theme} onValueChange={(v) => update('theme', v as ThemeMode)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LIGHT">Sáng</SelectItem>
                  <SelectItem value="DARK">Tối</SelectItem>
                  <SelectItem value="SYSTEM">Theo hệ thống</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ngôn ngữ</Label>
              <Select value={settings.language} onValueChange={(v) => update('language', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="vi">Tiếng Việt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-lg">Thông báo</CardTitle>
              <CardDescription>Quản lý thông báo cá nhân</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          <SettingToggle label="Bài nộp mới" description="Thông báo khi bài nộp được xử lý" checked={settings.notifyNewSubmission} onChange={(v) => update('notifyNewSubmission', v)} />
          <Separator />
          <SettingToggle label="Kết quả AI" description="Thông báo khi AI hoàn thành đánh giá" checked={settings.notifyAIResult} onChange={(v) => update('notifyAIResult', v)} />
          <Separator />
          <SettingToggle label="Giáo viên đánh giá" description="Thông báo khi giáo viên hoàn tất review" checked={settings.notifyTeacherReview} onChange={(v) => update('notifyTeacherReview', v)} />
          <Separator />
          <SettingToggle label="Thông báo hệ thống" description="Thông báo chung từ hệ thống" checked={settings.notifySystem} onChange={(v) => update('notifySystem', v)} />
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-lg">Bảo mật</CardTitle>
              <CardDescription>Cài đặt bảo mật cá nhân</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <SettingToggle
            label="Xác thực hai yếu tố"
            description="Bật 2FA để tăng cường bảo mật cho tài khoản"
            checked={settings.twoFactorEnabled}
            onChange={(v) => update('twoFactorEnabled', v)}
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="outline" className="gap-2" onClick={() => setShowResetDialog(true)}>
          <RotateCcw className="h-4 w-4" />
          Đặt lại
        </Button>
        <Button className="gap-2 sm:ml-auto" onClick={handleSave}>
          <Save className="h-4 w-4" />
          Lưu thay đổi
        </Button>
      </div>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Đặt lại cài đặt</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn đặt lại toàn bộ cài đặt về giá trị mặc định không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset}>Đặt lại</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
