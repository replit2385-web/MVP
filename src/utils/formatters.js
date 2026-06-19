export const formatters = {
  duration: (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = String(Math.floor(seconds % 60)).padStart(2, '0')
    return `${mins}:${secs}`
  },
  fileSize: (bytes) => {
    if (bytes < 1048576) {
      return `${(bytes / 1024).toFixed(0)} KB`
    }
    return `${(bytes / 1048576).toFixed(1)} MB`
  },
}
