"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

type CopyTextButtonProps = {
  text: string;
  label: string;
  actionLabel: string;
  successLabel: string;
  className?: string;
};

export default function CopyTextButton({ text, label, actionLabel, successLabel, className }: CopyTextButtonProps) {
  const [status, setStatus] = useState<"ready" | "copied" | "manual">("ready");

  async function copyText() {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch {
      setStatus("manual");
    }
  }

  const Icon = status === "copied" ? Check : Copy;

  return (
    <div className="copy-control">
      <button type="button" className={className} aria-label={actionLabel} onClick={copyText}>
        <Icon size={16} aria-hidden="true" />
        <span>{status === "copied" ? successLabel : label}</span>
      </button>
      <span className="sr-only" role="status">
        {status === "copied" ? successLabel : status === "manual" ? "아래 텍스트를 직접 복사해 주세요." : ""}
      </span>
      {status === "manual" && (
        <label className="copy-manual">
          <span>자동 복사가 제한되어 있습니다. 아래 내용을 직접 복사해 주세요.</span>
          <textarea readOnly value={text} rows={text.includes("\n") ? 6 : 1} onFocus={(event) => event.currentTarget.select()} />
        </label>
      )}
    </div>
  );
}
