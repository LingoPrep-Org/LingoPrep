'use client';

import * as React from 'react';
import {
  Bell,
  CheckCircle2,
  XCircle,
  CalendarClock,
  FileEdit,
  Plus,
  Search,
  Pencil,
  Trash2,
  Power,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { KpiCard } from '@/components/shared/kpi-card';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  MOCK_NOTIFICATIONS,
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_STATUS_LABELS,
  type SystemNotification,
  type NotificationType,
  type NotificationStatus,
} from '@/lib/data/mock-notifications';

const PAGE_SIZE = 8;

const TYPE_STYLES: Record<NotificationType, string> = {
  SYSTEM_MAINTENANCE: 'border-primary/20 bg-primary/10 text-primary',
  AI_MAINTENANCE: 'border-chart-5/20 bg-chart-5/10 text-chart-5',
  NEW_FEATURE: 'border-success/20 bg-success/10 text-success',
  SYSTEM_WARNING: 'border-destructive/20 bg-destructive/10 text-destructive',
};

const STATUS_STYLES: Record<NotificationStatus, string> = {
  DRAFT: 'border-muted-foreground/20 bg-muted text-muted-foreground',
  SCHEDULED: 'border-warning/30 bg-warning/10 text-warning',
  ACTIVE: 'border-success/20 bg-success/10 text-success',
  DISABLED: 'border-destructive/20 bg-destructive/10 text-destructive',
};

type FilterValue = 'ALL' | NotificationType | NotificationStatus;

interface NotifForm {
  title: string;
  content: string;
  type: NotificationType;
  status: NotificationStatus;
  displayAt: string;
}

const EMPTY_FORM: NotifForm = {
  title: '',
  content: '',
  type: 'SYSTEM_MAINTENANCE',
  status: 'DRAFT',
  displayAt: new Date().toISOString().slice(0, 10),
};

function validateForm(form: NotifForm): Partial<Record<keyof NotifForm, string>> {
  const errors: Partial<Record<keyof NotifForm, string>> = {};
  if (!form.title.trim()) errors.title = 'Tiêu đề không được để trống.';
  if (!form.content.trim()) errors.content = 'Nội dung không được để trống.';
  return errors;
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = React.useState<SystemNotification[]>(MOCK_NOTIFICATIONS);
  const [search, setSearch] = React.useState('');
  const [fType, setFType] = React.useState<FilterValue>('ALL');
  const [fStatus, setFStatus] = React.useState<FilterValue>('ALL');
  const [page, setPage] = React.useState(1);

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<NotifForm>(EMPTY_FORM);
  const [formErrors, setFormErrors] = React.useState<Partial<Record<keyof NotifForm, string>>>({});

  const [confirmToggle, setConfirmToggle] = React.useState<SystemNotification | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState<SystemNotification | null>(null);

  const filtered = React.useMemo(() => {
    return notifications.filter((n) => {
      const s = search.toLowerCase().trim();
      const mSearch = !s || n.title.toLowerCase().includes(s) || n.content.toLowerCase().includes(s);
      const mType = fType === 'ALL' || n.type === fType;
      const mStatus = fStatus === 'ALL' || n.status === fStatus;
      return mSearch && mType && mStatus;
    });
  }, [notifications, search, fType, fStatus]);

  React.useEffect(() => setPage(1), [search, fType, fStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  const summary = React.useMemo(() => ({
    total: notifications.length,
    active: notifications.filter((n) => n.status === 'ACTIVE').length,
    scheduled: notifications.filter((n) => n.status === 'SCHEDULED').length,
    draft: notifications.filter((n) => n.status === 'DRAFT').length,
    disabled: notifications.filter((n) => n.status === 'DISABLED').length,
  }), [notifications]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setFormOpen(true);
  };

  const openEdit = (n: SystemNotification) => {
    setEditingId(n.id);
    setForm({
      title: n.title,
      content: n.content,
      type: n.type,
      status: n.status,
      displayAt: n.displayAt,
    });
    setFormErrors({});
    setFormOpen(true);
  };

  const handleSaveForm = () => {
    const errs = validateForm(form);
    setFormErrors(errs);
    if (Object.values(errs).some((v) => v !== undefined)) {
      toast.error('Vui lòng kiểm tra lại các trường.');
      return;
    }
    if (editingId) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === editingId
            ? { ...n, ...form, createdAt: n.createdAt, createdBy: n.createdBy }
            : n
        )
      );
      toast.success('Đã cập nhật thông báo.');
    } else {
      const newN: SystemNotification = {
        id: `n${String(Date.now()).slice(-6)}`,
        ...form,
        createdAt: new Date().toISOString().slice(0, 10),
        createdBy: 'Admin System',
      };
      setNotifications((prev) => [newN, ...prev]);
      toast.success('Đã tạo thông báo.');
    }
    setFormOpen(false);
  };

  const handleToggle = () => {
    if (!confirmToggle) return;
    const next: NotificationStatus = confirmToggle.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    setNotifications((prev) =>
      prev.map((n) => (n.id === confirmToggle.id ? { ...n, status: next } : n))
    );
    toast.success(next === 'ACTIVE' ? 'Đã bật thông báo.' : 'Đã tắt thông báo.');
    setConfirmToggle(null);
  };

  const handleDelete = () => {
    if (!confirmDelete) return;
    setNotifications((prev) => prev.filter((n) => n.id !== confirmDelete.id));
    toast.success('Đã xóa thông báo.');
    setConfirmDelete(null);
  };

  const clearFilters = () => {
    setSearch('');
    setFType('ALL');
    setFStatus('ALL');
  };

  return (
    <>
      <PageHeader
        title="Thông báo hệ thống"
        description="Quản lý các thông báo chung dành cho toàn hệ thống."
      >
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Tạo thông báo
        </Button>
      </PageHeader>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <KpiCard icon={Bell} label="Tổng thông báo" value={String(summary.total)} />
        <KpiCard icon={CheckCircle2} label="Đang hoạt động" value={String(summary.active)} iconClassName="bg-success/10 text-success" />
        <KpiCard icon={CalendarClock} label="Đã lên lịch" value={String(summary.scheduled)} iconClassName="bg-warning/10 text-warning" />
        <KpiCard icon={FileEdit} label="Bản nháp" value={String(summary.draft)} iconClassName="bg-muted text-muted-foreground" />
        <KpiCard icon={XCircle} label="Đã tắt" value={String(summary.disabled)} iconClassName="bg-destructive/10 text-destructive" />
      </div>

      {/* Filters */}
      <Card className="mt-6">
        <CardContent className="space-y-4 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tiêu đề hoặc nội dung..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Select value={fType} onValueChange={(v) => setFType(v as FilterValue)}>
              <SelectTrigger><SelectValue placeholder="Loại thông báo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả loại</SelectItem>
                <SelectItem value="SYSTEM_MAINTENANCE">Bảo trì hệ thống</SelectItem>
                <SelectItem value="AI_MAINTENANCE">Bảo trì AI</SelectItem>
                <SelectItem value="NEW_FEATURE">Tính năng mới</SelectItem>
                <SelectItem value="SYSTEM_WARNING">Cảnh báo hệ thống</SelectItem>
              </SelectContent>
            </Select>
            <Select value={fStatus} onValueChange={(v) => setFStatus(v as FilterValue)}>
              <SelectTrigger><SelectValue placeholder="Trạng thái" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                <SelectItem value="DRAFT">Bản nháp</SelectItem>
                <SelectItem value="SCHEDULED">Đã lên lịch</SelectItem>
                <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
                <SelectItem value="DISABLED">Đã tắt</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" onClick={clearFilters} className="justify-start sm:justify-end">
              Xóa bộ lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table / Empty */}
      {pageItems.length === 0 ? (
        <Card className="mt-4">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Bell className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Không tìm thấy thông báo</h3>
            <p className="mt-1 text-sm text-muted-foreground">Thử thay đổi từ khóa hoặc bộ lọc.</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>Xóa bộ lọc</Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="mt-4">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Tiêu đề</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Ngày hiển thị</TableHead>
                    <TableHead>Người tạo</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageItems.map((n) => (
                    <TableRow key={n.id}>
                      <TableCell>
                        <p className="max-w-[280px] truncate text-sm font-medium text-foreground" title={n.title}>
                          {n.title}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn('px-2 py-0.5 text-xs', TYPE_STYLES[n.type])}>
                          {NOTIFICATION_TYPE_LABELS[n.type]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn('px-2 py-0.5 text-xs', STATUS_STYLES[n.status])}>
                          {NOTIFICATION_STATUS_LABELS[n.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{n.createdAt}</TableCell>
                      <TableCell className="text-muted-foreground">{n.displayAt}</TableCell>
                      <TableCell className="text-muted-foreground">{n.createdBy}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => openEdit(n)}>
                            <Pencil className="h-3.5 w-3.5" />
                            <span className="hidden lg:inline">Sửa</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => setConfirmToggle(n)}
                          >
                            <Power className="h-3.5 w-3.5" />
                            <span className="hidden lg:inline">
                              {n.status === 'ACTIVE' ? 'Tắt' : 'Bật'}
                            </span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1.5 text-destructive hover:text-destructive"
                            onClick={() => setConfirmDelete(n)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="hidden lg:inline">Xóa</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            Trang {currentPage} / {totalPages} ({filtered.length} thông báo)
          </p>
          <Pagination className="mx-0 w-auto justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => { e.preventDefault(); if (currentPage > 1) setPage(currentPage - 1); }}
                  className={cn(currentPage === 1 && 'pointer-events-none opacity-50')}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink href="#" isActive={p === currentPage} onClick={(e) => { e.preventDefault(); setPage(p); }}>
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) setPage(currentPage + 1); }}
                  className={cn(currentPage === totalPages && 'pointer-events-none opacity-50')}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Chỉnh sửa thông báo' : 'Tạo thông báo'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Cập nhật nội dung thông báo hệ thống' : 'Tạo thông báo hệ thống mới'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="n-title">Tiêu đề</Label>
              <Input
                id="n-title"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Nhập tiêu đề thông báo..."
              />
              {formErrors.title && <p className="text-xs text-destructive">{formErrors.title}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="n-content">Nội dung</Label>
              <Textarea
                id="n-content"
                value={form.content}
                onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                placeholder="Nhập nội dung thông báo..."
                className="min-h-[100px]"
              />
              {formErrors.content && <p className="text-xs text-destructive">{formErrors.content}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Loại</Label>
                <Select value={form.type} onValueChange={(v) => setForm((p) => ({ ...p, type: v as NotificationType }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SYSTEM_MAINTENANCE">Bảo trì hệ thống</SelectItem>
                    <SelectItem value="AI_MAINTENANCE">Bảo trì AI</SelectItem>
                    <SelectItem value="NEW_FEATURE">Tính năng mới</SelectItem>
                    <SelectItem value="SYSTEM_WARNING">Cảnh báo hệ thống</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v as NotificationStatus }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Bản nháp</SelectItem>
                    <SelectItem value="SCHEDULED">Đã lên lịch</SelectItem>
                    <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
                    <SelectItem value="DISABLED">Đã tắt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="n-display">Thời gian hiển thị</Label>
              <Input
                id="n-display"
                type="date"
                value={form.displayAt}
                onChange={(e) => setForm((p) => ({ ...p, displayAt: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Hủy</Button>
            <Button onClick={handleSaveForm}>
              {editingId ? 'Lưu thay đổi' : 'Tạo thông báo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toggle Confirmation */}
      <AlertDialog open={confirmToggle !== null} onOpenChange={(o) => !o && setConfirmToggle(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmToggle?.status === 'ACTIVE' ? 'Tắt thông báo' : 'Bật thông báo'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmToggle?.status === 'ACTIVE'
                ? 'Bạn có chắc chắn muốn tắt thông báo này không?'
                : 'Bạn có chắc chắn muốn bật thông báo này không?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggle}>
              {confirmToggle?.status === 'ACTIVE' ? 'Tắt thông báo' : 'Bật thông báo'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog open={confirmDelete !== null} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa thông báo</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa thông báo này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
