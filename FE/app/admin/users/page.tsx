"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Lock, Unlock, Eye, Users, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { RoleBadge, StatusBadge } from "@/components/shared/badges";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { User, UserRole, UserStatus } from "@/lib/types/user";
import { ROLE_LABELS, STATUS_LABELS } from "@/lib/types/user";
import AdminService from "@/services/admin.services/admin.services";
import { toAdminUser } from "@/services/admin.services/type";

const PAGE_SIZE = 10;

type RoleFilter = "ALL" | UserRole;
type StatusFilter = "ALL" | UserStatus;

type ConfirmAction =
  | { type: "lock"; user: User }
  | { type: "unlock"; user: User }
  | { type: "approve"; user: User }
  | { type: "reject"; user: User }
  | null;

function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(-2)
    .join("")
    .toUpperCase();
}

function formatDate(date: string | null) {
  if (!date) return "—";
  return date;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [users, setUsers] = React.useState<User[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<RoleFilter>("ALL");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("ALL");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [confirmAction, setConfirmAction] = React.useState<ConfirmAction>(null);
  const [detailUser, setDetailUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    const statusParam = searchParams.get("status");
    if (statusParam === "PENDING") {
      setStatusFilter("PENDING");
    }
  }, [searchParams]);

  React.useEffect(() => {
    AdminService.getUsers()
      .then((items) => setUsers(items.map(toAdminUser)))
      .catch(() => toast.error("Không thể tải danh sách người dùng."))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = React.useMemo(() => {
    return users.filter((u) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);
      const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
      const matchesStatus = statusFilter === "ALL" || u.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const start = (page - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  const pendingTeacherCount = users.filter(
    (u) => u.role === "TEACHER" && u.status === "PENDING",
  ).length;

  const updateUser = (id: string, patch: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;
    const { type, user } = confirmAction;
    try {
      if (type === "lock" || type === "unlock") {
        const isActive = type === "unlock";
        await AdminService.updateUserStatus(user.id, isActive);
        updateUser(user.id, { status: isActive ? "ACTIVE" : "LOCKED" });
        toast.success(
          isActive ? "Đã mở khóa tài khoản." : "Đã khóa tài khoản.",
        );
      } else {
        updateUser(user.id, {
          status: type === "approve" ? "ACTIVE" : "REJECTED",
        });
        toast.success(
          type === "approve"
            ? "Đã phê duyệt đăng ký Teacher."
            : "Đã từ chối đăng ký Teacher.",
        );
      }
    } catch {
      toast.error("Không thể cập nhật trạng thái tài khoản.");
    }
    setConfirmAction(null);
  };

  const confirmMeta: Record<
    NonNullable<ConfirmAction>["type"],
    {
      title: string;
      desc: string;
      actionLabel: string;
      variant: "default" | "destructive";
    }
  > = {
    lock: {
      title: "Khóa tài khoản",
      desc: "Bạn có chắc chắn muốn khóa tài khoản này không?",
      actionLabel: "Khóa tài khoản",
      variant: "destructive",
    },
    unlock: {
      title: "Mở khóa tài khoản",
      desc: "Bạn có chắc chắn muốn mở khóa tài khoản này không?",
      actionLabel: "Mở khóa tài khoản",
      variant: "default",
    },
    approve: {
      title: "Phê duyệt đăng ký Teacher",
      desc: "Bạn có chắc chắn muốn phê duyệt tài khoản này?",
      actionLabel: "Phê duyệt",
      variant: "default",
    },
    reject: {
      title: "Từ chối đăng ký Teacher",
      desc: "Bạn có chắc chắn muốn từ chối đăng ký này không?",
      actionLabel: "Từ chối",
      variant: "destructive",
    },
  };

  return (
    <>
      <PageHeader
        title="Quản lý tài khoản"
        description="Quản lý trạng thái và vai trò của người dùng trong hệ thống."
      />

      {/* Filters */}
      <Card className="mb-4">
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={roleFilter}
            onValueChange={(v) => setRoleFilter(v as RoleFilter)}
          >
            <SelectTrigger className="w-full md:w-44">
              <SelectValue placeholder="Vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả vai trò</SelectItem>
              <SelectItem value="LEARNER">Người học</SelectItem>
              <SelectItem value="TEACHER">Giáo viên</SelectItem>
              <SelectItem value="ADMIN">Quản trị viên</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as StatusFilter)}
          >
            <SelectTrigger className="w-full md:w-44">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="PENDING">Chờ xử lý</SelectItem>
              <SelectItem value="ACTIVE">Hoạt động</SelectItem>
              <SelectItem value="LOCKED">Bị khóa</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Pending Teacher Alert */}
      {pendingTeacherCount > 0 && statusFilter !== "PENDING" && (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-warning/30 bg-warning/5 px-4 py-3">
          <UserPlus className="h-4 w-4 text-warning" />
          <span className="text-sm text-foreground">
            Có <strong className="font-semibold">{pendingTeacherCount}</strong>{" "}
            yêu cầu đăng ký Teacher đang chờ xử lý.
          </span>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto"
            onClick={() => setStatusFilter("PENDING")}
          >
            Xem yêu cầu
          </Button>
        </div>
      )}

      {/* Table / Empty State */}
      {pageItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Users className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              {isLoading ? "Đang tải tài khoản..." : "Không tìm thấy tài khoản"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {isLoading
                ? "Đang đồng bộ dữ liệu từ máy chủ."
                : "Thử thay đổi từ khóa hoặc bộ lọc."}
            </p>
            {!isLoading && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setSearch("");
                  setRoleFilter("ALL");
                  setStatusFilter("ALL");
                }}
              >
                Xóa bộ lọc
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Người dùng</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Lần đăng nhập cuối</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageItems.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          {user.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <RoleBadge role={user.role} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={user.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(user.lastLogin)}
                      </TableCell>
                      <TableCell className="text-right">
                        <UserActions
                          user={user}
                          onLock={() =>
                            setConfirmAction({ type: "lock", user })
                          }
                          onUnlock={() =>
                            setConfirmAction({ type: "unlock", user })
                          }
                          onViewRequest={() =>
                            setConfirmAction({ type: "approve", user })
                          }
                          onViewDetail={() => setDetailUser(user)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 p-4 md:hidden">
              {pageItems.map((user) => (
                <div
                  key={user.id}
                  className="rounded-lg border border-border p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <RoleBadge role={user.role} />
                    <StatusBadge status={user.status} />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>
                      <span className="font-medium text-foreground">
                        Ngày tạo:{" "}
                      </span>
                      {formatDate(user.createdAt)}
                    </div>
                    <div>
                      <span className="font-medium text-foreground">
                        Đăng nhập:{" "}
                      </span>
                      {formatDate(user.lastLogin)}
                    </div>
                  </div>
                  <Separator className="my-3" />
                  <div className="flex items-center justify-end gap-2">
                    <UserActions
                      user={user}
                      onLock={() => setConfirmAction({ type: "lock", user })}
                      onUnlock={() =>
                        setConfirmAction({ type: "unlock", user })
                      }
                      onViewRequest={() =>
                        setConfirmAction({ type: "approve", user })
                      }
                      onViewDetail={() => setDetailUser(user)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            Hiển thị {start + 1}–{Math.min(start + PAGE_SIZE, filtered.length)}{" "}
            trong {filtered.length} tài khoản
          </p>
          <Pagination className="mx-0 w-auto justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page > 1) setCurrentPage(page - 1);
                  }}
                  aria-disabled={page === 1}
                  className={cn(page === 1 && "pointer-events-none opacity-50")}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink
                    href="#"
                    isActive={p === page}
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(p);
                    }}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page < totalPages) setCurrentPage(page + 1);
                  }}
                  aria-disabled={page === totalPages}
                  className={cn(
                    page === totalPages && "pointer-events-none opacity-50",
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmAction !== null}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {confirmAction ? confirmMeta[confirmAction.type].title : ""}
            </DialogTitle>
            <DialogDescription>
              {confirmAction ? confirmMeta[confirmAction.type].desc : ""}
            </DialogDescription>
          </DialogHeader>
          {confirmAction?.type === "approve" && (
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="mb-3 text-sm font-semibold text-foreground">
                Thông tin đăng ký Teacher
              </p>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Họ tên</dt>
                  <dd className="font-medium">{confirmAction.user.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="font-medium">{confirmAction.user.email}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Vai trò đăng ký</dt>
                  <dd>
                    <RoleBadge role={confirmAction.user.role} />
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Ngày đăng ký</dt>
                  <dd className="font-medium">
                    {confirmAction.user.appliedAt ??
                      confirmAction.user.createdAt}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Trạng thái</dt>
                  <dd>
                    <StatusBadge status={confirmAction.user.status} />
                  </dd>
                </div>
              </dl>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmAction(null)}>
              Hủy
            </Button>
            {confirmAction?.type === "approve" && (
              <Button
                variant="destructive"
                onClick={() => {
                  setConfirmAction({
                    type: "reject",
                    user: confirmAction.user,
                  });
                }}
              >
                Từ chối
              </Button>
            )}
            <Button
              variant={
                confirmAction
                  ? confirmMeta[confirmAction.type].variant
                  : "default"
              }
              onClick={handleConfirm}
            >
              {confirmAction ? confirmMeta[confirmAction.type].actionLabel : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Account Detail Dialog */}
      <Dialog
        open={detailUser !== null}
        onOpenChange={(open) => !open && setDetailUser(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chi tiết tài khoản</DialogTitle>
            <DialogDescription>
              Thông tin vòng đời tài khoản người dùng
            </DialogDescription>
          </DialogHeader>
          {detailUser && (
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                  {getInitials(detailUser.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground">
                  {detailUser.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {detailUser.email}
                </p>
              </div>
            </div>
          )}
          {detailUser && (
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Vai trò</dt>
                <dd>
                  <RoleBadge role={detailUser.role} />
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Trạng thái</dt>
                <dd>
                  <StatusBadge status={detailUser.status} />
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Ngày tạo</dt>
                <dd className="font-medium">
                  {formatDate(detailUser.createdAt)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Lần đăng nhập cuối</dt>
                <dd className="font-medium">
                  {formatDate(detailUser.lastLogin)}
                </dd>
              </div>
            </dl>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailUser(null)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function UserActions({
  user,
  onLock,
  onUnlock,
  onViewRequest,
  onViewDetail,
}: {
  user: User;
  onLock: () => void;
  onUnlock: () => void;
  onViewRequest: () => void;
  onViewDetail: () => void;
}) {
  const isAdmin = user.role === "ADMIN";
  const isPendingTeacher = user.role === "TEACHER" && user.status === "PENDING";

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5"
        onClick={onViewDetail}
      >
        <Eye className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Chi tiết</span>
      </Button>
      {isAdmin ? null : isPendingTeacher ? (
        <Button
          variant="default"
          size="sm"
          className="gap-1.5"
          onClick={onViewRequest}
        >
          Xem yêu cầu
        </Button>
      ) : user.status === "LOCKED" ? (
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={onUnlock}
        >
          <Unlock className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Mở khóa</span>
        </Button>
      ) : user.status === "ACTIVE" ? (
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-destructive hover:text-destructive"
          onClick={onLock}
        >
          <Lock className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Khóa</span>
        </Button>
      ) : null}
    </div>
  );
}
