"use client";

import * as React from "react";
import {
  Bot,
  CheckCircle2,
  XCircle,
  Loader2,
  Save,
  RotateCcw,
  Plug,
  AlertTriangle,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
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
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { DEFAULT_AI_CONFIG, type AIConfig } from "@/lib/data/mock-ai-config";
import AdminService from "@/services/admin.services/admin.services";

type ValidationResult = Partial<Record<keyof AIConfig, string>>;

function validate(config: AIConfig): ValidationResult {
  const errors: ValidationResult = {};
  if (!config.modelName.trim()) {
    errors.modelName = "Tên mô hình không được để trống.";
  }
  if (!config.endpoint.trim()) {
    errors.endpoint = "Endpoint không được để trống.";
  }
  if (config.requestLimit <= 0) {
    errors.requestLimit = "Giới hạn request phải lớn hơn 0.";
  }
  if (config.timeout <= 0) {
    errors.timeout = "Thời gian chờ phải lớn hơn 0.";
  }
  if (config.maxRetry < 0) {
    errors.maxRetry = "Số lần thử lại không được âm.";
  }
  return errors;
}

export default function AdminAiConfigurationPage() {
  const [config, setConfig] = React.useState<AIConfig>(DEFAULT_AI_CONFIG);
  const [savedConfig, setSavedConfig] =
    React.useState<AIConfig>(DEFAULT_AI_CONFIG);
  const [profileId, setProfileId] = React.useState<number | null>(null);
  const [errors, setErrors] = React.useState<ValidationResult>({});
  const [isTesting, setIsTesting] = React.useState(false);
  const [testResult, setTestResult] = React.useState<null | {
    success: boolean;
    message: string;
  }>(null);
  const [showResetDialog, setShowResetDialog] = React.useState(false);

  React.useEffect(() => {
    AdminService.getAiProfiles()
      .then((profiles) => {
        const profile = profiles[0];
        if (!profile) return;
        const profileConfig = profile.config;
        const nextConfig: AIConfig = {
          serviceName: profile.name,
          enabled: profile.is_active,
          modelName: profile.model_name,
          endpoint: String(profileConfig.endpoint ?? ""),
          requestLimit: Number(profileConfig.request_limit ?? 100),
          timeout: Number(profileConfig.timeout ?? 30),
          maxRetry: Number(profileConfig.max_retry ?? 3),
          speakingEval: Boolean(profileConfig.speaking_eval ?? true),
          writingEval: Boolean(profileConfig.writing_eval ?? true),
          cefrEval: Boolean(profileConfig.cefr_eval ?? true),
        };
        setProfileId(profile.id);
        setConfig(nextConfig);
        setSavedConfig(nextConfig);
      })
      .catch(() => toast.error("Không thể tải cấu hình AI."));
  }, []);

  const hasUnsavedChanges = React.useMemo(() => {
    return JSON.stringify(config) !== JSON.stringify(savedConfig);
  }, [config, savedConfig]);

  const update = <K extends keyof AIConfig>(key: K, value: AIConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSave = async () => {
    const validationErrors = validate(config);
    setErrors(validationErrors);
    if (Object.values(validationErrors).some((v) => v !== undefined)) {
      toast.error("Vui lòng kiểm tra lại các trường cấu hình.");
      return;
    }
    if (profileId === null) {
      toast.error("Chưa có cấu hình AI trên máy chủ.");
      return;
    }
    try {
      await AdminService.updateAiProfile(profileId, {
        name: config.serviceName,
        model_name: config.modelName,
        is_active: config.enabled,
        config: {
          endpoint: config.endpoint,
          request_limit: config.requestLimit,
          timeout: config.timeout,
          max_retry: config.maxRetry,
          speaking_eval: config.speakingEval,
          writing_eval: config.writingEval,
          cefr_eval: config.cefrEval,
        },
      });
      setSavedConfig(config);
      toast.success("Đã lưu cấu hình AI.");
    } catch {
      toast.error("Không thể lưu cấu hình AI.");
    }
  };

  const handleTestConnection = () => {
    setIsTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setIsTesting(false);
      setTestResult({
        success: true,
        message: "Dịch vụ AI phản hồi bình thường.",
      });
      toast.success("Kiểm tra kết nối thành công.");
    }, 1200);
  };

  const handleReset = () => {
    setConfig(DEFAULT_AI_CONFIG);
    setSavedConfig(DEFAULT_AI_CONFIG);
    setErrors({});
    setTestResult(null);
    setShowResetDialog(false);
    toast.success("Đã khôi phục cấu hình mặc định.");
  };

  return (
    <>
      <PageHeader
        title="Cấu hình AI"
        description="Quản lý cấu hình và tham số hoạt động của dịch vụ AI."
      />

      {/* AI Service Status */}
      <Card className="mb-6">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full",
                config.enabled ? "bg-success/10" : "bg-muted",
              )}
            >
              {config.enabled ? (
                <Bot className="h-6 w-6 text-success" />
              ) : (
                <Bot className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-base font-semibold text-foreground">
                  Trạng thái dịch vụ AI
                </p>
                <Badge
                  variant="outline"
                  className={cn(
                    "gap-1.5 px-2 py-0.5 text-xs font-medium",
                    config.enabled
                      ? "border-success/20 bg-success/10 text-success"
                      : "border-muted-foreground/20 bg-muted text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      config.enabled ? "bg-success" : "bg-muted-foreground",
                    )}
                  />
                  {config.enabled ? "Đang hoạt động" : "Đã tắt"}
                </Badge>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {config.enabled
                  ? "Dịch vụ AI hiện đang sẵn sàng xử lý yêu cầu."
                  : "Dịch vụ AI hiện đang tắt."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Label htmlFor="ai-toggle" className="text-sm font-medium">
              Dịch vụ AI
            </Label>
            <Switch
              id="ai-toggle"
              checked={config.enabled}
              onCheckedChange={(v) => update("enabled", v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Model Configuration */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Mô hình AI</CardTitle>
          <CardDescription>Cấu hình mô hình và tham số kết nối</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="modelName">Tên mô hình</Label>
            <Input
              id="modelName"
              value={config.modelName}
              onChange={(e) => update("modelName", e.target.value)}
              placeholder="APTIS Evaluation Model"
            />
            {errors.modelName && (
              <p className="flex items-center gap-1.5 text-xs text-destructive">
                <AlertTriangle className="h-3 w-3" />
                {errors.modelName}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="endpoint">Endpoint</Label>
            <Input
              id="endpoint"
              value={config.endpoint}
              onChange={(e) => update("endpoint", e.target.value)}
              placeholder="https://api.example.com/ai/evaluate"
            />
            {errors.endpoint && (
              <p className="flex items-center gap-1.5 text-xs text-destructive">
                <AlertTriangle className="h-3 w-3" />
                {errors.endpoint}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="requestLimit">Giới hạn request</Label>
              <div className="relative">
                <Input
                  id="requestLimit"
                  type="number"
                  value={config.requestLimit}
                  onChange={(e) =>
                    update("requestLimit", Number(e.target.value))
                  }
                  placeholder="100"
                  className="pr-16"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  /phút
                </span>
              </div>
              {errors.requestLimit && (
                <p className="flex items-center gap-1.5 text-xs text-destructive">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.requestLimit}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeout">Timeout</Label>
              <div className="relative">
                <Input
                  id="timeout"
                  type="number"
                  value={config.timeout}
                  onChange={(e) => update("timeout", Number(e.target.value))}
                  placeholder="30"
                  className="pr-12"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  giây
                </span>
              </div>
              {errors.timeout && (
                <p className="flex items-center gap-1.5 text-xs text-destructive">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.timeout}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxRetry">Số lần thử lại tối đa</Label>
              <div className="relative">
                <Input
                  id="maxRetry"
                  type="number"
                  value={config.maxRetry}
                  onChange={(e) => update("maxRetry", Number(e.target.value))}
                  placeholder="3"
                  className="pr-10"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  lần
                </span>
              </div>
              {errors.maxRetry && (
                <p className="flex items-center gap-1.5 text-xs text-destructive">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.maxRetry}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Evaluation Configuration */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Cấu hình đánh giá</CardTitle>
          <CardDescription>Bật/tắt các tính năng đánh giá AI</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          <EvalToggle
            label="Đánh giá Speaking"
            description="Cho phép AI chấm điểm bài Speaking"
            checked={config.speakingEval}
            onChange={(v) => update("speakingEval", v)}
          />
          <Separator />
          <EvalToggle
            label="Đánh giá Writing"
            description="Cho phép AI chấm điểm bài Writing"
            checked={config.writingEval}
            onChange={(v) => update("writingEval", v)}
          />
          <Separator />
          <EvalToggle
            label="Đánh giá CEFR"
            description="Cho phép AI đánh giá cấp độ CEFR"
            checked={config.cefrEval}
            onChange={(v) => update("cefrEval", v)}
          />
        </CardContent>
      </Card>

      {/* Unsaved Changes Indicator */}
      {hasUnsavedChanges && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/5 px-4 py-2.5">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <span className="text-sm text-foreground">
            Có thay đổi chưa được lưu
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          variant="outline"
          className="gap-2"
          onClick={handleTestConnection}
          disabled={isTesting || !config.enabled}
        >
          {isTesting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plug className="h-4 w-4" />
          )}
          Kiểm tra kết nối
        </Button>
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
          Lưu cấu hình
        </Button>
      </div>

      {/* Test Result */}
      {testResult && (
        <div
          className={cn(
            "mt-4 flex items-center gap-3 rounded-lg border p-4",
            testResult.success
              ? "border-success/30 bg-success/5"
              : "border-destructive/30 bg-destructive/5",
          )}
        >
          {testResult.success ? (
            <CheckCircle2 className="h-5 w-5 text-success" />
          ) : (
            <XCircle className="h-5 w-5 text-destructive" />
          )}
          <div>
            <p
              className={cn(
                "text-sm font-semibold",
                testResult.success ? "text-success" : "text-destructive",
              )}
            >
              {testResult.success ? "Kết nối thành công" : "Kết nối thất bại"}
            </p>
            <p className="text-sm text-muted-foreground">
              {testResult.message}
            </p>
          </div>
        </div>
      )}

      {/* Reset Confirmation */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Khôi phục cấu hình mặc định</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn khôi phục các cấu hình AI về giá trị mặc
              định không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset}>
              Khôi phục
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function EvalToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="space-y-0.5">
        <Label className="text-sm font-medium">{label}</Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
