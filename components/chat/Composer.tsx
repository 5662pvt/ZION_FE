"use client";

import { useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { Button, Flex, Input, Popover } from "antd";
import type { TextAreaRef } from "antd/es/input/TextArea";
import { FiImage, FiSend, FiSmile } from "react-icons/fi";
import { toast } from "@/utils/toast";
import { EMOJI_PALETTE } from "./emojiPalette";

const { TextArea } = Input;

const MAX_LENGTH = 2000;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const TYPING_THROTTLE_MS = 3000;

interface ComposerProps {
  onSendText: (text: string) => void;
  onSendImage: (file: File) => void;
  onTyping?: () => void;
  sending?: boolean;
  disabled?: boolean;
}

export default function Composer({ onSendText, onSendImage, onTyping, sending, disabled }: ComposerProps) {
  const [text, setText] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const textAreaRef = useRef<TextAreaRef | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const lastTypingAtRef = useRef(0);

  const isDisabled = disabled || sending;

  function emitTyping() {
    const now = Date.now();
    if (now - lastTypingAtRef.current < TYPING_THROTTLE_MS) return;
    lastTypingAtRef.current = now;
    onTyping?.();
  }

  function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value.slice(0, MAX_LENGTH));
    if (e.target.value.trim()) emitTyping();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || isDisabled) return;
    onSendText(trimmed);
    setText("");
  }

  function insertEmoji(emoji: string) {
    const textArea = textAreaRef.current?.resizableTextArea?.textArea;
    if (textArea) {
      const start = textArea.selectionStart ?? text.length;
      const end = textArea.selectionEnd ?? text.length;
      const next = `${text.slice(0, start)}${emoji}${text.slice(end)}`.slice(0, MAX_LENGTH);
      setText(next);
      requestAnimationFrame(() => {
        textArea.focus();
        const caret = start + emoji.length;
        textArea.setSelectionRange(caret, caret);
      });
    } else {
      setText((prev) => `${prev}${emoji}`.slice(0, MAX_LENGTH));
    }
    setEmojiOpen(false);
  }

  function handlePickImage() {
    fileInputRef.current?.click();
  }

  function handleImageSelected(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      toast.error("Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Ảnh phải nhỏ hơn 5 MB");
      return;
    }
    onSendImage(file);
  }

  return (
    <div style={{ borderTop: "1px solid var(--color-border)", padding: 8 }}>
      <Flex align="flex-end" gap={6}>
        <Popover
          trigger="click"
          open={emojiOpen}
          onOpenChange={setEmojiOpen}
          placement="topLeft"
          content={
            <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 4, maxWidth: 280 }}>
              {EMOJI_PALETTE.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => insertEmoji(emoji)}
                  style={{ fontSize: 20, background: "none", border: "none", cursor: "pointer", padding: 4 }}
                  aria-label={`Chèn biểu tượng ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          }
        >
          <Button
            type="text"
            icon={<FiSmile size={18} aria-hidden />}
            aria-label="Chọn biểu tượng cảm xúc"
            disabled={isDisabled}
          />
        </Popover>

        <Button type="text" icon={<FiImage size={18} aria-hidden />} aria-label="Gửi hình ảnh" onClick={handlePickImage} disabled={isDisabled} />
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={handleImageSelected} />

        <TextArea
          ref={textAreaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Nhập tin nhắn…"
          autoSize={{ minRows: 1, maxRows: 4 }}
          maxLength={MAX_LENGTH}
          disabled={isDisabled}
          style={{ flex: 1, borderRadius: "var(--radius-control)" }}
        />

        <Button
          type="primary"
          shape="circle"
          icon={<FiSend size={16} aria-hidden />}
          aria-label="Gửi tin nhắn"
          onClick={handleSend}
          loading={sending}
          disabled={isDisabled || !text.trim()}
        />
      </Flex>
      <div style={{ textAlign: "right", fontSize: 11, color: "var(--color-muted)", paddingRight: 4 }}>
        {text.length}/{MAX_LENGTH}
      </div>
    </div>
  );
}
