'use client';

type ErrorHandler = (error: any) => void;

class ErrorEmitter {
  private listeners: Record<string, ErrorHandler[]> = {};

  on(channel: string, handler: ErrorHandler) {
    if (!this.listeners[channel]) {
      this.listeners[channel] = [];
    }
    this.listeners[channel].push(handler);
  }

  emit(channel: string, error: any) {
    if (this.listeners[channel]) {
      this.listeners[channel].forEach((handler) => handler(error));
    }
  }

  off(channel: string, handler: ErrorHandler) {
    if (this.listeners[channel]) {
      this.listeners[channel] = this.listeners[channel].filter((h) => h !== handler);
    }
  }
}

export const errorEmitter = new ErrorEmitter();
