export function showToast(message: string) {
  window.dispatchEvent(new CustomEvent("toast", { detail: message }));
}
