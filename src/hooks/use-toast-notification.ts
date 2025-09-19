"use client"

import { toast } from "@/components/ui/use-toast"

export function useToastNotification() {
  const showSuccess = (message: string, title?: string) => {
    toast({
      title: title || "สำเร็จ",
      description: message,
      variant: "success",
    })
  }

  const showError = (message: string, title?: string) => {
    toast({
      title: title || "เกิดข้อผิดพลาด",
      description: message,
      variant: "destructive",
    })
  }

  const showWarning = (message: string, title?: string) => {
    toast({
      title: title || "คำเตือน",
      description: message,
      variant: "warning",
    })
  }

  const showInfo = (message: string, title?: string) => {
    toast({
      title: title || "ข้อมูล",
      description: message,
      variant: "default",
    })
  }

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  }
}