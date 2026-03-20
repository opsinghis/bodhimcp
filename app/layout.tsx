import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bodhi MCP — Agentic Workflow Platform',
  description: 'Design, build, and run MCP-powered agentic workflows. From brief to design doc to production workflow JSON — with built-in AEO, Shipment Tracking, and Shopping Assistant examples.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
