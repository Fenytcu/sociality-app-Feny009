"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-black group-[.toaster]:text-white group-[.toaster]:border-neutral-800 group-[.toaster]:shadow-2xl group-[.toaster]:rounded-xl px-4 py-3",
          success: "group-[.toaster]:bg-[#0ca661] group-[.toaster]:text-white group-[.toaster]:border-none group-[.toaster]:font-semibold group-[.toaster]:text-[15px] group-[.toaster]:h-[40px] group-[.toaster]:rounded-[8px] group-[.toaster]:min-w-[291px] group-[.toaster]:justify-center",
          error: "group-[.toaster]:bg-red-600 group-[.toaster]:text-white group-[.toaster]:border-none",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          closeButton: "group-[.toast]:bg-white/10 group-[.toast]:text-white group-[.toast]:border-none hover:group-[.toast]:bg-white/20 group-[.toast]:transition-colors",
        },
      }}
      position="top-center"
      closeButton
      icons={{
        success: null, // Remove default success icon as per image
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      {...props}
    />
  )
}

export { Toaster }
