'use client';

import { Bot } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Placeholder } from '@/components/layout/placeholder';

export default function LearnerFeedbackPage() {
  return (
    <>
      <PageHeader
        title="Phản hồi AI"
        description="Nhận xét và đề xuất từ AI cho bài luyện của bạn."
      />
      <Placeholder
        icon={Bot}
        title="Phản hồi AI"
        description="Phản hồi chi tiết của AI cho từng bài nộp Speaking và Writing."
      />
    </>
  );
}
