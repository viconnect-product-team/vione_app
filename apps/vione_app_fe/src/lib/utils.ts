import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getVNTimeGreeting(): string {
  const utc = new Date().getTime() + new Date().getTimezoneOffset() * 60000;
  const vnTime = new Date(utc + 3600000 * 7);
  const hour = vnTime.getHours();
  if (hour >= 5 && hour < 12) {
    return "Chào buổi sáng,";
  } else if (hour >= 12 && hour < 18) {
    return "Chào buổi chiều,";
  } else {
    return "Chào buổi tối,";
  }
}
