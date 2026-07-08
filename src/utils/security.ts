export function generateSecureId(length: number = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  // Use crypto.getRandomValues for secure randomness
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }
  
  return result;
}

export function generateWasteTag(): string {
  // Generate secure 25-character tag with alphanumeric + symbols
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';
  const array = new Uint8Array(25);
  crypto.getRandomValues(array);
  
  let tag = '';
  for (let i = 0; i < 25; i++) {
    tag += chars[array[i] % chars.length];
  }
  
  return tag;
}

export function generateSessionToken(): string {
  return generateSecureId(32);
}

export async function hashPassword(password: string): Promise<string> {
  // Use Web Crypto API for secure hashing
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'sustatio_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return formatDateTime(dateString);
}

export function validateWasteTag(tag: string): boolean {
  // Validate 25-character tag format
  const regex = /^[A-Za-z0-9!@#$%&*]{25}$/;
  return regex.test(tag);
}