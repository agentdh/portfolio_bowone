import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BOWONE — Portfolio & Commission',
  description: 'Illustrator · Animator · 3D Modeler 보원 포트폴리오 및 커미션 안내',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="dark">
      <body className={`${inter.className} bg-[#121316] text-zinc-100 antialiased selection:bg-zinc-200 selection:text-zinc-900`}>
        {children}
      </body>
    </html>
  );
}