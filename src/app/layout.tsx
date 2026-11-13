import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BOWONE — Portfolio & Commission',
  description: '일러스트, 애니메이션, 3D 모델링 멀티미디어 아티스트 보원 포트폴리오',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-[#0B0D12] text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
